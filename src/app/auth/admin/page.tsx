"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import Image from "next/image";
import AdminGoogleLoginButton from "@/components/ui/button/AdminGoogleLoginButton";
import { useSearchParams } from "next/navigation";
import { HiShieldCheck, HiExclamationTriangle } from "react-icons/hi2";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    switch (error) {
      case "unauthorized":
        return "Email Anda tidak memiliki akses admin. Hubungi administrator.";
      case "auth_failed":
        return "Autentikasi gagal. Silakan coba lagi.";
      case "no_code":
        return "Kode autentikasi tidak ditemukan.";
      default:
        return null;
    }
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.08),transparent_40%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.08),transparent_40%)]" />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <Card className="w-full max-w-md bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl relative">
        <CardHeader className="flex flex-col items-center gap-4 pt-8 pb-4">
          {/* Logo */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-xl" />
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white/20 shadow-2xl">
              <Image
                src="/dado.png"
                alt="DADO CINEMA"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent">
              DADO CINEMA
            </h1>
            <div className="flex items-center justify-center gap-2 text-default-400">
              <HiShieldCheck className="text-primary text-lg" />
              <span className="text-sm font-medium">Admin Panel</span>
            </div>
          </div>
        </CardHeader>

        <Divider className="bg-white/5" />

        <CardBody className="p-6 sm:p-8 space-y-6">
          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20">
              <HiExclamationTriangle className="text-danger text-xl flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-danger">Akses Ditolak</p>
                <p className="text-xs text-danger/80 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-default-400">
              Login dengan akun Google yang terdaftar sebagai admin untuk mengakses dashboard.
            </p>
          </div>

          {/* Login Button */}
          <AdminGoogleLoginButton 
            variant="solid" 
            className="w-full h-12 font-semibold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow" 
          />

          {/* Security Notice */}
          <div className="flex items-center gap-2 justify-center text-xs text-default-500">
            <HiShieldCheck className="text-success" />
            <span>Koneksi aman dengan enkripsi SSL</span>
          </div>
        </CardBody>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-default-400">DADO CINEMA Admin v2.0</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
