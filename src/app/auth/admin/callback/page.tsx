"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Spinner } from "@heroui/react";

// Key for storing admin login flag
const ADMIN_LOGIN_KEY = "admin_login_pending";

// Admin email whitelist
const ADMIN_EMAILS = [
  "stressgue934@gmail.com",
];

export default function AdminCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Memverifikasi akses admin...");

  useEffect(() => {
    const checkAdminAndRedirect = async () => {
      try {
        const supabase = createClient();
        
        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          setStatus("error");
          setMessage("Tidak dapat memverifikasi user. Silakan login ulang.");
          setTimeout(() => {
            window.location.href = "/auth/admin";
          }, 2000);
          return;
        }

        const userEmail = user.email || "";
        const isAdmin = ADMIN_EMAILS.includes(userEmail);
        
        console.log("Admin check:", { email: userEmail, isAdmin });
        
        if (!isAdmin) {
          setStatus("error");
          setMessage("Email Anda tidak memiliki akses admin.");
          // Clear admin flag
          localStorage.removeItem(ADMIN_LOGIN_KEY);
          setTimeout(() => {
            window.location.href = "/auth/admin?error=unauthorized";
          }, 2000);
          return;
        }

        // User is admin - create session via API
        const response = await fetch("/api/admin/create-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            username: userEmail.split("@")[0] || user.user_metadata?.full_name || "Admin",
          }),
        });

        if (!response.ok) {
          throw new Error("Gagal membuat session admin");
        }

        // Clear admin flag
        localStorage.removeItem(ADMIN_LOGIN_KEY);
        
        setStatus("success");
        setMessage("Login berhasil! Mengarahkan ke dashboard...");
        
        // Redirect to admin dashboard
        setTimeout(() => {
          window.location.href = "/admin";
        }, 1000);

      } catch (err) {
        console.error("Admin callback error:", err);
        setStatus("error");
        setMessage("Terjadi kesalahan. Silakan coba lagi.");
        localStorage.removeItem(ADMIN_LOGIN_KEY);
        setTimeout(() => {
          window.location.href = "/auth/admin?error=unknown";
        }, 2000);
      }
    };

    checkAdminAndRedirect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="text-center">
        {status === "loading" && (
          <Spinner size="lg" color="primary" />
        )}
        <p className={`mt-4 text-lg ${
          status === "error" ? "text-red-400" : 
          status === "success" ? "text-green-400" : 
          "text-white"
        }`}>
          {message}
        </p>
      </div>
    </div>
  );
}
