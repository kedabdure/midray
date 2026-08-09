import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/server/services/authService";
import { getAllStudies, getStudyStats } from "@/server/services/studyService";
import { StudiesTable } from "@/components/studies/StudiesTable";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";


export const metadata: Metadata = {
  title: "Dashboard",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: "total" | "pending" | "in_progress" | "completed";
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon, color, bgColor }: StatCardProps) {
  const iconPaths: Record<StatCardProps["icon"], React.ReactNode> = {
    total: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
    pending: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    in_progress: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    ),
    completed: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-sm transition-colors">
      <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
        <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          {iconPaths[icon]}
        </svg>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  // Require auth — redirects to /login if no session
  const session = await requireAuth();

  // Fetch data server-side (direct DB call, no API round-trip)
  const [studies, stats] = await Promise.all([
    getAllStudies(session.user.id),
    getStudyStats(session.user.id),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* ─── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-3">
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
              Welcome back, {session.user.name?.split(" ")[0] ?? "Doctor"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Stats Grid */}
        <section aria-label="Study statistics">
          <h2 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Studies"
              value={stats.total}
              icon="total"
              color="text-slate-700 dark:text-slate-200"
              bgColor="bg-slate-100 dark:bg-slate-800"
            />
            <StatCard
              label="Pending"
              value={stats.PENDING}
              icon="pending"
              color="text-amber-600 dark:text-amber-400"
              bgColor="bg-amber-500/10"
            />
            <StatCard
              label="In Progress"
              value={stats.IN_PROGRESS}
              icon="in_progress"
              color="text-green-600 dark:text-green-400"
              bgColor="bg-green-500/10"
            />
            <StatCard
              label="Completed"
              value={stats.COMPLETED}
              icon="completed"
              color="text-emerald-600 dark:text-emerald-400"
              bgColor="bg-emerald-500/10"
            />
          </div>
        </section>

        {/* Studies Table */}
        <section aria-label="X-ray studies list">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Studies</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {stats.total > 0
                  ? `${stats.total} ${stats.total === 1 ? "study" : "studies"} total`
                  : "No studies yet"}
              </p>
            </div>

            {/* Add Study — links to dedicated upload page */}
            <Link
              id="btn-add-study"
              href="/dashboard/upload"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white
                bg-green-600 hover:bg-green-700
                shadow-lg shadow-green-600/20
                transition-all duration-200 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Study</span>
            </Link>
          </div>

          <StudiesTable studies={studies} />
        </section>
      </div>
    </div>
  );
}
