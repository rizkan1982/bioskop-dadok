"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const AdsterraPopunder = dynamic(() => import("./AdsterrPopunder"), { ssr: false });
const AdsterraBanner728x90 = dynamic(() => import("./AdsterraBanner728x90"), { ssr: false });

/**
 * Conditional Ads Wrapper
 * Disables all ads on admin routes
 * Only shows ads on public pages
 */
const ConditionalAds: React.FC = () => {
  const pathname = usePathname();
  
  // Disable ads on admin routes
  const isAdminRoute = pathname?.startsWith("/admin");
  
  if (isAdminRoute) {
    return null; // No ads on admin pages
  }

  return (
    <>
      {/* Popunder Ad */}
      <AdsterraPopunder />
      
      {/* Banner 728x90 at Footer */}
      <AdsterraBanner728x90 />
    </>
  );
};

export default ConditionalAds;
