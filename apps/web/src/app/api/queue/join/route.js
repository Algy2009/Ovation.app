import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../../_helpers";
import crypto from "crypto";

export async function POST(req) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { eventId } = body;

  if (!eventId) {
    return NextResponse.json({ error: "eventId wajib disertakan." }, { status: 400 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event tidak ditemukan." }, { status: 404 });
    }

    // Check if user already in active queue
    const existingQueue = await prisma.virtualQueue.findFirst({
      where: {
        eventId,
        userId: session.user.id,
        status: { in: ["WAITING", "ADMITTED"] },
      },
    });

    if (existingQueue) {
      // Calculate rank
      const aheadCount = await prisma.virtualQueue.count({
        where: {
          eventId,
          status: "WAITING",
          queueNumber: { lt: existingQueue.queueNumber },
        },
      });

      return NextResponse.json({
        queueToken: existingQueue.queueToken,
        queueNumber: existingQueue.queueNumber,
        status: existingQueue.status,
        position: aheadCount + 1,
        estimatedWaitSeconds: (aheadCount + 1) * 3,
      });
    }

    // Get current max queue number
    const lastQueue = await prisma.virtualQueue.findFirst({
      where: { eventId },
      orderBy: { queueNumber: "desc" },
    });
    const nextQueueNumber = (lastQueue?.queueNumber || 0) + 1;
    const queueToken = `qtok_${crypto.randomBytes(24).toString("hex")}`;

    // Auto admit if queue is small (< 50)
    const activeWaiting = await prisma.virtualQueue.count({
      where: { eventId, status: "WAITING" },
    });
    const status = activeWaiting < 50 ? "ADMITTED" : "WAITING";
    const now = new Date();

    const created = await prisma.virtualQueue.create({
      data: {
        eventId,
        userId: session.user.id,
        queueToken,
        queueNumber: nextQueueNumber,
        status,
        admittedAt: status === "ADMITTED" ? now : null,
        expiresAt: new Date(now.getTime() + 10 * 60 * 1000), // 10 minutes session
      },
    });

    return NextResponse.json({
      queueToken: created.queueToken,
      queueNumber: created.queueNumber,
      status: created.status,
      position: status === "ADMITTED" ? 0 : activeWaiting + 1,
      estimatedWaitSeconds: status === "ADMITTED" ? 0 : (activeWaiting + 1) * 3,
    }, { status: 201 });
  } catch (err) {
    console.error("POST /api/queue/join error:", err);
    return NextResponse.json({ error: "Gagal memasuki antrean virtual." }, { status: 500 });
  }
}

