import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/services/authService";

/**
 * Root page: redirect based on authentication state.
 * Authenticated users → /dashboard
 * Unauthenticated users → /login
 */
export default async function HomePage() {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
