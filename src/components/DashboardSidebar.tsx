"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

// ─── Types ───────────────────────────────────────────────────────────────────

type IconName = "grid" | "file" | "users" | "chart" | "settings";

interface NavItemDef {
  href: string;
  label: string;
  icon: IconName;
  /** If true, only exact match activates; if false, prefix match is used */
  exact?: boolean;
}

const NAV_ITEMS: NavItemDef[] = [
  { href: "/dashboard", icon: "grid", label: "Dashboard", exact: true },
  { href: "/dashboard/studies", icon: "file", label: "Studies" },
  { href: "/dashboard/patients", icon: "users", label: "Patients" },
  { href: "/dashboard/reports", icon: "chart", label: "Reports" },
];

const BOTTOM_NAV_ITEMS: NavItemDef[] = [
  { href: "/dashboard/settings", icon: "settings", label: "Settings" },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function isActive({ href, exact }: NavItemDef) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard">
          <Logo width={100} height={33} />
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand - Desktop only */}
        <div className="hidden lg:block px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <Link href="/dashboard" className="block group">
            <Logo width={120} height={40} className="transition-opacity group-hover:opacity-80" />
          </Link>
        </div>

        {/* Mobile padding for header */}
        <div className="lg:hidden h-[60px]" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <div key={item.href} onClick={() => setIsMobileMenuOpen(false)}>
              <NavItem item={item} active={isActive(item)} />
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          {BOTTOM_NAV_ITEMS.map((item) => (
            <div key={item.href} onClick={() => setIsMobileMenuOpen(false)}>
              <NavItem item={item} active={isActive(item)} />
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

// ─── NavItem ─────────────────────────────────────────────────────────────────

function NavItem({ item, active }: { item: NavItemDef; active: boolean }) {
  return (
    <Link
      href={item.href}
      id={`nav-${item.label.toLowerCase()}`}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <NavIcon name={item.icon} className="w-4 h-4 shrink-0" />
      {item.label}
    </Link>
  );
}

// ─── NavIcon ─────────────────────────────────────────────────────────────────

function NavIcon({ name, className }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    ),
    file: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
    users: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    ),
    chart: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    ),
    settings: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
  };

  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
