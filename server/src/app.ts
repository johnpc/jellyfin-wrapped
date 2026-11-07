import http from "node:http";
import type { Config } from "./config.js";
import { JellyfinClient, UpstreamError } from "./jellyfin.js";
import { UserDbCache } from "./cache.js";
import {
  ConcurrencyGate,
  RateLimiter,
  Semaphore,
  clientIp,
  logEvent,
} from "./limits.js";
import {
  DatabaseClosedError,
  QueryError,
  QueryTimeoutError,
  UserDb,
} from "./userdb.js";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_QUERY_CHARS = 20000;

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly retryAfterSeconds?: number
  ) {
    super(message);
  }
}

function sendJson(
  res: http.ServerResponse,
  status: number,
  body: unknown,
  extraHeaders: Record<string, string | number> = {}
): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "Referrer-Policy": "no-referrer",
    ...extraHeaders,
  });
  res.end(payload);
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, "Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function bearerToken(req: http.IncomingMessage): string | null {
  const header = req.headers.authorization;
  if (typeof header !== "string") return null;
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  return match?.[1] ?? null;
}

function parseQuery(body: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new HttpError(400, "Body must be JSON");
  }
  const query = (parsed as { query?: unknown } | null)?.query;
  if (
    typeof query !== "string" ||
    query.trim() === "" ||
    query.length > MAX_QUERY_CHARS
  ) {
    throw new HttpError(400, 'Body must be {"query": "<SQL>"}');
  }
  return query;
}

export interface App {
  server: http.Server;
  close(): Promise<void>;
}

export function createApp({
  config,
  jellyfin,
}: {
  config: Config;
  jellyfin: JellyfinClient;
}): App {
  // Loading a user's data is the expensive step. Many cold users at once would pile up
  // on the Jellyfin plugin and on memory, so only a few load at the same time.
  const loads = new Semaphore(config.maxConcurrentLoads);
  const cache = new UserDbCache(
    (userId) =>
      loads.run(async () =>
        UserDb.create(await jellyfin.fetchUserActivity(userId), {
          maxRows: config.maxResultRows,
          maxBytes: config.maxResultBytes,
          memoryLimitMb: config.queryMemoryLimitMb,
        })
      ),
    config.cacheTtlMs,
    config.maxCachedUsers
  );
  const userLimiter = new RateLimiter(config.rateLimitPerMinute);
  const authFailLimiter = new RateLimiter(config.authFailLimitPerMinute);
  const gate = new ConcurrencyGate(
    config.maxInflightPerUser,
    config.maxQueuedPerUser
  );

  async function handlePlaybackReport(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const ip = clientIp(req, config.trustProxyHops);

    const token = bearerToken(req);

    // A client that keeps sending bad tokens is cut off before it costs Jellyfin lookups.
    // Users this server already verified keep working, so one bad actor on a shared
    // address cannot lock everyone else out.
    const blockedFor = authFailLimiter.blocked(ip);
    if (blockedFor > 0 && !(token && jellyfin.cachedUser(token))) {
      logEvent("auth_blocked", { ip });
      throw new HttpError(429, "Too many failed sign-ins", blockedFor);
    }

    const user = token ? await jellyfin.verifyToken(token) : null;
    if (!user) {
      authFailLimiter.hit(ip);
      logEvent("auth_failed", { ip });
      throw new HttpError(
        401,
        token ? "Invalid or expired session" : "Authentication required"
      );
    }

    const waitSeconds = userLimiter.hit(user.id);
    if (waitSeconds > 0) {
      logEvent("rate_limited", { ip, user: user.id });
      throw new HttpError(429, "Too many requests", waitSeconds);
    }
    // The page sends many queries at once; run a few and queue the rest instead of failing them.
    const release = await gate.acquire(user.id);
    if (!release) {
      throw new HttpError(429, "Too many queries at once", 1);
    }
    try {
      const query = parseQuery(await readBody(req));
      // The data comes from the verified user id, never from anything the client sent.
      const db = await cache.get(user.id);
      const result = await db.query(query, config.queryTimeoutMs);
      // Same shape (including the "colums" spelling) the playback reporting plugin returns.
      sendJson(res, 200, { colums: result.columns, results: result.rows });
    } finally {
      release();
    }
  }

  const server = http.createServer((req, res) => {
    const path = new URL(req.url ?? "/", "http://localhost").pathname;

    const run = async (): Promise<void> => {
      if (path === "/api/health") {
        if (req.method !== "GET")
          throw new HttpError(405, "Method not allowed");
        sendJson(res, 200, { status: "ok" });
        return;
      }
      if (path === "/api/playback-report") {
        if (req.method !== "POST")
          throw new HttpError(405, "Method not allowed");
        await handlePlaybackReport(req, res);
        return;
      }
      throw new HttpError(404, "Not found");
    };

    run().catch((error: unknown) => {
      if (res.headersSent) return;
      if (error instanceof HttpError) {
        const extra: Record<string, number> = {};
        if (error.retryAfterSeconds !== undefined) {
          extra["Retry-After"] = error.retryAfterSeconds;
        }
        return sendJson(res, error.status, { error: error.message }, extra);
      }
      if (error instanceof QueryTimeoutError) {
        logEvent("query_timeout");
        return sendJson(res, 504, { error: error.message });
      }
      if (error instanceof QueryError)
        return sendJson(res, 400, { error: error.message });
      if (error instanceof DatabaseClosedError)
        return sendJson(res, 503, { error: error.message });
      if (error instanceof UpstreamError)
        return sendJson(res, error.status, { error: error.message });
      console.error("[server] Unexpected error:", error);
      sendJson(res, 500, { error: "Internal error" });
    });
  });

  // Slow or stalled connections give up instead of holding sockets open.
  server.headersTimeout = 10000;
  server.requestTimeout = 30000;
  server.keepAliveTimeout = 5000;

  return {
    server,
    close: () =>
      new Promise<void>((resolve) => {
        cache.closeAll();
        server.close(() => resolve());
        server.closeAllConnections();
      }),
  };
}
