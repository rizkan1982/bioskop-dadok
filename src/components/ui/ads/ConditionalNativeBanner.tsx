"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const AdsterraNativeBanner = dynamic(() => import("./AdsterraNativeBanner"), { ssr: false });

/**
 * Conditional Native Banner Ad
 * Disables native banner on admin routes
 * Only shows on public pages
 */
const ConditionalNativeBanner: React.FC = () => {
  const pathname = usePathname();
  
  // Disable ads on admin routes (including admin auth)
  const isAdminRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/auth/admin");
  
  if (isAdminRoute) {
    return null; // No ads on admin pages
  }

  return <AdsterraNativeBanner />;
};

export default ConditionalNativeBanner;
