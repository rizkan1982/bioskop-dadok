import AdminSidebar from "@/components/sections/Admin/Sidebar";
import { isAdmin } from "@/actions/admin";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function AdminLayout({ children }: { children: React.Node }) {
  const admin = await isAdmin();
  
  if (!admin) {
    redirect("/");
  }
  
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.03),transparent_50%)] pointer-events-none" />
      <div className="fixed top-20 right-20 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-30 animate-pulse" />
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' } as React.CSSProperties} />
      
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative">
        {/* Admin Header Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 border border-white/5 backdrop-blur-sm">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden ring-2 ring-primary/50 shadow-lg shadow-primary/20">
              <Image
                src="/icons/dadologo.png"
                alt="Cinemadadok"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-default-400 mt-1">Cinemadadok Management Panel</p>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
