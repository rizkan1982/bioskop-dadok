"use client";

import { useEffect, useRef } from "react";

/**
 * Adsterra 728x90 Banner Ad Component (Leaderboard)
 * Standard banner format that generates high revenue
 * Typically placed in header or footer
 */
const AdsterraBanner728x90: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadBanner = async () => {
      try {
        if (typeof window !== "undefined") {
          // First inject the configuration
          const configScript = document.createElement("script");
          configScript.innerHTML = `
            window.atOptions = {
              'key' : '9f63f90f2d119cf78eea31cceffc6db9',
              'format' : 'iframe',
              'height' : 90,
              'width' : 728,
              'params' : {}
            };
          `;
          document.body.appendChild(configScript);

          // Then load the invoke script
          await new Promise((resolve) => {
            setTimeout(resolve, 100); // Small delay to ensure config is set
          });

          const invokeScript = document.createElement("script");
          invokeScript.src = "https://www.highperformanceformat.com/9f63f90f2d119cf78eea31cceffc6db9/invoke.js";
          invokeScript.async = true;

          invokeScript.onload = () => {
            console.log("✅ Adsterra Banner 728x90 loaded");
          };
          invokeScript.onerror = () => {
            console.error("❌ Failed to load Adsterra Banner 728x90");
          };

          document.body.appendChild(invokeScript);
        }
      } catch (error) {
        console.error("Error loading Adsterra Banner 728x90:", error);
      }
    };

    loadBanner();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center py-4 px-2">
      <div className="flex justify-center w-full max-w-[728px] min-h-[90px] bg-gradient-to-b from-background to-background/50 rounded-lg overflow-hidden">
        {/* Adsterra banner will be injected here */}
      </div>
    </div>
  );
};

export default AdsterraBanner728x90;
