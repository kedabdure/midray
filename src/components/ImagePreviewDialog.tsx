"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  patientName: string;
  patientId?: string | null;
}

export function ImagePreviewDialog({
  open,
  onOpenChange,
  imageUrl,
  patientName,
  patientId,
}: ImagePreviewDialogProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);
  const [isDicom, setIsDicom] = useState(false);

  // Check if file is DICOM
  useEffect(() => {
    if (imageUrl) {
      const ext = imageUrl.split(".").pop()?.split("?")[0]?.toLowerCase();
      setIsDicom(ext === "dcm" || ext === "dicom");
    }
  }, [imageUrl]);

  const handleReset = () => {
    setZoom(100);
    setBrightness(100);
    setContrast(100);
    setInvert(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to download");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const extension = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
      link.download = `${patientName.replace(/\s+/g, "_")}_xray.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download the image. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${
          isFullscreen
            ? "w-screen h-screen max-w-none rounded-none"
            : "w-[95vw] max-w-6xl max-h-[90vh]"
        } p-0 transition-all duration-300`}
      >
        {/* Header */}
        <DialogHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{patientName}</DialogTitle>
              {patientId && (
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">
                  ID: {patientId}
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                  title="Zoom out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-xs font-medium min-w-[3rem] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(400, zoom + 25))}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                  title="Zoom in"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Download */}
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Download"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

              {/* Fullscreen toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>

              <DialogClose />
            </div>
          </div>
        </DialogHeader>

        {/* Image Container */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Main Image */}
          <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-4">
            {isDicom ? (
              <div className="text-center text-white p-8">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">DICOM File Detected</h3>
                <p className="text-slate-400 mb-4 text-sm">
                  This is a DICOM medical imaging file. For full DICOM viewer capabilities,<br />
                  please download the file and open it with a dedicated DICOM viewer.
                </p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Download DICOM File
                </button>
              </div>
            ) : (
              <div
                style={{
                  transform: `scale(${zoom / 100})`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? "invert(1)" : ""}`,
                  transition: "transform 0.2s ease, filter 0.2s ease",
                }}
                className="relative"
              >
                <Image
                  src={imageUrl}
                  alt={`X-ray for ${patientName}`}
                  width={800}
                  height={800}
                  className="max-w-full h-auto select-none"
                  draggable={false}
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* Side Panel - Controls */}
          <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Image Controls
              </h3>

              {/* Zoom - Mobile */}
              <div className="sm:hidden mb-4">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                  Zoom: {zoom}%
                </label>
                <input
                  type="range"
                  min="25"
                  max="400"
                  step="25"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Brightness */}
              <div className="mb-4">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                  Brightness: {brightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Contrast */}
              <div className="mb-4">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                  Contrast: {contrast}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Invert Toggle */}
              {!isDicom && (
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={invert}
                      onChange={(e) => setInvert(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Invert Colors
                    </span>
                  </label>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
              >
                Reset All
              </button>
            </div>

            {/* Image Info */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Image Information
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Patient:</span>
                  <p className="text-slate-900 dark:text-white font-medium">{patientName}</p>
                </div>
                {patientId && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Patient ID:</span>
                    <p className="text-slate-900 dark:text-white font-mono">{patientId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
