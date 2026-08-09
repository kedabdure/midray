"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (error) {
        setError(error.message ?? "Invalid email or password.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-green-700 via-green-600 to-emerald-700 dark:from-green-800 dark:via-green-700 dark:to-emerald-800 text-white relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10">
          <Image
            src="/logo/logol-dark.png"
            alt="Dewa Clinic X-Ray"
            width={160}
            height={55}
            priority
          />
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-bold">
            Professional X-Ray Management System
          </h1>
          <p className="text-green-50 text-lg leading-relaxed">
            Streamline your radiology workflow with our comprehensive platform for managing medical imaging studies and patient records.
          </p>
        </div>

        <div className="relative z-10 text-sm text-green-100">
          © {new Date().getFullYear()} Dewa Clinic. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-4 sm:p-8 relative">
        {/* Theme Toggle */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20">
          <ThemeToggle />
        </div>

        {/* Mobile Logo */}
        <div className="absolute top-6 sm:top-8 left-4 sm:left-8 lg:hidden">
          <Logo width={120} height={40} />
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md px-2 sm:px-0">
          <div className="mb-6 sm:mb-8 mt-20 sm:mt-16 lg:mt-0">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              Sign in to access your dashboard
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-lg transition-colors">
            {error && (
              <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@dewaclinic.com"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                id="btn-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-600/20 dark:shadow-green-600/30 active:scale-[0.98] mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
