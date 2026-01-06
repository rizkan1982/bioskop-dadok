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
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/30">
                <Image
                  src="/dado.png"
                  alt="DADO CINEMA"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-default-400">{session.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block p-4 lg:p-6">
          <div className="flex items-center gap-4 p-4 lg:p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 border border-white/5 backdrop-blur-sm">
            <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-xl overflow-hidden ring-2 ring-primary/50 shadow-lg shadow-primary/20">
              <Image
                src="/dado.png"
                alt="DADO CINEMA"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent truncate">
                DADO CINEMA Admin
              </h1>
              <p className="text-xs lg:text-sm text-default-400 truncate">Management Panel</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-default-500">Logged in as</p>
              <p className="text-sm font-medium text-primary truncate max-w-[150px]">{session.username}</p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6 pb-24 md:pb-6">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileAdminNav />
      </main>
    </div>
  );
}
