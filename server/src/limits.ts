import type http from "node:http";

const MAX_TRACKED_KEYS = 10000;

/** Lets a few tasks per key run at once and queues a bounded number of the rest. */
export class ConcurrencyGate {
  private readonly running = new Map<string, number>();
  private readonly waiting = new Map<string, Array<() => void>>();

  constructor(
    private readonly maxRunning: number,
    private readonly maxQueued: number
  ) {}

  /** Resolves with a release function once a slot is free, or null if the queue is full. */
  acquire(key: string): Promise<(() => void) | null> {
    const running = this.running.get(key) ?? 0;
    if (running < this.maxRunning) {
      this.running.set(key, running + 1);
      return Promise.resolve(() => this.release(key));
    }
    const queue = this.waiting.get(key) ?? [];
    if (queue.length >= this.maxQueued) return Promise.resolve(null);
    return new Promise((resolve) => {
      queue.push(() => resolve(() => this.release(key)));
      this.waiting.set(key, queue);
    });
  }

  private release(key: string): void {
    const queue = this.waiting.get(key);
    const next = queue?.shift();
    if (queue?.length === 0) this.waiting.delete(key);
    // Hand the slot straight to the next waiter; the running count stays the same.
    if (next) return next();
    const left = (this.running.get(key) ?? 1) - 1;
    if (left <= 0) this.running.delete(key);
    else this.running.set(key, left);
  }
}

/** Counts events per key in one-minute windows. */
export class RateLimiter {
  private readonly windows = new Map<
    string,
    { start: number; count: number }
  >();

  constructor(
    private readonly limitPerMinute: number,
    private readonly now: () => number = Date.now
  ) {}

  /** Record one event. Returns the seconds to wait if the key is over its limit, otherwise 0. */
  hit(key: string): number {
    const now = this.now();
    let entry = this.windows.get(key);
    if (!entry || now - entry.start >= 60000) {
      if (!entry && this.windows.size >= MAX_TRACKED_KEYS) this.evict(now);
      entry = { start: now, count: 0 };
      this.windows.set(key, entry);
    }
    entry.count += 1;
    if (entry.count <= this.limitPerMinute) return 0;
    return Math.max(1, Math.ceil((entry.start + 60000 - now) / 1000));
  }

  /** Whether the key is already over its limit, without recording an event. */
  blocked(key: string): number {
    const entry = this.windows.get(key);
    const now = this.now();
    if (!entry || now - entry.start >= 60000) return 0;
    if (entry.count < this.limitPerMinute) return 0;
    return Math.max(1, Math.ceil((entry.start + 60000 - now) / 1000));
  }

  private evict(now: number): void {
    for (const [key, entry] of this.windows) {
      if (now - entry.start >= 60000) this.windows.delete(key);
    }
    // Still full of live windows: drop the oldest so memory stays bounded.
    while (this.windows.size >= MAX_TRACKED_KEYS) {
      const oldest = this.windows.keys().next().value;
      if (oldest === undefined) break;
      this.windows.delete(oldest);
    }
  }
}

/** Runs at most `limit` tasks at once; the rest wait in order. */
export class Semaphore {
  private active = 0;
  private readonly waiting: Array<() => void> = [];

  constructor(private readonly limit: number) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.limit) {
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    }
    this.active += 1;
    try {
      return await task();
    } finally {
      this.active -= 1;
      this.waiting.shift()?.();
    }
  }
}

/**
 * The address of the real client. With no trusted proxy this is the socket address.
 * With N trusted proxies it is the Nth entry from the right of X-Forwarded-For, so a
 * client cannot choose its own address by sending that header.
 */
export function clientIp(
  req: http.IncomingMessage,
  trustedHops: number
): string {
  const socketIp = req.socket.remoteAddress ?? "unknown";
  if (trustedHops <= 0) return socketIp;
  const header = req.headers["x-forwarded-for"];
  const raw = Array.isArray(header) ? header.join(",") : header;
  if (!raw) return socketIp;
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts[parts.length - trustedHops] ?? socketIp;
}

/** One JSON line per event. Never pass tokens or query text here. */
export function logEvent(
  event: string,
  fields: Record<string, unknown> = {}
): void {
  console.log(
    JSON.stringify({ time: new Date().toISOString(), event, ...fields })
  );
}
