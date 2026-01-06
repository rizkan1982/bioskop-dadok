"use client";

import { useEffect } from "react";

// Redirect to the main ads page at /admin
export default function AdsPage() {
  useEffect(() => {
    window.location.href = "/admin";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-default-500">Mengalihkan ke Ads Manager...</p>
      </div>
    </div>
  );
}
