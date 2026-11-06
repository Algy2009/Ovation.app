import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../_helpers";
import { generateDynamicTicketToken } from "@ovation/shared";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const isStaff = ["admin", "super_admin"].includes(session.user.role);

    const tickets = await prisma.issuedTicket.findMany({
      where: isStaff ? {} : {
        orderItem: {
          order: { userId: session.user.id },
        },
      },
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
      orderBy: { createdAt: "desc" },
    });

    const mapped = tickets.map((t) => {
      const order = t.orderItem.order;
      const event = order.event;
      const category = t.orderItem.ticketCategory;
      const { token: dynamicQrToken, expiresInSeconds } = generateDynamicTicketToken(
        t.ticketCode,
        t.dynamicHmacSecret
      );

      return {
        id: t.id,
        ticketCode: t.ticketCode,
        attendeeName: t.attendeeName,
        attendeeEmail: t.attendeeEmail,
        attendeeNikLast4: t.attendeeNikLast4,
        dynamicQrToken,
        qrExpiresInSeconds: expiresInSeconds,
        isCheckedIn: t.isCheckedIn,
        checkedInAt: t.checkedInAt?.toISOString() || null,
        checkedInGate: t.checkedInGate || null,
        event: {
          id: event.id,
          title: event.title,
          venueName: event.venueName,
          venueCity: event.venueCity,
          startDatetime: event.startDatetime.toISOString(),
          bannerUrl: event.bannerUrl,
        },
        category: {
          id: category.id,
          name: category.name,
          price: Number(category.price),
          isStanding: category.isStanding,
        },
        orderNumber: order.orderNumber,
        purchasedAt: t.createdAt.toISOString(),
      };
    });

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/tickets error:", err);
    return NextResponse.json({ error: "Gagal memuat e-ticket." }, { status: 500 });
  }
}

