"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

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

      console.log("[ADMIN LOGIN CHECK] Admin login flag detected, checking user...");

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.log("[ADMIN LOGIN CHECK] No user found, clearing flag");
          localStorage.removeItem(ADMIN_LOGIN_KEY);
          return;
        }

        const userEmail = user.email || "";
        console.log("[ADMIN LOGIN CHECK] Checking if user is admin:", userEmail);

        // Check is_admin field from database
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("[ADMIN LOGIN CHECK] Error fetching profile:", error);
          localStorage.removeItem(ADMIN_LOGIN_KEY);
          window.location.href = "/auth/admin?error=unauthorized";
          return;
        }

        console.log("[ADMIN LOGIN CHECK] Profile is_admin status:", profile?.is_admin);

        const isAdmin = profile?.is_admin === true;

        if (isAdmin) {
          // Redirect to admin callback page
          console.log("[ADMIN LOGIN CHECK] User is admin, redirecting to admin callback...");
          window.location.href = "/auth/admin/callback";
        } else {
          // Not admin, clear flag and show error
          console.log("[ADMIN LOGIN CHECK] User is not admin, showing unauthorized error");
          localStorage.removeItem(ADMIN_LOGIN_KEY);
          window.location.href = "/auth/admin?error=unauthorized";
        }
      } catch (err) {
        console.error("[ADMIN LOGIN CHECK] Admin login check error:", err);
        localStorage.removeItem(ADMIN_LOGIN_KEY);
      }
    };

    // Small delay to ensure auth state is ready
    const timer = setTimeout(checkAdminLogin, 500);
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}
