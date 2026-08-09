import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/services/authService";
import { createStudy } from "@/server/services/studyService";
import { z } from "zod";

const SaveStudySchema = z.object({
  imageUrl: z.string().url(),
  fileId: z.string(),
  patientId: z.string().min(1, "Patient ID is required").max(50),
  patientName: z.string().min(2, "Patient name must be at least 2 characters").max(100),
  notes: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log("[save-study] Starting...");

    const session = await requireAuth();
    console.log("[save-study] Auth OK, user:", session.user.id);

    const body = await request.json();
    console.log("[save-study] Body:", body);

    const validation = SaveStudySchema.safeParse(body);
    if (!validation.success) {
      console.error("[save-study] Validation error:", validation.error);
      return NextResponse.json(
        { success: false, error: validation.error.issues.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    // Create study in database
    const study = await createStudy(session.user.id, {
      imageUrl: validation.data.imageUrl,
      imagekitFileId: validation.data.fileId,
      patientId: validation.data.patientId,
      patientName: validation.data.patientName,
      notes: validation.data.notes,
      status: "PENDING",
    });

    console.log("[save-study] Study created, ID:", study.id);

    return NextResponse.json({ success: true, data: study });

  } catch (error) {
    console.error("[save-study] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save study" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
