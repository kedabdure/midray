import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors flex">
      <DashboardSidebar />

      {/* ─── Main content area ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto" id="main-content">
        {children}
      </main>
    </div>
  );
}
