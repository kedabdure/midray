import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Gets the current session from the request headers.
 * Returns null if not authenticated.
 * NOTE: headers() is async in Next.js 16+
 */
export async function getCurrentSession() {
  const headerStore = await headers();
  const session = await auth.api.getSession({
    headers: headerStore,
  });
  return session;
}

/**
 * Gets the current session and throws a redirect to /login if not authenticated.
 * Use this in protected Server Components and Server Actions.
 */
export async function requireAuth() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Gets the current user ID, or null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.user?.id ?? null;
}
