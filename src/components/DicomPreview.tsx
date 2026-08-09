"use client";

import { useEffect, useRef, useState } from "react";

interface DicomPreviewProps {
  file: File;
  className?: string;
}

export function DicomPreview({ file, className = "" }: DicomPreviewProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDicom() {
      try {
        setLoading(true);
        setError(null);

        // Dynamic import to avoid SSR issues
        const cornerstone = await import("cornerstone-core");
        const cornerstoneWADOImageLoader = await import("cornerstone-wado-image-loader");
        const dicomParser = await import("dicom-parser");

        // Configure WADO Image Loader
        cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
        cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

        cornerstoneWADOImageLoader.configure({
          useWebWorkers: false,
        });

        if (!canvasRef.current || !mounted) return;

        // Create canvas element
        const element = document.createElement("div");
        element.style.width = "100%";
        element.style.height = "100%";
        canvasRef.current.appendChild(element);

        // Enable the element for Cornerstone
        cornerstone.enable(element);

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const byteArray = new Uint8Array(arrayBuffer);

        // Parse DICOM file
        const dataSet = dicomParser.parseDicom(byteArray);

        // Create a blob URL for the file
        const blob = new Blob([byteArray], { type: "application/dicom" });
        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(blob);

        // Load and display the image
        const image = await cornerstone.loadImage(imageId);

        if (!mounted) return;

        cornerstone.displayImage(element, image);

        // Auto-adjust viewport
        const viewport = cornerstone.getDefaultViewportForImage(element, image);
        cornerstone.setViewport(element, viewport);

        setLoading(false);

        // Cleanup
        return () => {
          mounted = false;
          try {
            cornerstone.disable(element);
            element.remove();
          } catch (e) {
            // Element might already be removed
          }
        };
      } catch (err: any) {
        console.error("DICOM preview error:", err);
        if (mounted) {
          setError(err.message || "Failed to load DICOM file");
          setLoading(false);
        }
      }
    }

    loadDicom();

    return () => {
      mounted = false;
    };
  }, [file]);

  return (
    <div className={className}>
      {loading && (
        <div className="flex items-center justify-center h-full bg-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-xs text-slate-400">Loading DICOM...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-full bg-slate-900">
          <div className="text-center text-red-400 text-xs p-4">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
            <p className="text-slate-500 mt-1">DICOM preview not available</p>
          </div>
        </div>
      )}

      <div
        ref={canvasRef}
        className="w-full h-full bg-black"
        style={{ display: loading || error ? "none" : "block" }}
      />
    </div>
  );
}
