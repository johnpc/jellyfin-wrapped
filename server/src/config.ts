export interface Config {
  /** Address the server uses to reach Jellyfin (can differ from the address browsers use). */
  jellyfinUrl: string;
  /** Admin API key. Only ever sent to Jellyfin, never to browsers. */
  apiKey: string;
  port: number;
  /** How long a user's playback data copy is reused before it is fetched again. */
  cacheTtlMs: number;
  /** Maximum number of users whose data is held in memory at once. */
  maxCachedUsers: number;
  /** Per-query time limit. A query that exceeds it is stopped. */
  queryTimeoutMs: number;
  /** Maximum number of rows a single query may return. */
  maxResultRows: number;
  /** Maximum total size of one query's result, in bytes of text. */
  maxResultBytes: number;
  /** Memory SQLite may use per user database, in MiB. Stops string-bomb queries. */
  queryMemoryLimitMb: number;
  /** Requests per minute allowed for one signed-in user. */
  rateLimitPerMinute: number;
  /** Queries one user may run at the same time. */
  maxInflightPerUser: number;
  /** Queries one user may have waiting for a free slot before new ones are refused. */
  maxQueuedPerUser: number;
  /** Users whose data may be loading from Jellyfin at the same time. */
  maxConcurrentLoads: number;
  /** Failed sign-ins per minute allowed from one client address. */
  authFailLimitPerMinute: number;
  /** Number of reverse proxies in front of this server (0 = none, use the socket address). */
  trustProxyHops: number;
}

function intFromEnv(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: number,
  min: number,
  max: number
): number {
  const raw = env[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const jellyfinUrl = env.JELLYFIN_SERVER_URL?.replace(/\/+$/, "");
  const apiKey = env.JELLYFIN_API_KEY;
  if (!jellyfinUrl || !apiKey) {
    throw new Error("JELLYFIN_SERVER_URL and JELLYFIN_API_KEY must be set");
  }

  return {
    jellyfinUrl,
    apiKey,
    port: intFromEnv(env, "PORT", 3000, 1, 65535),
    cacheTtlMs: intFromEnv(env, "CACHE_TTL_SECONDS", 300, 1, 86400) * 1000,
    maxCachedUsers: intFromEnv(env, "MAX_CACHED_USERS", 50, 1, 1000),
    queryTimeoutMs: intFromEnv(env, "QUERY_TIMEOUT_MS", 5000, 100, 60000),
    maxResultRows: intFromEnv(env, "MAX_RESULT_ROWS", 200000, 1, 5000000),
    maxResultBytes: intFromEnv(env, "MAX_RESULT_MB", 16, 1, 512) * 1024 * 1024,
    queryMemoryLimitMb: intFromEnv(env, "QUERY_MEMORY_LIMIT_MB", 128, 16, 2048),
    rateLimitPerMinute: intFromEnv(
      env,
      "RATE_LIMIT_PER_MINUTE",
      300,
      1,
      100000
    ),
    maxInflightPerUser: intFromEnv(env, "MAX_INFLIGHT_PER_USER", 4, 1, 100),
    maxQueuedPerUser: intFromEnv(env, "MAX_QUEUED_PER_USER", 64, 0, 1000),
    maxConcurrentLoads: intFromEnv(env, "MAX_CONCURRENT_LOADS", 3, 1, 100),
    authFailLimitPerMinute: intFromEnv(
      env,
      "AUTH_FAIL_LIMIT_PER_MINUTE",
      20,
      1,
      100000
    ),
    trustProxyHops: intFromEnv(env, "TRUST_PROXY_HOPS", 0, 0, 10),
  };
}
