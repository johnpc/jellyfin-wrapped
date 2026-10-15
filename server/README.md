# Jellyfin Wrapped server

A small backend that lets Jellyfin Wrapped work **without putting the admin API key in the
browser**. The frontend runs in "server mode" whenever it is started without
`JELLYFIN_API_KEY`.

## How it works

1. The browser signs in to Jellyfin with the user's own account, as before.
2. It sends the page's SQL to `POST /api/playback-report` with that user's Jellyfin token
   (`Authorization: Bearer <token>`).
3. The server asks Jellyfin who the token belongs to (`GET /Users/Me`). The user id comes
   from Jellyfin, never from the request.
4. Using the admin API key, the server reads that one user's rows from the Playback
   Reporting plugin and loads them into a throwaway in-memory SQLite database (sql.js,
   WebAssembly, in a worker thread).
5. The SQL runs against that database, read-only. The response has the plugin's own shape
   (`{"colums": [...], "results": [...]}`), so the frontend's queries are unchanged.

Because the database only contains the signed-in user's rows, a query cannot read anyone
else's data, whatever it says.

## Security model

| Concern          | What the server does                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Admin API key    | Only ever sent to Jellyfin. Never in a response, a log line, or the browser.                                                                     |
| Whose data       | Taken from the verified token. Cross-user queries return nothing.                                                                                |
| What SQL may run | One `SELECT` or `WITH` statement. No writes, no `ATTACH`, no `PRAGMA`. The database is also opened `query_only`.                                 |
| Runaway queries  | Per-query timeout; the worker thread is terminated. Result limits in rows and bytes.                                                             |
| Memory bombs     | SQLite hard heap limit per user database (`QUERY_MEMORY_LIMIT_MB`).                                                                              |
| Abuse            | Per-user request rate and concurrency limits. Failed sign-ins per client address are limited; users already verified keep working.               |
| Load on Jellyfin | Verified tokens are cached for 60 s. At most `MAX_CONCURRENT_LOADS` users load data at once. Each user's data is reused for `CACHE_TTL_SECONDS`. |
| Browsers         | No CORS headers (same origin only), `Cache-Control: no-store`, strict response headers.                                                          |
| Logging          | One JSON line per notable event. Tokens and SQL text are never logged.                                                                           |

Not covered here: TLS (terminate it at your reverse proxy), and the Jellyfin login itself,
which the browser performs directly against Jellyfin. Your Jellyfin must be reachable from
users' browsers.

## Configuration

| Variable                     | Default  | Meaning                                             |
| ---------------------------- | -------- | --------------------------------------------------- |
| `JELLYFIN_SERVER_URL`        | required | Address the server uses to reach Jellyfin.          |
| `JELLYFIN_API_KEY`           | required | Admin API key.                                      |
| `JELLYFIN_API_KEY_FILE`      | -        | Read the admin key from this file instead. Keeps it out of the environment. |
| `PORT`                       | `3000`   | Listen port.                                        |
| `CACHE_TTL_SECONDS`          | `300`    | How long a user's data copy is reused.              |
| `MAX_CACHED_USERS`           | `50`     | Users held in memory at once.                       |
| `QUERY_TIMEOUT_MS`           | `5000`   | Per-query time limit.                               |
| `MAX_RESULT_ROWS`            | `200000` | Rows one query may return.                          |
| `MAX_RESULT_MB`              | `16`     | Size of one query's result.                         |
| `QUERY_MEMORY_LIMIT_MB`      | `128`    | SQLite memory per user database.                    |
| `RATE_LIMIT_PER_MINUTE`      | `300`    | Requests per user per minute.                       |
| `MAX_INFLIGHT_PER_USER`      | `4`      | Queries one user may run at once.                   |
| `MAX_QUEUED_PER_USER`        | `64`     | Queries one user may have waiting; more get a 429.  |
| `MAX_CONCURRENT_LOADS`       | `3`      | Users loading data from Jellyfin at once.           |
| `AUTH_FAIL_LIMIT_PER_MINUTE` | `20`     | Failed sign-ins per client address per minute.      |
| `TRUST_PROXY_HOPS`           | `0`      | Reverse proxies in front of this server. See below. |

### Putting it behind reverse proxies

Rate limits per client address only work if the server knows the real address. With
`TRUST_PROXY_HOPS=0` it uses the connecting address, which behind a proxy is the proxy
itself, so **every** client would share one failed-sign-in budget. Set it to the number of
proxies that append to `X-Forwarded-For` between the internet and this server (the bundled
frontend container counts as one). The server takes the entry that many places from the
right, so a client cannot choose its own address by sending the header.

Check it: make a request with a bad token and confirm the `auth_failed` log line shows your
real address, not a container address.

### Plugin retention

The Playback Reporting plugin deletes history older than its retention setting (about three
months by default). Raise it in the plugin settings if you want previous years.

## Development

Needs Node 22 or newer.

```bash
cd server
npm ci
npm test            # builds, then runs the tests
JELLYFIN_SERVER_URL=http://localhost:8096 JELLYFIN_API_KEY=... npm run dev
```

`npm run dev` builds once and starts the server; restart it after changes. The frontend's
Vite dev server proxies `/api` to `http://localhost:3000` (override with
`WRAPPED_SERVER_URL`), so run `npm run dev` in the repo root without `VITE_JELLYFIN_API_KEY`
set.
