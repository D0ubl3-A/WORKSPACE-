import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

function getThreshold() {
  const envVal = process.env.DB_MAX_BYTES;
  const parsed = envVal ? Number(envVal) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 50 * 1024 * 1024; // default 50MB
}

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), "prisma", "dev.db");
    let stats;
    try {
      stats = await fs.stat(dbPath);
    } catch {
      return NextResponse.json({ error: "Database file not found", path: dbPath }, { status: 404 });
    }

    const sizeBytes = stats.size;
    const thresholdBytes = getThreshold();
    const percent = Math.round((sizeBytes / thresholdBytes) * 1000) / 10; // one decimal
    const status = percent >= 100 ? "full" : percent >= 80 ? "warn" : "ok";

    return NextResponse.json({
      path: dbPath,
      sizeBytes,
      thresholdBytes,
      percent,
      status,
      hint:
        status === "full"
          ? "DB is at or over limit. Migrate to Postgres or prune data."
          : status === "warn"
            ? "DB nearing limit. Consider pruning or migrating to Postgres."
            : "OK",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "DB health check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
