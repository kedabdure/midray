import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/server/services/authService";
import { XrayUploadForm } from "@/components/forms/XrayUploadForm";

export const metadata: Metadata = {
  title: "Upload Study",
};

// Route segment config - increase timeout for large file uploads
export const maxDuration = 60; // 60 seconds

export default async function UploadPage() {
  // Auth guard — redirects to /login if not authenticated
  await requireAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium"
            aria-label="Back to dashboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <h1 className="text-sm font-semibold text-slate-900 dark:text-white">Upload Study</h1>
        </div>
      </header>

      {/* ─── Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-xl rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/60 p-8 transition-colors">
            {/* Heading */}
            <div className="mb-7">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 mb-4">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">New X-Ray Study</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Upload a DICOM or image file and fill in patient details.
                The file will be stored on ImageKit and linked to this record.
              </p>
            </div>

            <XrayUploadForm />
          </div>
        </div>
      </div>
    </div>
  );
}
