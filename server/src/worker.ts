// Runs inside a worker thread. Owns one in-memory SQLite database that holds a single
// user's PlaybackActivity rows, so nothing a query does can reach another user's data.
import { parentPort, workerData } from "node:worker_threads";
import initSqlJs from "sql.js";
import type { ColumnDef } from "./jellyfin.js";

export interface InitData {
  columns: ColumnDef[];
  rows: string[][];
  maxRows: number;
  maxBytes: number;
  memoryLimitMb: number;
}

export type WorkerRequest = { id: number; sql: string };
export type WorkerResponse =
  | { type: "ready" }
  | {
      type: "result";
      id: number;
      ok: true;
      columns: string[];
      rows: string[][];
    }
  | { type: "result"; id: number; ok: false; error: string };

// SQLite runs as WebAssembly so terminating this thread stops a runaway query right away.
const READ_ONLY_START =
  /^\s*(?:--[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)*(?:select|with)\b/i;

function quoteIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function toText(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function post(message: WorkerResponse): void {
  parentPort?.postMessage(message);
}

const init = workerData as InitData;
const SQL = await initSqlJs();
const db = new SQL.Database();

const columnList = init.columns.map((c) => quoteIdentifier(c.name)).join(", ");
const columnDefs = init.columns
  .map((c) => `${quoteIdentifier(c.name)} ${c.type}`)
  .join(", ");
db.run(`CREATE TABLE PlaybackActivity (${columnDefs})`);

const insert = db.prepare(
  `INSERT INTO PlaybackActivity (rowid, ${columnList}) VALUES (${["?", ...init.columns.map(() => "?")].join(", ")})`
);
db.run("BEGIN");
for (const row of init.rows) insert.run(row);
db.run("COMMIT");
insert.free();

// Defence in depth: even if the statement check below missed something, writes fail.
db.run("PRAGMA query_only = ON");
// A query that builds huge strings fails here instead of exhausting the process.
db.run(
  `PRAGMA hard_heap_limit = ${Math.floor(init.memoryLimitMb) * 1024 * 1024}`
);

function runQuery(sql: string): { columns: string[]; rows: string[][] } {
  if (!READ_ONLY_START.test(sql)) {
    throw new Error("Only SELECT statements are allowed");
  }
  const statements = db.iterateStatements(sql);
  const first = statements.next();
  if (first.done) throw new Error("Only SELECT statements are allowed");
  const statement = first.value;
  try {
    const columns = statement.getColumnNames();
    const rows: string[][] = [];
    let bytes = 0;
    while (statement.step()) {
      if (rows.length >= init.maxRows) {
        throw new Error(`Result is larger than ${init.maxRows} rows`);
      }
      const row = statement.get().map(toText);
      for (const cell of row) bytes += cell.length * 2;
      if (bytes > init.maxBytes) {
        throw new Error("Result is larger than the size limit");
      }
      rows.push(row);
    }
    // Advancing the iterator frees the first statement and prepares any second one (without running it).
    if (!statements.next().done) {
      throw new Error("Only a single statement is allowed");
    }
    return { columns, rows };
  } finally {
    statement.free();
  }
}

parentPort?.on("message", (request: WorkerRequest) => {
  try {
    const { columns, rows } = runQuery(request.sql);
    post({ type: "result", id: request.id, ok: true, columns, rows });
  } catch (error) {
    post({
      type: "result",
      id: request.id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

post({ type: "ready" });
