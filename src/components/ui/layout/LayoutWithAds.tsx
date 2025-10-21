"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { ReactNode } from "react";

const CustomAdBanner = dynamic(() => import("@/components/ui/ads/CustomAdBanner"));

interface LayoutWithAdsProps {
  children: ReactNode;
}

export default function LayoutWithAds({ children }: LayoutWithAdsProps) {
  const pathname = usePathname();
  
  // Check if current page is a player page (watching video)
  const isPlayerPage = pathname?.includes("/player");
  
  // Don't show sidebar ads on player pages
  if (isPlayerPage) {
    return (
      <main className="container mx-auto max-w-full w-full">
        {children}
      </main>
    );
  }
  
  // Show sidebar ads on other pages (homepage, detail, etc)
  return (
    <div className="flex w-full">
      <main className="container mx-auto max-w-full flex-1 pb-safe">
        {children}
      </main>
      {/* Sidebar Banner Ads - Hidden on mobile, visible on large screens */}
      <aside className="hidden xl:block w-72 flex-shrink-0 sticky top-20 h-fit p-4">
        <CustomAdBanner position="sidebar" />
      </aside>
    </div>
  );
}
