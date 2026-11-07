import type { UserDb } from "./userdb.js";

// A replaced or evicted database is closed after this delay, so a query that is
// already running against it can finish.
const RETIRE_DELAY_MS = 30 * 1000;

interface Entry {
  promise: Promise<UserDb>;
  expires: number;
  lastUsed: number;
}

/** Keeps each user's playback data in memory for a while, and at most N users at once. */
export class UserDbCache {
  private readonly entries = new Map<string, Entry>();

  constructor(
    private readonly load: (userId: string) => Promise<UserDb>,
    private readonly ttlMs: number,
    private readonly maxUsers: number
  ) {}

  async get(userId: string): Promise<UserDb> {
    const now = Date.now();
    const existing = this.entries.get(userId);

    if (existing) {
      if (existing.expires > now) {
        existing.lastUsed = now;
        try {
          const db = await existing.promise;
          if (!db.isClosed) return db;
        } catch {
          // fall through and load again
        }
      }
      if (this.entries.get(userId) === existing) this.retire(userId, existing);
    }

    this.makeRoom();
    const entry: Entry = {
      promise: this.load(userId),
      expires: now + this.ttlMs,
      lastUsed: now,
    };
    this.entries.set(userId, entry);
    entry.promise.catch(() => {
      if (this.entries.get(userId) === entry) this.entries.delete(userId);
    });
    return entry.promise;
  }

  closeAll(): void {
    for (const [userId, entry] of this.entries) {
      this.entries.delete(userId);
      entry.promise.then((db) => db.close()).catch(() => undefined);
    }
  }

  private makeRoom(): void {
    while (this.entries.size >= this.maxUsers) {
      let oldestId: string | null = null;
      let oldest = Infinity;
      for (const [userId, entry] of this.entries) {
        if (entry.lastUsed < oldest) {
          oldest = entry.lastUsed;
          oldestId = userId;
        }
      }
      if (oldestId === null) return;
      const entry = this.entries.get(oldestId);
      if (entry) this.retire(oldestId, entry);
    }
  }

  private retire(userId: string, entry: Entry): void {
    this.entries.delete(userId);
    entry.promise
      .then((db) => {
        setTimeout(() => db.close(), RETIRE_DELAY_MS).unref();
      })
      .catch(() => undefined);
  }
}
