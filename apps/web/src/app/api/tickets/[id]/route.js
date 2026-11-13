import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../../_helpers";
import { generateDynamicTicketToken } from "@ovation/shared";

export async function GET(_req, { params }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;

  try {
    const ticket = await prisma.issuedTicket.findUnique({
      where: { id },
      include: {
        orderItem: {
          include: {
            ticketCategory: true,
            order: {
              include: { event: true, user: true },
            },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
    }

    const order = ticket.orderItem.order;
    const isOwner = order.userId === session.user.id || order.user.email === session.user.email;
    const isStaff = ["admin", "super_admin"].includes(session.user.role);

    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const event = order.event;
    const category = ticket.orderItem.ticketCategory;
    const { token: dynamicQrToken, expiresInSeconds } = generateDynamicTicketToken(
      ticket.ticketCode,
      ticket.dynamicHmacSecret
    );

    return NextResponse.json({
      id: ticket.id,
      ticketCode: ticket.ticketCode,
      attendeeName: ticket.attendeeName,
      attendeeEmail: ticket.attendeeEmail,
      attendeeNikLast4: ticket.attendeeNikLast4,
      dynamicQrToken,
      qrExpiresInSeconds: expiresInSeconds,
      isCheckedIn: ticket.isCheckedIn,
      checkedInAt: ticket.checkedInAt?.toISOString() || null,
      checkedInGate: ticket.checkedInGate || null,
      event: {
        id: event.id,
        title: event.title,
        venueName: event.venueName,
        venueCity: event.venueCity,
        address: event.address,
        startDatetime: event.startDatetime.toISOString(),
        endDatetime: event.endDatetime.toISOString(),
        bannerUrl: event.bannerUrl,
        termsAndConditions: event.termsAndConditions,
      },
      category: {
        id: category.id,
        name: category.name,
        price: Number(category.price),
        isStanding: category.isStanding,
      },
      orderId: order.id,
      orderNumber: order.orderNumber,
      purchasedAt: ticket.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("GET /api/tickets/[id] error:", err);
    return NextResponse.json({ error: "Gagal memuat detail e-ticket." }, { status: 500 });
  }
}

