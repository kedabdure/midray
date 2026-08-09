import { prisma } from "../../../prisma/db";
import type { CreateStudyInput, UpdateStudyInput, UploadStudyInput } from "@/types";
import { StudyStatus } from "@prisma/client";
import { imagekit } from "@/lib/imagekit";

/**
 * Fetch all XrayStudy records for a given user, ordered newest first.
 */
export async function getAllStudies(userId: string) {
  return prisma.xrayStudy.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Fetch a single XrayStudy by ID, ensuring it belongs to the requesting user.
 * Returns null if not found or unauthorized.
 */
export async function getStudyById(id: string, userId: string) {
  return prisma.xrayStudy.findFirst({
    where: { id, userId },
  });
}

/**
 * Create a new XrayStudy record for a user.
 */
export async function createStudy(userId: string, data: CreateStudyInput) {
  return prisma.xrayStudy.create({
    data: {
      userId,
      patientName: data.patientName,
      patientId: data.patientId,
      status: data.status ?? StudyStatus.PENDING,
      imageUrl: data.imageUrl,
      imagekitFileId: data.imagekitFileId,
      notes: data.notes,
    },
  });
}

/**
 * Upload a file buffer to ImageKit and create an XrayStudy record in one step.
 * Accepts the raw File from FormData, converts to Buffer server-side.
 */
export async function uploadAndCreateStudy(
  userId: string,
  file: File,
  data: UploadStudyInput
) {
  // Convert browser File to Node Buffer for ImageKit Node SDK
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Sanitise filename — replace spaces, keep extension
  const safeName = file.name.replace(/\s+/g, "_");
  const folder = `/midray/studies/${userId}`;

  // Upload to ImageKit (server-side — private key never hits client)
  const uploadResult = await imagekit.upload({
    file: buffer,
    fileName: safeName,
    folder,
    useUniqueFileName: true,
    tags: [data.patientId].filter(Boolean) as string[],
  });

  // Persist the record in PostgreSQL
  return prisma.xrayStudy.create({
    data: {
      userId,
      patientName: data.patientName,
      patientId: data.patientId,
      status: StudyStatus.PENDING,
      imageUrl: uploadResult.url,
      imagekitFileId: uploadResult.fileId,
      notes: data.notes,
    },
  });
}

/**
 * Update an existing XrayStudy record (ownership-checked).
 * Returns null if not found or the study doesn't belong to the user.
 */
export async function updateStudy(userId: string, data: UpdateStudyInput) {
  // Ownership check first
  const existing = await prisma.xrayStudy.findFirst({
    where: { id: data.id, userId },
  });

  if (!existing) return null;

  const { id, ...updateData } = data;

  return prisma.xrayStudy.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Delete an XrayStudy record (ownership-checked).
 * Returns true on success, false if not found or unauthorized.
 */
export async function deleteStudy(id: string, userId: string) {
  const existing = await prisma.xrayStudy.findFirst({
    where: { id, userId },
  });

  if (!existing) return false;

  await prisma.xrayStudy.delete({ where: { id } });
  return true;
}

/**
 * Get study counts grouped by status for dashboard stats.
 */
export async function getStudyStats(userId: string) {
  const counts = await prisma.xrayStudy.groupBy({
    by: ["status"],
    where: { userId },
    _count: { id: true },
  });

  const stats = {
    PENDING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    ARCHIVED: 0,
    total: 0,
  };

  for (const entry of counts) {
    const key = entry.status as keyof typeof stats;
    if (key in stats) {
      stats[key] = entry._count.id;
    }
    stats.total += entry._count.id;
  }

  return stats;
}
