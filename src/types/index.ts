import type { XrayStudy as PrismaXrayStudy, User as PrismaUser, StudyStatus } from "@prisma/client";

// ─── Re-exports from Prisma ───────────────────────────────────────────────────

export type { StudyStatus };

// Full XrayStudy model type (from Prisma)
export type XrayStudy = PrismaXrayStudy;

// User type (from Prisma) — omit sensitive fields for client-side use
export type SafeUser = Omit<PrismaUser, "updatedAt">;

// XrayStudy with user relation included
export type XrayStudyWithUser = PrismaXrayStudy & {
  user: Pick<PrismaUser, "id" | "name" | "email">;
};

// ─── Server Action Response Types ────────────────────────────────────────────

export type ActionResponse<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Input Types (used in Server Actions and Services) ───────────────────────

export type CreateStudyInput = {
  patientName: string;
  patientId?: string;
  status?: StudyStatus;
  imageUrl?: string;
  imagekitFileId?: string;
  notes?: string;
};

// Input type for the file-upload Server Action
export type UploadStudyInput = {
  patientId: string;
  patientName: string;
  notes?: string;
};

export type UpdateStudyInput = Partial<CreateStudyInput> & {
  id: string;
};

// ─── Study Status Display Map ─────────────────────────────────────────────────

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

export const STUDY_STATUS_COLORS: Record<
  StudyStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  IN_PROGRESS: "secondary",
  COMPLETED: "default",
  ARCHIVED: "destructive",
};

