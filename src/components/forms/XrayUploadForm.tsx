"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadStudyAction } from "@/server/actions/xrayUploadAction";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormStatus =
  | { type: "idle" }
  | { type: "uploading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCEPTED_EXTENSIONS = ".dcm,.png,.jpg,.jpeg";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function XrayUploadForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = isPending || status.type === "uploading";

  // ── File selection ──────────────────────────────────────────────────────────

  function handleFileChange(file: File | null) {
    if (!file) {
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    // Clear previous result status when new file selected
    if (status.type === "success" || status.type === "error") {
      setStatus({ type: "idle" });
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFileChange(e.target.files?.[0] ?? null);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setStatus({ type: "idle" });
  }

  // ── Form submission ─────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isUploading) return;

    setStatus({ type: "uploading" });

    const formData = new FormData(e.currentTarget);

    // Append selected file if dragged (may not be in native FormData)
    if (selectedFile && !formData.get("file")) {
      formData.set("file", selectedFile);
    }

    startTransition(async () => {
      const result = await uploadStudyAction(formData);

      if (result.success) {
        setStatus({ type: "success", message: "Study uploaded successfully!" });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        // Redirect to dashboard after short delay so user sees the success message
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setStatus({ type: "error", message: result.error });
      }
    });
  }

  // ── Image preview ───────────────────────────────────────────────────────────

  const isImageFile =
    selectedFile &&
    (selectedFile.type.startsWith("image/") ||
      selectedFile.name.toLowerCase().endsWith(".jpg") ||
      selectedFile.name.toLowerCase().endsWith(".png"));

  const previewUrl = isImageFile ? URL.createObjectURL(selectedFile) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* ── Status Banner ─────────────────────────────────────────────────── */}
      {status.type === "success" && (
        <div
          role="status"
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
        >
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {status.message}
        </div>
      )}

      {status.type === "error" && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {status.message}
        </div>
      )}

      {/* ── Patient ID ────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="patientId" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          Patient ID <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <input
          id="patientId"
          name="patientId"
          type="text"
          required
          disabled={isUploading}
          placeholder="e.g. PT-00123 or MRN-456"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm border border-slate-200 dark:border-transparent
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* ── Patient Name ──────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="patientName" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          Patient Name <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <input
          id="patientName"
          name="patientName"
          type="text"
          required
          disabled={isUploading}
          placeholder="Full name"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm border border-slate-200 dark:border-transparent
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* ── Notes ─────────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          Notes <span className="text-slate-400 dark:text-slate-600">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          disabled={isUploading}
          placeholder="Clinical notes, findings…"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm border border-slate-200 dark:border-transparent
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* ── File Drop Zone ────────────────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          DICOM / Image File <span className="text-red-500 dark:text-red-400">*</span>
        </label>

        {selectedFile ? (
          /* ── Selected File Preview ──────────────────────────────────── */
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 p-4 flex items-center gap-4">
            {previewUrl ? (
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onLoad={() => URL.revokeObjectURL(previewUrl)}
                />
              </div>
            ) : (
              /* DICOM placeholder */
              <div className="w-14 h-14 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{formatBytes(selectedFile.size)}</p>
            </div>

            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={isUploading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              aria-label="Remove file"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          /* ── Drop Zone ──────────────────────────────────────────────── */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            aria-label="Click or drag and drop a file to upload"
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-blue-500/60 bg-blue-500/5"
                : "border-slate-300 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/20 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
            } disabled:opacity-50`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200/60 dark:bg-slate-700/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-300">
                {isDragging ? "Drop file here" : "Click to browse or drag & drop"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                DICOM (.dcm), PNG, JPEG — max 20 MB
              </p>
            </div>
          </div>
        )}

        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          id="file"
          name="file"
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className="sr-only"
          aria-hidden="true"
        />
      </div>

      {/* ── Submit Button ─────────────────────────────────────────────────── */}
      <button
        id="btn-upload-study"
        type="submit"
        disabled={isUploading || !selectedFile}
        className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white
          bg-gradient-to-r from-blue-500 to-violet-600
          hover:from-blue-600 hover:to-violet-700
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all shadow-md shadow-blue-500/20 active:scale-[0.99]"
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Uploading…
          </span>
        ) : (
          "Upload Study"
        )}
      </button>
    </form>
  );
}
