import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";

const base = { JELLYFIN_SERVER_URL: "http://jellyfin:8096/" };

describe("admin key configuration", () => {
  it("reads the key from the environment", () => {
    const config = loadConfig({ ...base, JELLYFIN_API_KEY: "abc123" });
    assert.equal(config.apiKey, "abc123");
    assert.equal(config.jellyfinUrl, "http://jellyfin:8096");
  });

  it("reads the key from a file and trims the line ending", () => {
    const config = loadConfig(
      { ...base, JELLYFIN_API_KEY_FILE: "/run/key" },
      (path) => {
        assert.equal(path, "/run/key");
        return "abc123\n";
      }
    );
    assert.equal(config.apiKey, "abc123");
  });

  it("refuses both a key and a key file", () => {
    assert.throws(
      () =>
        loadConfig(
          { ...base, JELLYFIN_API_KEY: "a", JELLYFIN_API_KEY_FILE: "/run/key" },
          () => "b"
        ),
      /not both/
    );
  });

  it("fails clearly when the file cannot be read, without printing its contents", () => {
    assert.throws(
      () =>
        loadConfig({ ...base, JELLYFIN_API_KEY_FILE: "/run/key" }, () => {
          throw new Error("EACCES: secret-looking detail");
        }),
      (error: Error) =>
        /Cannot read JELLYFIN_API_KEY_FILE \(\/run\/key\)/.test(
          error.message
        ) && !error.message.includes("secret-looking")
    );
  });

  it("fails when the file is empty or nothing is set", () => {
    assert.throws(
      () =>
        loadConfig({ ...base, JELLYFIN_API_KEY_FILE: "/run/key" }, () => "\n"),
      /must be set/
    );
    assert.throws(() => loadConfig({ ...base }), /must be set/);
  });
});
