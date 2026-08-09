"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
            router.refresh();
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      id="btn-sign-out"
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400
        hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700
        transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Sign out"
    >
      {isLoading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      )}
      {isLoading ? "Signing out…" : "Sign out"}
    </button>
  );
}
