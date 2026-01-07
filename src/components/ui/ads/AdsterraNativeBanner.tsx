"use client";

import { useEffect, useRef } from "react";

/**
 * Adsterra Native Banner Ad Component
 * Native banner ads blend naturally with content and generate good revenue
 * Ideal for placing in sidebars or between content sections
 */
const AdsterraNativeBanner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load native banner script with proper timing
    const loadScript = async () => {
      try {
        if (typeof window !== "undefined") {
          const script = document.createElement("script");
          script.src = "https://pl28422553.effectivegatecpm.com/2084724fb93c971a86b3e8890fddb40e/invoke.js";
          script.async = true;
          script.setAttribute("data-cfasync", "false");

          script.onload = () => {
            console.log("✅ Adsterra Native Banner script loaded");
          };
          script.onerror = () => {
            console.error("❌ Failed to load Adsterra Native Banner");
          };

          document.body.appendChild(script);
        }
      } catch (error) {
        console.error("Error loading Adsterra Native Banner:", error);
      }
    };

    loadScript();
  }, []);

  return (
    <div ref={containerRef} className="w-full my-6 px-2">
      <div 
        id="container-2084724fb93c971a86b3e8890fddb40e"
        className="flex justify-center min-h-[120px] bg-gradient-to-b from-background to-background/50 rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default AdsterraNativeBanner;
