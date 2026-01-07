"use client";

import { useEffect } from "react";

/**
 * Adsterra Popunder Ad Component
 * Popunder ads appear behind the current window and generate high revenue
 * Place this component in your layout to enable popunder ads
 */
const AdsterraPopunder: React.FC = () => {
  useEffect(() => {
    // Load popunder script only once
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://pl28422548.effectivegatecpm.com/bd/ac/32/bdac325954e51604c8a7f23ca13559a1.js";
      script.async = true;
      script.defer = true;
      
      // Only add to document if not already present
      if (!document.querySelector('script[src*="bdac325954e51604c8a7f23ca13559a1"]')) {
        document.head.appendChild(script);
      }
    }
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default AdsterraPopunder;
