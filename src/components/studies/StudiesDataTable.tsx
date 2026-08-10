"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { StudyStatus, XrayStudy } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { deleteStudyAction, updateStudyAction } from "@/server/actions/studyActions";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface StudiesDataTableProps {
  studies: XrayStudy[];
}

// ─── ImageKit Thumbnail Helper ───────────────────────────────────────────────

function buildThumbnailUrl(imageUrl: string): string {
  try {
    const url = new URL(imageUrl);
    url.searchParams.set("tr", "w-64,h-64,fo-auto");
    return url.toString();
  } catch {
    return imageUrl;
  }
}

// ─── Status progression logic ─────────────────────────────────────────────────

/** Returns the next status label + value for a given current status, or null if no advancement. */
function getNextStatus(
  current: StudyStatus
): { label: string; value: StudyStatus } | null {
  switch (current) {
    case "PENDING":
      return { label: "Mark as In Progress", value: "IN_PROGRESS" };
    case "IN_PROGRESS":
      return { label: "Mark as Completed", value: "COMPLETED" };
    default:
      return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StudiesDataTable({ studies }: StudiesDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudyStatus | "ALL">("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filter studies by search query (patientName or patientId) & status
  const filteredStudies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return studies.filter((study) => {
      if (statusFilter !== "ALL" && study.status !== statusFilter) return false;
      if (!query) return true;
      const nameMatch = study.patientName.toLowerCase().includes(query);
      const idMatch = study.patientId?.toLowerCase().includes(query) ?? false;
      return nameMatch || idMatch;
    });
  }, [studies, searchQuery, statusFilter]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this study?")) return;
    setLoadingId(id);
    try {
      const result = await deleteStudyAction({ id });
      if (!result.success) alert(result.error);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleStatusChange(id: string, newStatus: StudyStatus) {
    setLoadingId(id);
    try {
      const result = await updateStudyAction({ id, status: newStatus });
      if (!result.success) alert(result.error);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDownload(imageUrl: string, patientName: string) {
    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to download image");

      // Get the blob
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract file extension from URL or default to .jpg
      const extension = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
      const fileName = `${patientName.replace(/\s+/g, "_")}_xray.${extension}`;

      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download the image. Please try again.");
    }
  }

  return (
    <div className="space-y-4">
      {/* ─── Top Toolbar ────────────────────────────────────────────────── */}
      <div className="flex flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            id="input-search-studies"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name or ID…"
            className="pl-10"
            aria-label="Search studies by patient name or patient ID"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Pills and Add Study Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
            {(["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {st === "ALL"
                  ? "All"
                  : st === "IN_PROGRESS"
                  ? "In Progress"
                  : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Add Study Button */}
          <Link
            id="btn-add-study-table"
            href="/dashboard/upload"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white
              bg-green-600 hover:bg-green-700
              shadow-md shadow-green-600/20
              transition-all duration-200 active:scale-[0.98] shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Study</span>
          </Link>
        </div>
      </div>

      {/* ─── Table Container ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-colors overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 sm:w-16" />
              <TableHead className="hidden lg:table-cell">Patient ID</TableHead>
              <TableHead className="min-w-37.5">Name</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredStudies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <svg
                        className="w-6 h-6 text-slate-400 dark:text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-800 dark:text-slate-300 font-medium text-sm">
                      {searchQuery || statusFilter !== "ALL"
                        ? "No matching studies found"
                        : "No studies available"}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {searchQuery || statusFilter !== "ALL"
                        ? "Try adjusting your search terms or filters."
                        : "Upload a study to get started."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudies.map((study) => {
                const nextStatus = getNextStatus(study.status);
                const isLoading = loadingId === study.id;

                return (
                  <TableRow key={study.id}>
                    {/* Thumbnail - Clickable */}
                    <TableCell>
                      {study.imageUrl ? (
                        <a
                          href={study.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-green-500 dark:hover:border-green-500 shrink-0 items-center justify-center transition-all cursor-pointer"
                          aria-label={`View X-ray for ${study.patientName}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={buildThumbnailUrl(study.imageUrl)}
                            alt={`X-ray for ${study.patientName}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              // Replace failed image with fallback icon
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent && !parent.querySelector('svg')) {
                                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                svg.setAttribute('class', 'w-5 h-5 text-slate-400 dark:text-slate-600');
                                svg.setAttribute('fill', 'none');
                                svg.setAttribute('stroke', 'currentColor');
                                svg.setAttribute('viewBox', '0 0 24 24');
                                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />';
                                parent.appendChild(svg);
                              }
                            }}
                          />
                        </a>
                      ) : (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shrink-0 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-slate-400 dark:text-slate-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </TableCell>
                    
                    {/* Patient ID - Desktop only */}
                    <TableCell className="hidden lg:table-cell">
                      {study.patientId && (
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                          {study.patientId}
                        </span>
                      )}
                    </TableCell>

                    {/* Name */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-900 dark:text-slate-200 truncate max-w-37.5 sm:max-w-50">
                          {study.patientName}
                        </span>
                        {/* Show status on mobile */}
                        <div className="sm:hidden mt-1">
                          <StatusBadge status={study.status} />
                        </div>
                      </div>
                    </TableCell>

                    {/* Status - Desktop only */}
                    <TableCell className="hidden sm:table-cell">
                      <StatusBadge status={study.status} />
                    </TableCell>

                    {/* Date - Tablet and up */}
                    <TableCell className="hidden md:table-cell text-slate-600 dark:text-slate-400 text-sm">
                      <time dateTime={study.createdAt.toISOString()}>
                        {study.createdAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </TableCell>

                    {/* Actions — three-dot dropdown */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <button
                            id={`btn-actions-${study.id}`}
                            type="button"
                            disabled={isLoading}
                            aria-label={`Actions for ${study.patientName}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                          >
                            {isLoading ? (
                              /* spinner */
                              <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                />
                              </svg>
                            ) : (
                              /* three-dot icon */
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                              >
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            )}
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          {/* View image (if URL exists) */}
                          {study.imageUrl && (
                            <>
                              <DropdownMenuItem
                                onClick={() => window.open(study.imageUrl!, '_blank', 'noopener,noreferrer')}
                              >
                                {/* eye icon */}
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Image
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownload(study.imageUrl!, study.patientName)}
                              >
                                {/* download icon */}
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Image
                              </DropdownMenuItem>
                            </>
                          )}

                          {/* Status advancement */}
                          {nextStatus && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(study.id, nextStatus.value)
                                }
                              >
                                {/* arrow-right icon */}
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                {nextStatus.label}
                              </DropdownMenuItem>
                            </>
                          )}

                          {/* Delete */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(study.id)}
                          >
                            {/* trash icon */}
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Study
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Showing {filteredStudies.length} of {studies.length}{" "}
            {studies.length === 1 ? "study" : "studies"}
          </span>
          {searchQuery && (
            <span className="font-mono text-slate-400">
              Filter: &quot;{searchQuery}&quot;
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
