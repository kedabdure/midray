import type { StudyStatus } from "@/types";
import { STUDY_STATUS_LABELS } from "@/types";

interface StatusBadgeProps {
  status: StudyStatus;
  className?: string;
}

const STATUS_STYLES: Record<StudyStatus, string> = {
  PENDING:
    "bg-amber-500/10 text-amber-400 border-amber-500/20 ring-amber-500/10",
  IN_PROGRESS:
    "bg-blue-500/10 text-blue-400 border-blue-500/20 ring-blue-500/10",
  COMPLETED:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-emerald-500/10",
  ARCHIVED:
    "bg-slate-500/10 text-slate-400 border-slate-500/20 ring-slate-500/10",
};

const STATUS_DOTS: Record<StudyStatus, string> = {
  PENDING: "bg-amber-400",
  IN_PROGRESS: "bg-blue-400 animate-pulse",
  COMPLETED: "bg-emerald-400",
  ARCHIVED: "bg-slate-400",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[status]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[status]}`}
        aria-hidden="true"
      />
      {STUDY_STATUS_LABELS[status]}
    </span>
  );
}
