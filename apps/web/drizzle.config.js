/**
 * @deprecated
 * ARSIP / LEGACY PROTOTYPE FILE:
 * Konfigurasi Drizzle SQLite ini sudah tidak digunakan.
 * Platform sekarang menggunakan Prisma ORM dengan MySQL di `packages/database/prisma/schema.prisma`.
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/ovation.db",
  },
});
