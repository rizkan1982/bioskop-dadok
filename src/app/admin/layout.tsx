import AdminSidebar from "@/components/sections/Admin/Sidebar";
import MobileAdminNav from "@/components/sections/Admin/MobileNav";
import { redirect } from "next/navigation";
import Image from "next/image";
import { cookies } from "next/headers";

// ============================================
// WHITELIST EMAIL ADMIN
// Hanya email ini yang bisa akses admin panel
// ============================================
const ADMIN_EMAILS = [
  "stressgue934@gmail.com",
];

interface AdminSession {
  username: string;
  role: string;
  email: string;
  exp: number;
}

async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) return null;

    const session: AdminSession = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString()
    );

    // Check if session expired
    if (Date.now() > session.exp) {
      return null;
    }

    // Verify email is still in admin whitelist
    if (!ADMIN_EMAILS.includes(session.email)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  // If no valid admin session, redirect to admin login
  if (!session) {
    // Clear any invalid session cookie
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    redirect("/auth/admin");
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-950 select-text">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-primary/30">
                <Image
                  src="/dado.png"
                  alt="DADO CINEMA"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">Admin Panel</h1>
                <p className="text-[10px] text-slate-400">{session.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:block p-4 lg:p-5 border-b border-slate-800/50 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden ring-2 ring-primary/40 shadow-lg shadow-primary/10">
                <Image
                  src="/dado.png"
                  alt="DADO CINEMA"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  DADO CINEMA Admin
                </h1>
                <p className="text-xs text-slate-400">Management Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500">Logged in as</p>
                <p className="text-sm font-medium text-white">{session.username}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
                {session.username?.charAt(0).toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 md:pb-6 bg-slate-950">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileAdminNav />
      </main>
    </div>
  );
}
