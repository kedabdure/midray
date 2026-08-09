import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/services/authService";
import { uploadAndCreateStudy } from "@/server/services/studyService";
import { z } from "zod";

// Validation Schema
const UploadStudySchema = z.object({
  patientId: z.string().min(1, "Patient ID is required").max(50),
  patientName: z.string().min(2, "Patient name must be at least 2 characters").max(100),
  notes: z.string().max(1000).optional(),
});

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/dicom",
  "application/octet-stream",
];

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    console.log("[upload/route] Starting upload...");

    // Auth guard
    const session = await requireAuth();
    console.log("[upload/route] Auth OK, user:", session.user.id);

    // Get content length to check if file is too large before parsing
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_SIZE_BYTES) {
      console.error(`[upload/route] Request too large: ${contentLength} bytes`);
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${MAX_SIZE_MB} MB.`
        },
        { status: 413 }
      );
    }

    // Parse FormData directly - Next.js should handle this with proper config
    let formData: FormData;
    try {
      // Clone the request to avoid consuming the body
      const clonedRequest = request.clone();
      formData = await clonedRequest.formData();
      console.log("[upload/route] FormData keys:", Array.from(formData.keys()));
    } catch (parseError) {
      console.error("[upload/route] FormData parse error:", parseError);
      console.error("[upload/route] Error details:", parseError instanceof Error ? parseError.message : "Unknown error");
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse upload. Try a smaller file or different format."
        },
        { status: 400 }
      );
    }

    // Extract & validate text fields
    const rawFields = {
      patientId: formData.get("patientId"),
      patientName: formData.get("patientName"),
      notes: formData.get("notes") ?? undefined,
    };

    console.log("[upload/route] Raw fields:", rawFields);

    const parsed = UploadStudySchema.safeParse(rawFields);
    if (!parsed.success) {
      console.error("[upload/route] Validation error:", parsed.error);
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((e) => e.message).join(", ")
        },
        { status: 400 }
      );
    }

    // Extract & validate file
    const file = formData.get("file");
    console.log("[upload/route] File:", file ? `${(file as File).name} (${(file as File).size} bytes)` : "null");

    if (!file || !(file instanceof File)) {
      console.error("[upload/route] No file or not File instance");
      return NextResponse.json(
        { success: false, error: "Please select a file to upload." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      console.error("[upload/route] File size is 0");
      return NextResponse.json(
        { success: false, error: "The selected file is empty." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      console.error(`[upload/route] File too large: ${file.size} > ${MAX_SIZE_BYTES}`);
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${MAX_SIZE_MB} MB.`
        },
        { status: 400 }
      );
    }

    // Allow DICOM by extension when MIME is octet-stream
    const isDicomByExtension = file.name.toLowerCase().endsWith(".dcm");
    const isAcceptedType = ACCEPTED_TYPES.includes(file.type) || isDicomByExtension;

    if (!isAcceptedType) {
      console.error("[upload/route] Unsupported file type:", file.type);
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Please upload a DICOM, PNG, or JPEG file."
        },
        { status: 400 }
      );
    }

    console.log("[upload/route] Starting ImageKit upload...");

    // Upload to ImageKit + create DB record
    const study = await uploadAndCreateStudy(session.user.id, file, parsed.data);

    console.log("[upload/route] Upload successful, study ID:", study.id);

    return NextResponse.json({ success: true, data: study });

  } catch (error) {
    console.error("[upload/route] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
      },
      { status: 500 }
    );
  }
}

// Route configuration
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// This is the critical part - tell Next.js to increase body size limit
export const experimental_bodyParser = {
  sizeLimit: '50mb',
};
