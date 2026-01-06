"use client";

import { useEffect } from "react";

// Key for storing admin login flag
const ADMIN_LOGIN_KEY = "admin_login_pending";

export default function AdminLoginChecker() {
  useEffect(() => {
    const checkAdminLogin = async () => {
      // Check if admin login flag exists
      const adminLoginPending = localStorage.getItem(ADMIN_LOGIN_KEY);
      
      if (!adminLoginPending) {
        return; // No admin login pending
      }

      console.log("[ADMIN LOGIN CHECK] Admin login flag detected, redirecting to server-side validation...");
      localStorage.removeItem(ADMIN_LOGIN_KEY);
      
      // Redirect to server-side callback that will check is_admin using service_role
      window.location.href = "/auth/admin/callback";
    };

    // Small delay to ensure auth state is ready
    const timer = setTimeout(checkAdminLogin, 500);
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}
