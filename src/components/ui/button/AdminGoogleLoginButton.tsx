"use client";

import { Google } from "@/utils/icons";
import { createClient } from "@/utils/supabase/client";
import { addToast, Button } from "@heroui/react";
import { useCallback } from "react";

type AdminGoogleLoginButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "startContent" | "onPress"
>;

const supabase = createClient();

// Key for storing admin login flag
const ADMIN_LOGIN_KEY = "admin_login_pending";

const AdminGoogleLoginButton: React.FC<AdminGoogleLoginButtonProps> = ({ variant = "solid", ...props }) => {
  const handleGoogleLogin = useCallback(async () => {
    try {
      // Set flag in localStorage before redirect
      // This will be checked in the callback route
      localStorage.setItem(ADMIN_LOGIN_KEY, "true");
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/api/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        // Clear flag if error
        localStorage.removeItem(ADMIN_LOGIN_KEY);
        addToast({
          title: error.message,
          color: "danger",
        });
      }
    } catch (error) {
      localStorage.removeItem(ADMIN_LOGIN_KEY);
      console.error("Google login error:", error);
      addToast({
        title: error instanceof Error ? error.message : "An error occurred. Please try again.",
        color: "danger",
      });
    }
  }, []);

  return (
    <Button
      startContent={<Google width={24} />}
      onPress={handleGoogleLogin}
      variant={variant}
      {...props}
    >
      Continue with Google
    </Button>
  );
};

export default AdminGoogleLoginButton;
