"use client";

import { useState } from "react";
import type { XrayStudy } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { deleteStudyAction } from "@/server/actions/studyActions";

interface StudiesTableProps {
  studies: XrayStudy[];
}

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
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-slate-500"
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
        <h3 className="text-slate-300 font-semibold text-lg mb-1">No studies yet</h3>
        <p className="text-slate-500 text-sm max-w-xs">
          Upload your first X-ray study to get started with the review workflow.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="X-ray studies">
          {/* ─── Header ─────────────────────────────────────────────────── */}
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                Patient
              </th>
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                Modality
              </th>
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* ─── Body ───────────────────────────────────────────────────── */}
          <tbody className="divide-y divide-slate-800/60">
            {studies.map((study) => (
              <tr
                key={study.id}
                className="group bg-slate-900 hover:bg-slate-800/50 transition-colors duration-150"
              >
                {/* Patient Name */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-slate-700 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-slate-300">
                        {study.patientName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-slate-200 truncate max-w-[150px]">
                      {study.patientName}
                    </span>
                  </div>
                </td>

                {/* Modality */}
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                    {study.modality}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <StatusBadge status={study.status} />
                </td>

                {/* Date */}
                <td className="px-5 py-4 text-slate-400 text-sm">
                  <time dateTime={study.createdAt.toISOString()}>
                    {study.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button
                      id={`btn-view-${study.id}`}
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white
                        bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600
                        transition-all duration-150"
                      aria-label={`View study for ${study.patientName}`}
                    >
                      View
                    </button>
                    <button
                      id={`btn-delete-${study.id}`}
                      type="button"
                      onClick={() => handleDelete(study.id)}
                      disabled={deletingId === study.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300
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
      <div className="px-5 py-3 bg-slate-900/30 border-t border-slate-800 text-xs text-slate-500">
        Showing {studies.length} {studies.length === 1 ? "study" : "studies"}
      </div>
    </div>
  );
}
