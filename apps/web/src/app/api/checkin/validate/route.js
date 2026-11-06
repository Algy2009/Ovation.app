import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../../_helpers";
import { verifyDynamicTicketToken } from "@ovation/shared";

export async function POST(req) {
  const { session, error } = await requireSession();
  if (error) return error;

  const isStaff = ["admin", "super_admin"].includes(session.user.role);
  if (!isStaff) {
    return NextResponse.json({ error: "Hanya petugas gate atau admin yang dapat melakukan scan tiket." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { ticketCode, dynamicQrToken, gateName = "Main Gate A" } = body;

  if (!ticketCode || !dynamicQrToken) {
    return NextResponse.json({ error: "Ticket code dan Dynamic QR Token wajib disertakan." }, { status: 400 });
  }

  try {
    const ticket = await prisma.issuedTicket.findUnique({
      where: { ticketCode },
      include: {
        orderItem: {
          include: {
            ticketCategory: true,
            order: {
              include: { event: true },
            },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({
        valid: false,
        status: "NOT_FOUND",
        message: "Tiket tidak terdaftar di sistem.",
      }, { status: 404 });
    }

    const event = ticket.orderItem.order.event;

    // Check if already checked-in
    if (ticket.isCheckedIn) {
      await prisma.checkinLog.create({
        data: {
          issuedTicketId: ticket.id,
          scannedByUserId: session.user.id,
          gateName,
          scanResult: "ALREADY_CHECKED_IN",
          rejectionReason: `Tiket sudah digunakan pada ${ticket.checkedInAt?.toLocaleString("id-ID")}`,
          dynamicTokenProvided: dynamicQrToken,
        },
      });

      return NextResponse.json({
        valid: false,
        status: "ALREADY_CHECKED_IN",
        message: `Tiket sudah pernah check-in pada ${ticket.checkedInAt?.toLocaleString("id-ID")}`,
        ticket: {
          ticketCode: ticket.ticketCode,
          attendeeName: ticket.attendeeName,
          checkedInAt: ticket.checkedInAt,
          gate: ticket.checkedInGate,
        },
      }, { status: 409 });
    }

    // Verify dynamic rotating QR token
    const isTokenValid = verifyDynamicTicketToken(
      dynamicQrToken,
      ticket.ticketCode,
      ticket.dynamicHmacSecret,
      30, // 30-second rotation
      1   // ±30s drift tolerance
    );

    if (!isTokenValid) {
      await prisma.checkinLog.create({
        data: {
          issuedTicketId: ticket.id,
          scannedByUserId: session.user.id,
          gateName,
          scanResult: "INVALID_TOKEN",
          rejectionReason: "Dynamic QR Token tidak valid atau sudah kedaluwarsa.",
          dynamicTokenProvided: dynamicQrToken,
        },
      });

      return NextResponse.json({
        valid: false,
        status: "INVALID_OR_EXPIRED_QR",
        message: "QR Code telah kedaluwarsa atau tidak valid. Minta pengunjung untuk membuka aplikasi mobile.",
      }, { status: 400 });
    }

    // Mark ticket as checked-in
    const now = new Date();
    await prisma.issuedTicket.update({
      where: { id: ticket.id },
      data: {
        isCheckedIn: true,
        checkedInAt: now,
        checkedInGate: gateName,
        checkedInByUserId: session.user.id,
      },
    });

    // Record successful checkin log
    await prisma.checkinLog.create({
      data: {
        issuedTicketId: ticket.id,
        scannedByUserId: session.user.id,
        gateName,
        scanResult: "SUCCESS",
        dynamicTokenProvided: dynamicQrToken,
      },
    });

    return NextResponse.json({
      valid: true,
      status: "ACCESS_GRANTED",
      message: "Check-in Berhasil. Silakan masuk ke venue.",
      ticket: {
        ticketCode: ticket.ticketCode,
        attendeeName: ticket.attendeeName,
        attendeeNikLast4: ticket.attendeeNikLast4,
        category: ticket.orderItem.ticketCategory.name,
        event: event.title,
        venue: event.venueName,
        checkedInAt: now.toISOString(),
        gate: gateName,
      },
    });
  } catch (err) {
    console.error("POST /api/checkin/validate error:", err);
    return NextResponse.json({ error: "Gagal memproses validasi tiket." }, { status: 500 });
  }
}

