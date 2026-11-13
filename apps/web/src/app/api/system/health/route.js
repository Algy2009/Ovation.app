import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { getRedisStatus } from "@/lib/redis";

export async function GET() {
  let dbStatus = "UNKNOWN";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "CONNECTED (MySQL 8.4)";
  } catch (err) {
    dbStatus = `ERROR: ${err.message}`;
  }

  const redisInfo = await getRedisStatus();

  return NextResponse.json({
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    system: {
      platform: "Ovation Enterprise Ticketing Platform",
      database: dbStatus,
      redis: redisInfo,
      environment: process.env.NODE_ENV || "development",
      uptimeSeconds: Math.floor(process.uptime()),
    },
    gateways: {
      midtrans: {
        isConfigured: !!process.env.MIDTRANS_SERVER_KEY,
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      },
    },
  });
}

