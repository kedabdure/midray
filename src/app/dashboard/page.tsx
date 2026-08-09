import type { Metadata } from "next";
import { requireAuth } from "@/server/services/authService";
import { getAllStudies, getStudyStats } from "@/server/services/studyService";
import { StudiesTable } from "@/components/studies/StudiesTable";
import { SignOutButton } from "@/components/auth/SignOutButton";


export const metadata: Metadata = {
  title: "Dashboard",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
        <span className={`text-lg font-bold ${color}`}>{value}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
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
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* ─── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">
              Welcome back, {session.user.name?.split(" ")[0] ?? "Doctor"}
            </h1>
            <p className="text-sm text-slate-400">{session.user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </header>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 px-6 py-8 space-y-8">

        {/* Stats Grid */}
        <section aria-label="Study statistics">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Studies"
              value={stats.total}
              color="text-white"
              bgColor="bg-slate-800"
            />
            <StatCard
              label="Pending"
              value={stats.PENDING}
              color="text-amber-400"
              bgColor="bg-amber-500/10"
            />
            <StatCard
              label="In Progress"
              value={stats.IN_PROGRESS}
              color="text-blue-400"
              bgColor="bg-blue-500/10"
            />
            <StatCard
              label="Completed"
              value={stats.COMPLETED}
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
            />
          </div>
        </section>

        {/* Studies Table */}
        <section aria-label="X-ray studies list">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Recent Studies</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {stats.total > 0
                  ? `${stats.total} ${stats.total === 1 ? "study" : "studies"} total`
                  : "No studies yet"}
              </p>
            </div>

            {/* Add Study button placeholder — Phase 2 */}
            <button
              id="btn-add-study"
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white
                bg-gradient-to-r from-blue-500 to-violet-600
                hover:from-blue-600 hover:to-violet-700
                shadow-lg shadow-blue-500/20
                transition-all duration-200 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Study
            </button>
          </div>

          <StudiesTable studies={studies} />
        </section>
      </div>
    </div>
  );
}
