"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/helpers";
import { Button, Tooltip } from "@heroui/react";
import { BarChart, Home, ListVideo, Users, TrendUp } from "@/utils/icons";
import { 
  HiArrowRightOnRectangle, 
  HiMegaphone, 
  HiShieldCheck,
  HiBookmark
} from "react-icons/hi2";
import Image from "next/image";

const ADMIN_NAV_ITEMS = [
  { 
    label: "Dashboard", 
    href: "/admin/dashboard", 
    icon: <BarChart className="text-lg" />,
    description: "Overview & statistik"
  },
  { 
    label: "Analytics", 
    href: "/admin/analytics", 
    icon: <TrendUp className="text-lg" />,
    description: "Analisis trafik"
  },
  { 
    label: "Admin Users", 
    href: "/admin/manage-users", 
    icon: <HiShieldCheck className="text-lg" />,
    description: "Kelola admin"
  },
  { 
    label: "Site Users", 
    href: "/admin/users", 
    icon: <Users className="text-lg" />,
    description: "Daftar pengguna"
  },
  { 
    label: "Watch History", 
    href: "/admin/history", 
    icon: <ListVideo className="text-lg" />,
    description: "Riwayat tontonan"
  },
  { 
    label: "Watchlist", 
    href: "/admin/watchlist", 
    icon: <HiBookmark className="text-lg" />,
    description: "Daftar simpan"
  },
  { 
    label: "Ads Manager", 
    href: "/admin", 
    icon: <HiMegaphone className="text-lg" />,
    description: "Kelola iklan"
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="hidden w-64 flex-col md:flex relative bg-slate-900/95 border-r border-slate-700/50 select-text">
      {/* Logo Section */}
      <div className="flex items-center gap-3 p-5 border-b border-slate-700/50">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/40 shadow-lg">
          <Image
            src="/dado.png"
            alt="DADO CINEMA"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-white truncate">DADO CINEMA</h1>
          <p className="text-[10px] text-slate-400 font-medium">Admin Panel</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Menu Utama
        </p>
        
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Tooltip
              key={item.href}
              content={item.description}
              placement="right"
              delay={500}
              classNames={{
                content: "bg-slate-800 text-white text-xs px-3 py-1.5"
              }}
            >
              <Link href={item.href}>
                <div
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                    isActive 
                      ? "bg-primary text-white shadow-md shadow-primary/30" 
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                    isActive 
                      ? "bg-white/20" 
                      : "bg-slate-800 group-hover:bg-slate-700"
                  )}>
                    {item.icon}
                  </div>
                  
                  {/* Label */}
                  <span className="text-sm font-medium flex-1">
                    {item.label}
                  </span>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </Link>
            </Tooltip>
          );
        })}
        
        {/* Divider */}
        <div className="my-3 border-t border-slate-700/50" />
        
        <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Lainnya
        </p>
        
        {/* Back to Site */}
        <Link href="/">
          <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-400 hover:bg-slate-800/80 hover:text-white transition-all duration-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-slate-700">
              <Home className="text-lg" />
            </div>
            <span className="text-sm font-medium">Back to Site</span>
          </div>
        </Link>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 space-y-3">
        <LogoutButton />
        
        {/* Status */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-400">
            System Online
          </span>
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
      className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium"
      startContent={<HiArrowRightOnRectangle className="text-lg" />}
      onPress={handleLogout}
      size="sm"
    >
      Logout
    </Button>
  );
}
