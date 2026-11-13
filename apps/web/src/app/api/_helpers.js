import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/db/client";

export function makeId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

async function resolveSession() {
  const session = await auth().catch(() => null);
  if (session?.user) {
    return session;
  }

  // Fallback to Mobile Header / Bearer Token
  try {
    const headerList = await headers();
    const authHeader = headerList.get("authorization");
    const mobileUserId = headerList.get("x-user-id");
    const mobileUserEmail = headerList.get("x-user-email");

    let user = null;
    if (mobileUserId) {
      user = await prisma.user.findUnique({ where: { id: mobileUserId } });
    } else if (mobileUserEmail) {
      user = await prisma.user.findUnique({ where: { email: mobileUserEmail } });
    } else if (authHeader?.startsWith("Bearer mob_")) {
      const parts = authHeader.replace("Bearer ", "").split("_");
      const uid = parts[1];
      if (uid) {
        user = await prisma.user.findUnique({ where: { id: uid } });
      }
    }

    if (user) {
      let role = "customer";
      if (user.role === "SUPER_ADMIN") role = "super_admin";
      else if (user.role === "ORGANIZER") role = "admin";

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
          rawRole: user.role,
        },
      };
    }
  } catch (err) {
    console.error("resolveSession header error:", err);
  }

  return null;
}

export async function requireRole(...roles) {
  const session = await resolveSession();
  if (!session?.user || !roles.includes(session.user.role)) {
    return { session: null, error: NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 }) };
  }
  return { session, error: null };
}

export async function requireSession() {
  const session = await resolveSession();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Perlu masuk terlebih dahulu." }, { status: 401 }) };
  }
  return { session, error: null };
}
