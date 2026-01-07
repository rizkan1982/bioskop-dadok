"use client";

import Script from "next/script";

/**
 * Adsterra Popunder Ad Component
 * Popunder ads appear behind the current window and generate high revenue
 * This uses Next.js Script component for proper loading in head
 */
const AdsterraPopunder: React.FC = () => {
  return (
    <Script
      src="https://pl28422548.effectivegatecpm.com/bd/ac/32/bdac325954e51604c8a7f23ca13559a1.js"
      strategy="lazyOnload"
      onLoad={() => {
        console.log("✅ Adsterra Popunder loaded");
      }}
      onError={() => {
        console.error("❌ Failed to load Adsterra Popunder");
      }}
    />
  );
};

export default AdsterraPopunder;
