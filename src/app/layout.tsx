import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dewa Clinic X-Ray — Study Management",
    template: "%s | Dewa Clinic X-Ray",
  },
  description:
    "A modern, production-ready platform for managing and reviewing medical imaging studies.",
  keywords: ["radiology", "x-ray", "DICOM", "medical imaging", "study management"],
  authors: [{ name: "Dewa Clinic" }],
  openGraph: {
    title: "Dewa Clinic X-Ray — Study Management",
    description: "Manage and review medical imaging studies with ease.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
