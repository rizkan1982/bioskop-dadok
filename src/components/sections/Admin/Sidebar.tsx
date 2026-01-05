"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/helpers";
import BrandLogo from "@/components/ui/other/BrandLogo";
import { Button } from "@heroui/react";
import { BarChart, Home, ListVideo, Users, TrendUp } from "@/utils/icons";
import { HiArrowRightOnRectangle } from "react-icons/hi2";

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <BarChart className="text-xl" />, color: "primary" },
  { label: "Analytics", href: "/admin/analytics", icon: <TrendUp className="text-xl" />, color: "secondary" },
  { label: "Admin Users", href: "/admin/manage-users", icon: <Users className="text-xl" />, color: "success" },
  { label: "Site Users", href: "/admin/users", icon: <Users className="text-xl" />, color: "warning" },
  { label: "Watch History", href: "/admin/history", icon: <ListVideo className="text-xl" />, color: "primary" },
  { label: "Watchlist", href: "/admin/watchlist", icon: <ListVideo className="text-xl" />, color: "secondary" },
  { label: "Ads Manager", href: "/admin", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>, color: "danger" },
  { label: "Back to Site", href: "/", icon: <Home className="text-xl" />, color: "default" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="hidden w-72 flex-col md:flex relative backdrop-blur-xl bg-black/40 border-r border-white/10">
      {/* Logo Section */}
      <div className="flex items-center justify-center p-8 border-b border-white/10">
        <BrandLogo />
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-300",
                  "hover:bg-white/5 hover:scale-[1.02]",
                  isActive 
                    ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-l-4 border-primary shadow-lg shadow-primary/20" 
                    : "hover:border-l-4 hover:border-white/20"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg transition-all",
                  isActive 
                    ? "bg-primary/20 text-primary ring-2 ring-primary/30" 
                    : "bg-white/5 text-default-400 group-hover:bg-white/10"
                )}>
                  {item.icon}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  isActive ? "text-white" : "text-default-400 group-hover:text-white"
                )}>
                  {item.label}
                </span>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-6 border-t border-white/10 space-y-4">
        <LogoutButton />
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <div>
            <p className="text-xs font-medium text-white">DADO CINEMA</p>
            <p className="text-xs text-default-500">Admin Panel v2.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function LogoutButton() {
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/auth/admin");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Button
      color="danger"
      variant="flat"
      className="w-full"
      startContent={<HiArrowRightOnRectangle className="text-xl" />}
      onPress={handleLogout}
    >
      Logout
    </Button>
  );
}
