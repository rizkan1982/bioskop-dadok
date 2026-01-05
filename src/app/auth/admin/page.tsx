"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import Image from "next/image";
import { Eye, EyeOff } from "@/utils/icons";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              src="/icons/dadologobaru.png"
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
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-danger/20 border border-danger/50 text-danger text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <Input
              label="Username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="bordered"
              classNames={{
                inputWrapper: "bg-white/5 border-white/20 hover:border-primary/50",
              }}
              required
            />

            <Input
              label="Password"
              placeholder="Enter password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="bordered"
              classNames={{
                inputWrapper: "bg-white/5 border-white/20 hover:border-primary/50",
              }}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-default-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              required
            />

            <Button
              type="submit"
              color="primary"
              className="w-full font-semibold"
              isLoading={loading}
              size="lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-default-500">
              Default credentials: <span className="text-primary">admin</span> / <span className="text-primary">admin123</span>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
