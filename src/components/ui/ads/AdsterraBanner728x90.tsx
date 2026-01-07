"use client";

import { useEffect } from "react";

/**
 * Adsterra 728x90 Banner Ad Component (Leaderboard)
 * Standard banner format that generates high revenue
 * Typically placed in header or footer
 */
const AdsterraBanner728x90: React.FC = () => {
  useEffect(() => {
    // Load banner script
    if (typeof window !== "undefined" && !(window as any).adsterraBanner728x90Loaded) {
      const script = document.createElement("script");
      script.innerHTML = `
        atOptions = {
          'key' : '9f63f90f2d119cf78eea31cceffc6db9',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      document.body.appendChild(script);

      const scriptInvoke = document.createElement("script");
      scriptInvoke.src = "https://www.highperformanceformat.com/9f63f90f2d119cf78eea31cceffc6db9/invoke.js";
      scriptInvoke.async = true;
      scriptInvoke.defer = true;

      document.body.appendChild(scriptInvoke);
      (window as any).adsterraBanner728x90Loaded = true;
    }
  }, []);

  return (
    <div className="w-full flex justify-center py-4">
      <div className="flex justify-center min-h-[100px]">
        {/* Ad will be injected here */}
      </div>
    </div>
  );
};

export default AdsterraBanner728x90;
