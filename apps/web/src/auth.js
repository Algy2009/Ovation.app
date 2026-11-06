import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/db/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata sandi", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();
        if (!email || !password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });
          if (!user) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          // Map enum to role string used across web UI
          let role = "customer";
          if (user.role === "SUPER_ADMIN") role = "super_admin";
          else if (user.role === "ORGANIZER") role = "admin";

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role,
            rawRole: user.role,
          };
        } catch (err) {
          console.error("Auth authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.rawRole = user.rawRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.rawRole = token.rawRole;
      }
      return session;
    },
  },
});
