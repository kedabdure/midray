import Link from "next/link";
import { Construction } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="text-center px-6 py-12">
        <div className="mb-8 flex justify-center">
          <Construction
            className="text-green-600 dark:text-green-500"
            size={120}
            strokeWidth={1.5}
          />
        </div>

        <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          404
        </h1>

        <h2 className="text-3xl font-semibold text-slate-700 dark:text-slate-300 mb-6">
          Coming Soon
        </h2>

        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          This page is currently under construction. We&apos;re working hard to bring you something amazing!
        </p>

        <Link
          href="/dashboard"
          className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
