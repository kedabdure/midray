import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../prisma/db";

export const auth = betterAuth({
  // ─── Database ────────────────────────────────────────────────────────────
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ─── Base URL ────────────────────────────────────────────────────────────
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // ─── Secret ──────────────────────────────────────────────────────────────
  secret: process.env.BETTER_AUTH_SECRET,

  // ─── Email & Password Auth ───────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },

  // ─── Session Config ──────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24,     // Refresh session if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  },

  // ─── User Fields ─────────────────────────────────────────────────────────
  user: {
    additionalFields: {
      // Add any extra user fields here in Phase 2
    },
  },
});

export type Auth = typeof auth;
