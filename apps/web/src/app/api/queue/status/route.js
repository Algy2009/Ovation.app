import { NextResponse } from "next/server";
import { prisma } from "@/db/client";

export async function GET(req) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token antrean wajib disertakan." }, { status: 400 });
  }

  try {
    const queue = await prisma.virtualQueue.findUnique({
      where: { queueToken: token },
      include: { event: true },
    });

    if (!queue) {
      return NextResponse.json({ error: "Sesi antrean tidak ditemukan." }, { status: 404 });
    }

    if (queue.status === "ADMITTED") {
      return NextResponse.json({
        status: "ADMITTED",
        queueNumber: queue.queueNumber,
        eventTitle: queue.event.title,
        admittedAt: queue.admittedAt,
        expiresAt: queue.expiresAt,
        canCheckout: true,
      });
    }

    // Calculate position
    const aheadCount = await prisma.virtualQueue.count({
      where: {
        eventId: queue.eventId,
        status: "WAITING",
        queueNumber: { lt: queue.queueNumber },
      },
    });

    // Auto promote if within batch
    if (aheadCount < 10) {
      const now = new Date();
      await prisma.virtualQueue.update({
        where: { id: queue.id },
        data: {
          status: "ADMITTED",
          admittedAt: now,
          expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
        },
      });

      return NextResponse.json({
        status: "ADMITTED",
        queueNumber: queue.queueNumber,
        eventTitle: queue.event.title,
        admittedAt: now,
        expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
        canCheckout: true,
      });
    }

    return NextResponse.json({
      status: "WAITING",
      position: aheadCount + 1,
      estimatedWaitSeconds: (aheadCount + 1) * 3,
      eventTitle: queue.event.title,
      canCheckout: false,
    });
  } catch (err) {
    console.error("GET /api/queue/status error:", err);
    return NextResponse.json({ error: "Gagal memeriksa status antrean." }, { status: 500 });
  }
}

