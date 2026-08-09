"use client";

import * as React from "react";
import { createPortal } from "react-dom";

// ─── Context ─────────────────────────────────────────────────────────────────

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("useDropdown must be used within DropdownMenu");
  return ctx;
}

// ─── DropdownMenu (root) ─────────────────────────────────────────────────────

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (contentRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      {children}
    </DropdownContext.Provider>
  );
}

// ─── DropdownMenuTrigger ─────────────────────────────────────────────────────
// Wraps children in a span that owns the ref — no cloneElement needed.

export function DropdownMenuTrigger({ children }: { children: React.ReactNode }) {
  const { open, setOpen, triggerRef } = useDropdown();

  return (
    <span
      ref={triggerRef as React.RefObject<HTMLSpanElement>}
      className="inline-flex items-center"
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
      aria-expanded={open}
      aria-haspopup="menu"
    >
      {children}
    </span>
  );
}

// ─── DropdownMenuContent ─────────────────────────────────────────────────────

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function DropdownMenuContent({
  children,
  align = "end",
  className = "",
}: DropdownMenuContentProps) {
  const { open, triggerRef, contentRef } = useDropdown();
  const [coords, setCoords] = React.useState<{
    top: number;
    right?: number;
    left?: number;
  } | null>(null);

  // Recompute position every time open changes
  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    setCoords(
      align === "end"
        ? {
            top: rect.bottom + window.scrollY + 6,
            right: window.innerWidth - rect.right,
          }
        : {
            top: rect.bottom + window.scrollY + 6,
            left: rect.left + window.scrollX,
          }
    );
  }, [open, align, triggerRef]);

  if (!open || !coords) return null;

  const content = (
    <div
      ref={contentRef}
      role="menu"
      style={{
        position: "fixed",
        top: coords.top - window.scrollY, // fixed = viewport-relative
        ...(coords.right !== undefined
          ? { right: coords.right }
          : { left: coords.left }),
        zIndex: 9999,
      }}
      className={`min-w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/15 dark:shadow-slate-900/50 py-1 text-sm ${className}`}
    >
      {children}
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : null;
}

// ─── DropdownMenuLabel ────────────────────────────────────────────────────────

export function DropdownMenuLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 ${className}`}
    >
      {children}
    </div>
  );
}

// ─── DropdownMenuSeparator ───────────────────────────────────────────────────

export function DropdownMenuSeparator({ className = "" }: { className?: string }) {
  return <div className={`my-1 h-px bg-slate-100 dark:bg-slate-800 ${className}`} />;
}

// ─── DropdownMenuItem ─────────────────────────────────────────────────────────

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive";
  className?: string;
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled = false,
  variant = "default",
  className = "",
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdown();

  return (
    <button
      role="menuitem"
      type="button"
      disabled={disabled}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          variant === "destructive"
            ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        } ${className}`}
    >
      {children}
    </button>
  );
}
