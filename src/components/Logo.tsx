"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface LogoProps {
  /** Width of the logo in pixels */
  width?: number;
  /** Height of the logo in pixels */
  height?: number;
  /** Additional CSS classes */
  className?: string;
}

export function Logo({ width = 120, height = 40, className = "" }: LogoProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check initial theme
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setTheme(isDark ? "dark" : "light");
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Image
      src={theme === "dark" ? "/logo/logol-dark.png" : "/logo/logo-light.png"}
      alt="Dewa Clinic X-Ray"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
