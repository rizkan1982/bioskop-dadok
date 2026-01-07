"use client";

import { useEffect } from "react";

/**
 * Adsterra Native Banner Ad Component
 * Native banner ads blend naturally with content and generate good revenue
 * Ideal for placing in sidebars or between content sections
 */
const AdsterraNativeBanner: React.FC = () => {
  useEffect(() => {
    // Load native banner script
    if (typeof window !== "undefined" && !(window as any).adsterraNativeBannerLoaded) {
      const script = document.createElement("script");
      script.src = "https://pl28422553.effectivegatecpm.com/2084724fb93c971a86b3e8890fddb40e/invoke.js";
      script.async = true;
      script.defer = true;
      script.setAttribute("data-cfasync", "false");

      document.body.appendChild(script);
      (window as any).adsterraNativeBannerLoaded = true;
    }
  }, []);

  return (
    <div className="w-full my-4 px-2">
      <div 
        id="container-2084724fb93c971a86b3e8890fddb40e"
        className="flex justify-center min-h-[100px]"
      />
    </div>
  );
};

export default AdsterraNativeBanner;
