"use client";


import { Card, CardBody, CardHeader } from "@heroui/react";
import Image from "next/image";
import GoogleLoginButton from "@/components/ui/button/GoogleLoginButton";

export default function AdminLoginPage() {
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
        <CardBody className="p-6 flex flex-col items-center">
          <GoogleLoginButton variant="solid" className="w-full" />
        </CardBody>
      </Card>
    </div>
  );
}
