"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/helpers";
import BrandLogo from "@/components/ui/other/BrandLogo";
import { Button } from "@heroui/react";
import { BarChart, Home, ListVideo, Users } from "@/utils/icons";

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: <BarChart className="text-xl" />, color: "primary" },
  { label: "Users", href: "/admin/users", icon: <Users className="text-xl" />, color: "secondary" },
  { label: "Watch History", href: "/admin/history", icon: <ListVideo className="text-xl" />, color: "success" },
  { label: "Watchlist", href: "/admin/watchlist", icon: <ListVideo className="text-xl" />, color: "warning" },
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
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <div>
            <p className="text-xs font-medium text-white">Admin Panel</p>
            <p className="text-xs text-default-500">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
