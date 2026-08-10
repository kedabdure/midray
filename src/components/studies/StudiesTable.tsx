"use client";

import { useState } from "react";
import type { XrayStudy } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { deleteStudyAction } from "@/server/actions/studyActions";

interface StudiesTableProps {
  studies: XrayStudy[];
}

// ─── ImageKit thumbnail URL helper ───────────────────────────────────────────

function buildThumbnailUrl(imageUrl: string): string {
  // Append ImageKit transformation: 64×64, auto-format, face/object focus
  const url = new URL(imageUrl);
  url.searchParams.set("tr", "w-64,h-64,fo-auto");
  return url.toString();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StudiesTable({ studies }: StudiesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this study?")) return;
    setDeletingId(id);
    try {
      const result = await deleteStudyAction({ id });
      if (!result.success) {
        alert(result.error);
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (studies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-slate-400 dark:text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
            />
          </svg>
        </div>
        <h3 className="text-slate-800 dark:text-slate-300 font-semibold text-lg mb-1">No studies yet</h3>
        <p className="text-slate-500 text-sm max-w-xs">
          Upload your first X-ray study to get started with the review workflow.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="X-ray studies">
          {/* ─── Header ─────────────────────────────────────────────────── */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              {/* Thumbnail column */}
              <th scope="col" className="w-16 px-4 py-3.5" aria-label="Image preview" />
              <th
                scope="col"
                className="text-left px-4 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell"
              >
                Patient ID
              </th>
              <th
                scope="col"
                className="text-left px-4 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="text-left px-4 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="text-left px-4 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="text-right px-4 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* ─── Body ───────────────────────────────────────────────────── */}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {studies.map((study) => (
              <tr
                key={study.id}
                className="group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
              >
                {/* Thumbnail - Clickable */}
                <td className="px-4 py-3">
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
                </td>

                {/* Patient ID - Desktop only */}
                <td className="px-4 py-3 hidden lg:table-cell">
                  {study.patientId && (
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {study.patientId}
                    </span>
                  )}
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900 dark:text-slate-200 truncate max-w-40 block">
                    {study.patientName}
                  </span>
                </td>
                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge status={study.status} />
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">
                  <time dateTime={study.createdAt.toISOString()}>
                    {study.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    {study.imageUrl && (
                      <a
                        id={`btn-view-${study.id}`}
                        href={study.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white
                          bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600
                          transition-all duration-150"
                        aria-label={`View image for ${study.patientName}`}
                      >
                        Preview
                      </a>
                    )}
                    <button
                      id={`btn-delete-${study.id}`}
                      type="button"
                      onClick={() => handleDelete(study.id)}
                      disabled={deletingId === study.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300
                        bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30
                        transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Delete study for ${study.patientName}`}
                    >
                      {deletingId === study.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        Showing {studies.length} {studies.length === 1 ? "study" : "studies"}
      </div>
    </div>
  );
}
