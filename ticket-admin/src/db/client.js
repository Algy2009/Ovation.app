import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import * as schema from "./schema";

const DB_PATH = path.join(process.cwd(), "data", "ovation.db");

// Reuse the connection across hot-reloads in dev (same pattern as the
// well-known Prisma singleton trick) so we don't open a new sqlite file
// handle on every request.
const globalForDb = globalThis;

function createConnection() {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export const db = globalForDb.__ovationDb ?? createConnection();
if (process.env.NODE_ENV !== "production") globalForDb.__ovationDb = db;
