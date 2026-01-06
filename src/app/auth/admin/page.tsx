"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import Image from "next/image";
import AdminGoogleLoginButton from "@/components/ui/button/AdminGoogleLoginButton";
import { useSearchParams } from "next/navigation";
import { Alert } from "@heroui/react";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  const getErrorMessage = () => {
    switch (error) {
      case "unauthorized":
        return "Anda tidak memiliki akses admin. Hanya email yang terdaftar yang dapat mengakses dashboard admin.";
      case "auth_failed":
        return "Autentikasi gagal. Silakan coba lagi.";
      case "no_code":
        return "Kode autentikasi tidak ditemukan. Silakan coba lagi.";
      default:
        return null;
    }
  };
  
  const errorMessage = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.03),transparent_50%)] pointer-events-none" />
      <div className="fixed top-20 right-20 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-30 animate-pulse" />
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl opacity-30 animate-pulse" />

      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10">
        <CardHeader className="flex flex-col items-center gap-4 pt-8">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-primary/50 shadow-lg shadow-primary/20">
            <Image
              src="/dado.png"
              alt="DADO CINEMA"
              fill
              className="object-cover"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent">
              DADO CINEMA
            </h1>
            <p className="text-sm text-default-400 mt-1">Admin Panel Login</p>
          </div>
        </CardHeader>
        <CardBody className="p-6 flex flex-col items-center gap-4">
          {errorMessage && (
            <Alert
              color="danger"
              variant="flat"
              className="w-full"
              title="Error"
            >
              {errorMessage}
            </Alert>
          )}
          <AdminGoogleLoginButton variant="solid" className="w-full" />
        </CardBody>
      </Card>
    </div>
  );
}
