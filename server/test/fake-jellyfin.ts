import assert from "node:assert/strict";
import http from "node:http";

export const ADMIN_KEY = "admin-key-that-must-stay-on-the-server";
export const ALICE = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
export const BOB = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
/** A user with no recorded plays. */
export const CAROL = "cccccccccccccccccccccccccccccccc";
export const TOKENS: Record<string, { id: string; name: string }> = {
  "token-alice": { id: ALICE, name: "alice" },
  "token-bob": { id: BOB, name: "bob" },
  "token-carol": { id: CAROL, name: "carol" },
};

export const COLUMNS = [
  "DateCreated",
  "UserId",
  "ItemId",
  "ItemType",
  "ItemName",
  "PlaybackMethod",
  "ClientName",
  "DeviceName",
  "PlayDuration",
];
export const SCHEMA = [
  ["DateCreated", "DATETIME"],
  ["UserId", "TEXT"],
  ["ItemId", "TEXT"],
  ["ItemType", "TEXT"],
  ["ItemName", "TEXT"],
  ["PlaybackMethod", "TEXT"],
  ["ClientName", "TEXT"],
  ["DeviceName", "TEXT"],
  ["PlayDuration", "INT"],
];

// [rowid, ...columns]
export const TABLE: string[][] = [
  [
    "1",
    "2025-01-10 20:00:00",
    ALICE,
    "m1",
    "Movie",
    "Movie One",
    "DirectPlay",
    "web",
    "tv",
    "7200",
  ],
  [
    "2",
    "2025-02-11 20:00:00",
    BOB,
    "m2",
    "Movie",
    "Movie Two",
    "DirectPlay",
    "web",
    "tv",
    "5400",
  ],
  [
    "3",
    "2025-03-12 20:00:00",
    ALICE,
    "e1",
    "Episode",
    "Show - s01e01",
    "DirectPlay",
    "web",
    "tv",
    "1500",
  ],
  [
    "4",
    "2025-04-13 20:00:00",
    ALICE,
    "a1",
    "Audio",
    "Song One",
    "DirectPlay",
    "app",
    "phone",
    "90",
  ],
  [
    "5",
    "2025-05-14 20:00:00",
    BOB,
    "a2",
    "Audio",
    "Song Two",
    "DirectPlay",
    "app",
    "phone",
    "200",
  ],
];

export interface Call {
  path: string;
  token: string | undefined;
  query?: string;
}

export function startFakeJellyfin(calls: Call[]): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    const token = req.headers["x-emby-token"];
    const tokenValue = typeof token === "string" ? token : undefined;
    const path = req.url ?? "";
    const json = (status: number, body: unknown): void => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(body));
    };

    if (path === "/Users/Me") {
      calls.push({ path, token: tokenValue });
      const user = tokenValue ? TOKENS[tokenValue] : undefined;
      if (!user) return json(401, {});
      return json(200, {
        Id: user.id,
        Name: user.name,
        Policy: { IsDisabled: false },
      });
    }

    if (
      path === "/user_usage_stats/submit_custom_query" &&
      req.method === "POST"
    ) {
      let raw = "";
      req.on("data", (c: Buffer) => (raw += c.toString()));
      req.on("end", () => {
        const query = (JSON.parse(raw) as { CustomQueryString: string })
          .CustomQueryString;
        calls.push({ path, token: tokenValue, query });
        if (tokenValue !== ADMIN_KEY) return json(401, {});

        if (query.includes("pragma_table_info")) {
          return json(200, { colums: ["name", "type"], results: SCHEMA });
        }
        const match = /WHERE UserId = '([0-9a-f]+)'/.exec(query);
        if (match) {
          const rows = TABLE.filter((r) => r[2] === match[1]).map((r) => [
            r[0] as string,
            ...r.slice(1),
          ]);
          // Like the real plugin, send no column names when there are no rows.
          if (rows.length === 0) return json(200, { colums: [], results: [] });
          // The fake keeps the real table's column order: rowid first, then the table columns.
          const ordered = rows.map((r) => [r[0] as string, ...r.slice(1)]);
          return json(200, {
            colums: ["__rowid", ...COLUMNS],
            results: ordered,
          });
        }
        return json(400, {});
      });
      return;
    }
    json(404, {});
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve(server))
  );
}

// The table above stores columns as [rowid, DateCreated, UserId, ...]; keep it in step with COLUMNS.
assert.equal((TABLE[0] as string[]).length, COLUMNS.length + 1);
