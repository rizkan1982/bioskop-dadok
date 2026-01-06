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
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error("[ADMIN LOGIN CHECK] Error getting user:", userError);
          localStorage.removeItem(ADMIN_LOGIN_KEY);
          window.location.href = "/auth/admin?error=unauthorized";
          return;
        }

        if (!user) {
          console.log("[ADMIN LOGIN CHECK] No user found, clearing flag");
          localStorage.removeItem(ADMIN_LOGIN_KEY);
          return;
        }

        const userEmail = user.email || "";
        console.log("[ADMIN LOGIN CHECK] Checking if user is admin:", userEmail, "with ID:", user.id);

        // Try to fetch profile with retry logic
        let profile = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (!profile && attempts < maxAttempts) {
          console.log("[ADMIN LOGIN CHECK] Attempt", attempts + 1, "to fetch profile...");
          
          const { data: fetchedProfile, error: fetchError } = await supabase
            .from("profiles")
            .select("id, email, is_admin")
            .eq("id", user.id)
            .single();

          if (fetchError) {
            console.warn("[ADMIN LOGIN CHECK] Fetch error (attempt", attempts + 1 + "):", fetchError);
            attempts++;
            
            if (attempts < maxAttempts) {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } else {
            profile = fetchedProfile;
            console.log("[ADMIN LOGIN CHECK] Profile fetched successfully:", profile);
          }
        }

        if (!profile) {
          console.error("[ADMIN LOGIN CHECK] Failed to fetch profile after", maxAttempts, "attempts");
          localStorage.removeItem(ADMIN_LOGIN_KEY);
          window.location.href = "/auth/admin?error=unauthorized";
          return;
        }

        console.log("[ADMIN LOGIN CHECK] Profile is_admin status:", profile.is_admin, "Type:", typeof profile.is_admin);

        const isAdmin = profile.is_admin === true;

        if (isAdmin) {
          // Redirect to admin callback page
          console.log("[ADMIN LOGIN CHECK] User is admin, redirecting to admin callback...");
          window.location.href = "/auth/admin/callback";
        } else {
          // Not admin, clear flag and show error
          console.log("[ADMIN LOGIN CHECK] User is not admin (is_admin=" + profile.is_admin + "), showing unauthorized error");
          localStorage.removeItem(ADMIN_LOGIN_KEY);
          window.location.href = "/auth/admin?error=unauthorized";
        }
      } catch (err) {
        console.error("[ADMIN LOGIN CHECK] Admin login check error:", err);
        localStorage.removeItem(ADMIN_LOGIN_KEY);
        window.location.href = "/auth/admin?error=auth_failed";
      }
    };

    // Small delay to ensure auth state is ready
    const timer = setTimeout(checkAdminLogin, 500);
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}
