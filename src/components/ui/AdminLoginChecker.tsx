"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

// Key for storing admin login flag
const ADMIN_LOGIN_KEY = "admin_login_pending";

// Admin email whitelist
const ADMIN_EMAILS = [
  "stressgue934@gmail.com",
];

export default function AdminLoginChecker() {
  useEffect(() => {
    const checkAdminLogin = async () => {
      // Check if admin login flag exists
      const adminLoginPending = localStorage.getItem(ADMIN_LOGIN_KEY);
      
      if (!adminLoginPending) {
        return; // No admin login pending
      }

      console.log("Admin login flag detected, checking user...");

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.log("No user found, clearing flag");
          localStorage.removeItem(ADMIN_LOGIN_KEY);
          return;
        }

        const userEmail = user.email || "";
        const isAdmin = ADMIN_EMAILS.includes(userEmail);

        console.log("Admin check:", { email: userEmail, isAdmin });

        if (isAdmin) {
          // Redirect to admin callback page
          console.log("Redirecting to admin callback...");
          window.location.href = "/auth/admin/callback";
        } else {
          // Not admin, clear flag and show error
          localStorage.removeItem(ADMIN_LOGIN_KEY);
          window.location.href = "/auth/admin?error=unauthorized";
        }
      } catch (err) {
        console.error("Admin login check error:", err);
        localStorage.removeItem(ADMIN_LOGIN_KEY);
      }
    };

    // Small delay to ensure auth state is ready
    const timer = setTimeout(checkAdminLogin, 500);
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}
