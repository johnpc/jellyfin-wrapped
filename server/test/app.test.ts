import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type http from "node:http";
import type { AddressInfo } from "node:net";
import { createApp, type App } from "../src/app.js";
import type { Config } from "../src/config.js";
import { JellyfinClient } from "../src/jellyfin.js";

import {
  ADMIN_KEY,
  ALICE,
  BOB,
  startFakeJellyfin,
  type Call,
} from "./fake-jellyfin.js";

describe("playback report proxy", () => {
  const calls: Call[] = [];
  let fake: http.Server;
  let app: App;
  let base: string;

  before(async () => {
    fake = await startFakeJellyfin(calls);
    const jellyfinUrl = `http://127.0.0.1:${(fake.address() as AddressInfo).port}`;
    const config: Config = {
      jellyfinUrl,
      apiKey: ADMIN_KEY,
      port: 0,
      cacheTtlMs: 60000,
      maxCachedUsers: 5,
      queryTimeoutMs: 500,
      maxResultRows: 100,
      maxResultBytes: 1024 * 1024,
      queryMemoryLimitMb: 128,
      rateLimitPerMinute: 1000,
      maxInflightPerUser: 4,
      maxQueuedPerUser: 64,
      maxConcurrentLoads: 3,
      authFailLimitPerMinute: 1000,
      trustProxyHops: 0,
    };
    app = createApp({ config, jellyfin: new JellyfinClient(config) });
    await new Promise<void>((resolve) =>
      app.server.listen(0, "127.0.0.1", resolve)
    );
    base = `http://127.0.0.1:${(app.server.address() as AddressInfo).port}`;
  });

  after(async () => {
    await app.close();
    fake.closeAllConnections();
    await new Promise<void>((resolve) => fake.close(() => resolve()));
  });

  async function query(
    sql: string,
    token: string | null = "token-alice"
  ): Promise<{
    status: number;
    body: { colums?: string[]; results?: string[][]; error?: string };
  }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${base}/api/playback-report`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: sql }),
    });
    return {
      status: res.status,
      body: (await res.json()) as {
        colums?: string[];
        results?: string[][];
        error?: string;
      },
    };
  }

  it("answers the health check", async () => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.status, 200);
  });

  it("rejects requests without a valid token", async () => {
    assert.equal((await query("SELECT 1", null)).status, 401);
    assert.equal((await query("SELECT 1", "not-a-token")).status, 401);
  });

  it("only returns the logged-in user's rows", async () => {
    const alice = await query("SELECT COUNT(*) FROM PlaybackActivity");
    assert.deepEqual(alice.body.results, [["3"]]);
    const bob = await query(
      "SELECT COUNT(*) FROM PlaybackActivity",
      "token-bob"
    );
    assert.deepEqual(bob.body.results, [["2"]]);
  });

  it("cannot reach another user's rows by asking for them", async () => {
    const res = await query(
      `SELECT * FROM PlaybackActivity WHERE UserId = '${BOB}'`
    );
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.results, []);
  });

  it("answers a user who has no plays", async () => {
    const res = await query(
      "SELECT COUNT(*) FROM PlaybackActivity",
      "token-carol"
    );
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.results, [["0"]]);
  });

  it("fetches each user's data once and reuses it", async () => {
    const before = calls.filter((c) =>
      c.query?.includes("WHERE UserId")
    ).length;
    await query("SELECT 1");
    await query("SELECT 2");
    const after = calls.filter((c) => c.query?.includes("WHERE UserId")).length;
    assert.equal(after, before);
  });

  it("returns the plugin's response shape, with text values", async () => {
    const res = await query(
      "SELECT ItemName, PlayDuration FROM PlaybackActivity WHERE ItemType = 'Movie'"
    );
    assert.deepEqual(res.body.colums, ["ItemName", "PlayDuration"]);
    assert.deepEqual(res.body.results, [["Movie One", "7200"]]);
  });

  it("compares numbers as numbers", async () => {
    const res = await query(
      "SELECT COUNT(*) FROM PlaybackActivity WHERE PlayDuration > 100"
    );
    assert.deepEqual(res.body.results, [["2"]]);
  });

  it("keeps the plugin's rowid", async () => {
    const res = await query(
      "SELECT ROWID, * FROM PlaybackActivity ORDER BY rowid DESC"
    );
    assert.equal((res.body.results?.[0] as string[])[0], "4");
    assert.equal(res.body.results?.length, 3);
  });

  it("accepts WITH queries", async () => {
    const res = await query(
      "WITH x AS (SELECT * FROM PlaybackActivity) SELECT COUNT(*) FROM x"
    );
    assert.deepEqual(res.body.results, [["3"]]);
  });

  it("refuses anything that is not a single SELECT", async () => {
    const attempts = [
      "DELETE FROM PlaybackActivity",
      "DROP TABLE PlaybackActivity",
      "UPDATE PlaybackActivity SET PlayDuration = 0",
      "ATTACH DATABASE '/tmp/x.db' AS x",
      "PRAGMA query_only = OFF",
      "SELECT 1; DELETE FROM PlaybackActivity",
      "/* hi */ DELETE FROM PlaybackActivity",
      "WITH x AS (SELECT 1) DELETE FROM PlaybackActivity",
    ];
    for (const sql of attempts) {
      const res = await query(sql);
      assert.equal(res.status, 400, `accepted: ${sql}`);
    }
    const count = await query("SELECT COUNT(*) FROM PlaybackActivity");
    assert.deepEqual(count.body.results, [["3"]]);
  });

  it("reports SQL errors as 400", async () => {
    assert.equal((await query("SELECT * FROM nonexistent")).status, 400);
  });

  it("limits result size", async () => {
    const res = await query(
      "WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM c WHERE x < 1000) SELECT x FROM c"
    );
    assert.equal(res.status, 400);
    assert.match(res.body.error ?? "", /larger than/);
  });

  it("stops a runaway query and keeps working afterwards", async () => {
    const started = Date.now();
    const slow = await query(
      "WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM c WHERE x < 2000000000) SELECT COUNT(*) FROM c"
    );
    assert.equal(slow.status, 504);
    assert.ok(Date.now() - started < 5000);
    const next = await query("SELECT COUNT(*) FROM PlaybackActivity");
    assert.equal(next.status, 200);
    assert.deepEqual(next.body.results, [["3"]]);
  });

  it("validates the request body", async () => {
    const res = await fetch(`${base}/api/playback-report`, {
      method: "POST",
      headers: {
        Authorization: "Bearer token-alice",
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    assert.equal(res.status, 400);
  });

  it("keeps the admin key away from users and user tokens away from the plugin", async () => {
    for (const call of calls) {
      if (call.path === "/Users/Me") assert.notEqual(call.token, ADMIN_KEY);
      else assert.equal(call.token, ADMIN_KEY);
    }
    const res = await fetch(`${base}/api/health`);
    assert.ok(!JSON.stringify([...res.headers.entries()]).includes(ADMIN_KEY));
  });
});
