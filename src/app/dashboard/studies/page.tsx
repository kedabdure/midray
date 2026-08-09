import type { Metadata } from "next";
import { requireAuth } from "@/server/services/authService";
import { getAllStudies } from "@/server/services/studyService";
import { StudiesDataTable } from "@/components/studies/StudiesDataTable";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Studies",
};

export default async function StudiesPage() {
  const session = await requireAuth();
  const studies = await getAllStudies(session.user.id);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Studies Library
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Browse, search, and manage all your medical imaging records.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 px-6 py-8">
        <StudiesDataTable studies={studies} />
      </main>
    </div>
  );
}
