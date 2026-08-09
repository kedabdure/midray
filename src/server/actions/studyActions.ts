"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/server/services/authService";
import {
  getAllStudies,
  createStudy,
  updateStudy,
  deleteStudy,
  getStudyStats,
} from "@/server/services/studyService";
import type { ActionResponse, XrayStudy, CreateStudyInput } from "@/types";
import { StudyStatus } from "@prisma/client";

// ─── Validation Schemas ───────────────────────────────────────────────────────

const CreateStudySchema = z.object({
  patientName: z.string().min(2, "Patient name must be at least 2 characters").max(100),
  patientId: z.string().max(50).optional(),
  status: z.nativeEnum(StudyStatus).optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
});

const UpdateStudySchema = CreateStudySchema.partial().extend({
  id: z.string().min(1, "Study ID is required"),
});

const DeleteStudySchema = z.object({
  id: z.string().min(1, "Study ID is required"),
});

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Fetch all studies for the currently authenticated user.
 */
export async function getStudiesAction(): Promise<ActionResponse<XrayStudy[]>> {
  try {
    const session = await requireAuth();
    const studies = await getAllStudies(session.user.id);
    return { success: true, data: studies };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("[getStudiesAction]", error);
    return { success: false, error: "Failed to fetch studies." };
  }
}

/**
 * Create a new XrayStudy for the currently authenticated user.
 */
export async function createStudyAction(
  input: CreateStudyInput
): Promise<ActionResponse<XrayStudy>> {
  try {
    const session = await requireAuth();

    const parsed = CreateStudySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((e) => e.message).join(", "),
      };
    }

    const study = await createStudy(session.user.id, parsed.data);
    revalidatePath("/dashboard");
    return { success: true, data: study };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("[createStudyAction]", error);
    return { success: false, error: "Failed to create study." };
  }
}

/**
 * Update an existing XrayStudy (ownership-checked).
 */
export async function updateStudyAction(
  input: z.infer<typeof UpdateStudySchema>
): Promise<ActionResponse<XrayStudy>> {
  try {
    const session = await requireAuth();

    const parsed = UpdateStudySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((e) => e.message).join(", "),
      };
    }

    const updated = await updateStudy(session.user.id, parsed.data);
    if (!updated) {
      return { success: false, error: "Study not found or access denied." };
    }

    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("[updateStudyAction]", error);
    return { success: false, error: "Failed to update study." };
  }
}

/**
 * Delete an XrayStudy (ownership-checked).
 */
export async function deleteStudyAction(
  input: z.infer<typeof DeleteStudySchema>
): Promise<ActionResponse<void>> {
  try {
    const session = await requireAuth();

    const parsed = DeleteStudySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid study ID." };
    }

    const deleted = await deleteStudy(parsed.data.id, session.user.id);
    if (!deleted) {
      return { success: false, error: "Study not found or access denied." };
    }

    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("[deleteStudyAction]", error);
    return { success: false, error: "Failed to delete study." };
  }
}

/**
 * Get dashboard statistics for the currently authenticated user.
 */
export async function getStudyStatsAction(): Promise<
  ActionResponse<Awaited<ReturnType<typeof getStudyStats>>>
> {
  try {
    const session = await requireAuth();
    const stats = await getStudyStats(session.user.id);
    return { success: true, data: stats };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("[getStudyStatsAction]", error);
    return { success: false, error: "Failed to fetch stats." };
  }
}
