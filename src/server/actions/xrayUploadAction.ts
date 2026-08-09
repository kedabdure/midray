"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/server/services/authService";
import { uploadAndCreateStudy } from "@/server/services/studyService";
import type { ActionResponse, XrayStudy } from "@/types";


// ─── Validation Schema ────────────────────────────────────────────────────────

const UploadStudySchema = z.object({
  patientId: z.string().min(1, "Patient ID is required").max(50),
  patientName: z.string().min(2, "Patient name must be at least 2 characters").max(100),
  notes: z.string().max(1000).optional(),
});

// ─── Accepted MIME types ──────────────────────────────────────────────────────

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/dicom",
  // DICOM files are often served with octet-stream when no MIME is set
  "application/octet-stream",
];

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// ─── Server Action ────────────────────────────────────────────────────────────

/**
 * Handles the X-ray upload form submission.
 * 1. Validates the session (redirects to /login if not authenticated).
 * 2. Validates form fields with Zod.
 * 3. Validates the uploaded file (type + size).
 * 4. Delegates upload + DB insert to the service layer.
 * 5. Revalidates /dashboard so the new study appears immediately.
 */
export async function uploadStudyAction(
  formData: FormData
): Promise<ActionResponse<XrayStudy>> {
  try {
    console.log("[uploadStudyAction] Starting upload...");

    // Auth guard
    const session = await requireAuth();
    console.log("[uploadStudyAction] Auth OK, user:", session.user.id);

    // Extract & validate text fields
    const rawFields = {
      patientId: formData.get("patientId"),
      patientName: formData.get("patientName"),
      notes: formData.get("notes") ?? undefined,
    };

    console.log("[uploadStudyAction] Raw fields:", rawFields);

    const parsed = UploadStudySchema.safeParse(rawFields);
    if (!parsed.success) {
      console.error("[uploadStudyAction] Validation error:", parsed.error);
      return {
        success: false,
        error: parsed.error.issues.map((e) => e.message).join(", "),
      };
    }

    // Extract & validate file
    const file = formData.get("file");
    console.log("[uploadStudyAction] File from FormData:", file ? `${(file as File).name} (${(file as File).size} bytes)` : "null");

    if (!file || !(file instanceof File)) {
      console.error("[uploadStudyAction] No file or not File instance");
      return { success: false, error: "Please select a file to upload." };
    }

    if (file.size === 0) {
      console.error("[uploadStudyAction] File size is 0");
      return { success: false, error: "The selected file is empty." };
    }

    if (file.size > MAX_SIZE_BYTES) {
      console.error(`[uploadStudyAction] File too large: ${file.size} > ${MAX_SIZE_BYTES}`);
      return {
        success: false,
        error: `File too large. Maximum size is ${MAX_SIZE_MB} MB.`,
      };
    }

    // Allow DICOM by extension when MIME is octet-stream
    const isDicomByExtension = file.name.toLowerCase().endsWith(".dcm");
    const isAcceptedType = ACCEPTED_TYPES.includes(file.type) || isDicomByExtension;

    if (!isAcceptedType) {
      console.error("[uploadStudyAction] Unsupported file type:", file.type);
      return {
        success: false,
        error: "Unsupported file type. Please upload a DICOM, PNG, or JPEG file.",
      };
    }

    console.log("[uploadStudyAction] Starting ImageKit upload...");

    // Upload to ImageKit + create DB record
    const study = await uploadAndCreateStudy(session.user.id, file, parsed.data);

    console.log("[uploadStudyAction] Upload successful, study ID:", study.id);

    revalidatePath("/dashboard");

    return { success: true, data: study };
  } catch (error) {
    // Let Next.js redirect errors propagate
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("[uploadStudyAction] Error:", error);
    return { success: false, error: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}
