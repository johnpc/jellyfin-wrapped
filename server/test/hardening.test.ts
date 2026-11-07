import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type http from "node:http";
import type { AddressInfo } from "node:net";
import { createApp, type App } from "../src/app.js";
import type { Config } from "../src/config.js";
import { JellyfinClient } from "../src/jellyfin.js";
import { RateLimiter, Semaphore, clientIp } from "../src/limits.js";
import { ADMIN_KEY, startFakeJellyfin, type Call } from "./fake-jellyfin.js";

describe("RateLimiter", () => {
  it("allows the limit, then reports how long to wait, then resets", () => {
    let now = 1_000_000;
    const limiter = new RateLimiter(2, () => now);
    assert.equal(limiter.hit("a"), 0);
    assert.equal(limiter.hit("a"), 0);
    assert.ok(limiter.hit("a") > 0);
    assert.equal(limiter.hit("b"), 0, "other keys are independent");
    now += 61_000;
    assert.equal(limiter.hit("a"), 0);
  });

  it("blocked() does not count as an event", () => {
    const limiter = new RateLimiter(1, () => 5);
    assert.equal(limiter.blocked("a"), 0);
    limiter.hit("a");
    assert.ok(limiter.blocked("a") > 0);
  });
});

describe("Semaphore", () => {
  it("never runs more than the limit at once", async () => {
    const semaphore = new Semaphore(2);
    let active = 0;
    let peak = 0;
    const task = async (): Promise<void> => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((r) => setTimeout(r, 10));
      active -= 1;
    };
    await Promise.all(Array.from({ length: 8 }, () => semaphore.run(task)));
    assert.equal(peak, 2);
  });

  it("keeps going after a task fails", async () => {
    const semaphore = new Semaphore(1);
    await assert.rejects(semaphore.run(() => Promise.reject(new Error("x"))));
    assert.equal(await semaphore.run(() => Promise.resolve(7)), 7);
  });
});

describe("clientIp", () => {
  const req = (
    forwarded: string | undefined,
    socket = "10.0.0.5"
  ): http.IncomingMessage =>
    ({
      socket: { remoteAddress: socket },
      headers: forwarded === undefined ? {} : { "x-forwarded-for": forwarded },
    }) as unknown as http.IncomingMessage;

  it("uses the socket address when no proxy is trusted, ignoring the header", () => {
    assert.equal(clientIp(req("1.1.1.1"), 0), "10.0.0.5");
  });

  it("takes the entry the trusted proxy appended, not one the client chose", () => {
    // The client claimed 1.1.1.1; the single trusted proxy saw 9.9.9.9.
    assert.equal(clientIp(req("1.1.1.1, 9.9.9.9"), 1), "9.9.9.9");
    assert.equal(clientIp(req("1.1.1.1, 9.9.9.9, 8.8.8.8"), 2), "9.9.9.9");
  });

  it("falls back to the socket address when the header is missing or too short", () => {
    assert.equal(clientIp(req(undefined), 1), "10.0.0.5");
    assert.equal(clientIp(req("9.9.9.9"), 2), "10.0.0.5");
  });
});

describe("limits on the running server", () => {
  const calls: Call[] = [];
  let fake: http.Server;
  let jellyfinUrl: string;

  before(async () => {
    fake = await startFakeJellyfin(calls);
    jellyfinUrl = `http://127.0.0.1:${(fake.address() as AddressInfo).port}`;
  });

  after(async () => {
    fake.closeAllConnections();
    await new Promise<void>((resolve) => fake.close(() => resolve()));
  });

  async function withApp(
    overrides: Partial<Config>,
    run: (
      query: (sql: string, token?: string) => Promise<Response>
    ) => Promise<void>
  ): Promise<void> {
    const config: Config = {
      jellyfinUrl,
      apiKey: ADMIN_KEY,
      port: 0,
      cacheTtlMs: 60000,
      maxCachedUsers: 5,
      queryTimeoutMs: 500,
      maxResultRows: 1000,
      maxResultBytes: 1024 * 1024,
      queryMemoryLimitMb: 16,
      rateLimitPerMinute: 1000,
      maxInflightPerUser: 4,
      maxQueuedPerUser: 64,
      maxConcurrentLoads: 3,
      authFailLimitPerMinute: 1000,
      trustProxyHops: 0,
      ...overrides,
    };
    const app: App = createApp({
      config,
      jellyfin: new JellyfinClient(config),
    });
    await new Promise<void>((resolve) =>
      app.server.listen(0, "127.0.0.1", resolve)
    );
    const base = `http://127.0.0.1:${(app.server.address() as AddressInfo).port}`;
    try {
      await run((sql, token = "token-alice") =>
        fetch(`${base}/api/playback-report`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: sql }),
        })
      );
    } finally {
      await app.close();
    }
  }

  it("limits requests per user and tells the client when to retry", async () => {
    await withApp({ rateLimitPerMinute: 3 }, async (query) => {
      for (let i = 0; i < 3; i++)
        assert.equal((await query("SELECT 1")).status, 200);
      const limited = await query("SELECT 1");
      assert.equal(limited.status, 429);
      assert.ok(Number(limited.headers.get("retry-after")) > 0);
      assert.equal(
        (await query("SELECT 1", "token-bob")).status,
        200,
        "another user is unaffected"
      );
    });
  });

  it("cuts off a client that keeps sending bad tokens, but not users already verified", async () => {
    await withApp({ authFailLimitPerMinute: 3 }, async (query) => {
      assert.equal(
        (await query("SELECT 1")).status,
        200,
        "alice verifies first"
      );
      for (let i = 0; i < 3; i++)
        assert.equal((await query("SELECT 1", "bad-token")).status, 401);
      const blocked = await query("SELECT 1", "another-bad-token");
      assert.equal(blocked.status, 429);
      const callsBefore = calls.filter((c) => c.path === "/Users/Me").length;
      assert.equal((await query("SELECT 1", "yet-another")).status, 429);
      assert.equal(
        calls.filter((c) => c.path === "/Users/Me").length,
        callsBefore,
        "a blocked client no longer costs Jellyfin lookups"
      );
      assert.equal(
        (await query("SELECT 1")).status,
        200,
        "a verified user still works"
      );
    });
  });

  it("queues queries beyond the running limit and runs them in turn", async () => {
    await withApp(
      { maxInflightPerUser: 1, maxQueuedPerUser: 8 },
      async (query) => {
        const results = await Promise.all(
          Array.from({ length: 6 }, (_, i) => query(`SELECT ${i}`))
        );
        assert.deepEqual(
          results.map((r) => r.status),
          [200, 200, 200, 200, 200, 200]
        );
      }
    );
  });

  it("rejects queries once the queue is full", async () => {
    await withApp(
      { maxInflightPerUser: 1, maxQueuedPerUser: 1, queryTimeoutMs: 1500 },
      async (query) => {
        const slow = query(
          "WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM c WHERE x < 2000000000) SELECT COUNT(*) FROM c"
        );
        await new Promise((r) => setTimeout(r, 150));
        const queued = query("SELECT 1");
        await new Promise((r) => setTimeout(r, 50));
        assert.equal((await query("SELECT 2")).status, 429);
        assert.equal((await slow).status, 504);
        assert.equal((await queued).status, 200);
      }
    );
  });

  it("rejects a second query while one is still running", async () => {
    await withApp(
      { maxInflightPerUser: 1, maxQueuedPerUser: 0, queryTimeoutMs: 1500 },
      async (query) => {
        const slow = query(
          "WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM c WHERE x < 2000000000) SELECT COUNT(*) FROM c"
        );
        await new Promise((r) => setTimeout(r, 150));
        assert.equal((await query("SELECT 1")).status, 429);
        assert.equal((await slow).status, 504);
      }
    );
  });

  it("survives a query that tries to build enormous strings", async () => {
    await withApp(
      { queryMemoryLimitMb: 16, queryTimeoutMs: 5000 },
      async (query) => {
        const bomb = await query(
          "WITH RECURSIVE c(s) AS (SELECT 'aaaaaaaaaaaaaaaa' UNION ALL SELECT s||s FROM c WHERE length(s) < 2000000000) SELECT length(s) FROM c ORDER BY 1 DESC LIMIT 1"
        );
        assert.equal(bomb.status, 400);
        const next = await query("SELECT COUNT(*) FROM PlaybackActivity");
        assert.equal(next.status, 200, "the same user can keep querying");
        assert.deepEqual(
          ((await next.json()) as { results: string[][] }).results,
          [["3"]]
        );
      }
    );
  });

  it("limits the size of a result, not just its row count", async () => {
    await withApp({ maxResultBytes: 64 * 1024 }, async (query) => {
      const res = await query("SELECT hex(zeroblob(100000))");
      assert.equal(res.status, 400);
      assert.match(
        ((await res.json()) as { error: string }).error,
        /size limit/
      );
    });
  });

  it("sends hardening headers on every response", async () => {
    await withApp({}, async (query) => {
      const res = await query("SELECT 1");
      assert.equal(res.headers.get("cache-control"), "no-store");
      assert.equal(res.headers.get("x-content-type-options"), "nosniff");
      assert.match(
        res.headers.get("content-security-policy") ?? "",
        /default-src 'none'/
      );
      assert.equal(
        res.headers.get("access-control-allow-origin"),
        null,
        "no CORS: same-origin only"
      );
    });
  });
});
