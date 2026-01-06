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

const AdminGoogleLoginButton: React.FC<AdminGoogleLoginButtonProps> = ({ variant = "solid", ...props }) => {
  const handleGoogleLogin = useCallback(async () => {
    try {
      // Use regular callback with admin_login parameter
      // This works because Supabase only allows whitelisted redirect URLs
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/api/auth/callback?admin_login=true`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        addToast({
          title: error.message,
          color: "danger",
        });
      }
    } catch (error) {
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
