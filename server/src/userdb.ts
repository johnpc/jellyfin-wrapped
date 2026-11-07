import { Worker } from "node:worker_threads";
import type { ActivityData } from "./jellyfin.js";
import type { InitData, WorkerRequest, WorkerResponse } from "./worker.js";

/** The SQL was rejected or failed (bad syntax, not a SELECT, result too large). */
export class QueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QueryError";
  }
}

/** The query ran past its time limit and was stopped. */
export class QueryTimeoutError extends Error {
  constructor() {
    super("Query took too long");
    this.name = "QueryTimeoutError";
  }
}

/** The database was shut down while a query was waiting. Retrying is safe. */
export class DatabaseClosedError extends Error {
  constructor() {
    super("Database was reset, please retry");
    this.name = "DatabaseClosedError";
  }
}

export interface QueryResult {
  columns: string[];
  rows: string[][];
}

interface Pending {
  resolve: (result: QueryResult) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
}

/** One user's playback data, held in a worker thread so a slow query can be stopped. */
export class UserDb {
  private readonly pending = new Map<number, Pending>();
  private nextId = 1;
  private closed = false;
  private readonly ready: Promise<void>;

  private constructor(private readonly worker: Worker) {
    let markReady: () => void = () => undefined;
    let markFailed: (error: Error) => void = () => undefined;
    this.ready = new Promise<void>((resolve, reject) => {
      markReady = resolve;
      markFailed = reject;
    });
    this.ready.catch(() => undefined);

    worker.on("message", (message: WorkerResponse) => {
      if (message.type === "ready") {
        markReady();
        return;
      }
      const entry = this.pending.get(message.id);
      if (!entry) return;
      this.pending.delete(message.id);
      clearTimeout(entry.timer);
      if (message.ok)
        entry.resolve({ columns: message.columns, rows: message.rows });
      else entry.reject(new QueryError(message.error));
    });
    worker.on("error", (error) => {
      markFailed(error);
      this.shutDown();
    });
    worker.on("exit", () => {
      markFailed(new DatabaseClosedError());
      this.shutDown();
    });
  }

  static async create(
    data: ActivityData,
    limits: { maxRows: number; maxBytes: number; memoryLimitMb: number }
  ): Promise<UserDb> {
    const init: InitData = {
      columns: data.columns,
      rows: data.rows,
      ...limits,
    };
    const db = new UserDb(
      new Worker(new URL("./worker.js", import.meta.url), { workerData: init })
    );
    await db.ready;
    return db;
  }

  get isClosed(): boolean {
    return this.closed;
  }

  query(sql: string, timeoutMs: number): Promise<QueryResult> {
    if (this.closed) return Promise.reject(new DatabaseClosedError());

    return new Promise<QueryResult>((resolve, reject) => {
      const id = this.nextId++;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new QueryTimeoutError());
        // The only way to stop a running SQLite query is to end its thread.
        this.close();
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });

      const request: WorkerRequest = { id, sql };
      this.worker.postMessage(request);
    });
  }

  close(): void {
    if (this.closed) return;
    void this.worker.terminate();
    this.shutDown();
  }

  private shutDown(): void {
    this.closed = true;
    for (const [id, entry] of this.pending) {
      clearTimeout(entry.timer);
      entry.reject(new DatabaseClosedError());
      this.pending.delete(id);
    }
  }
}
