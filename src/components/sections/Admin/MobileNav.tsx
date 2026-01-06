"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/helpers";
import { BarChart, Home, ListVideo, Users, TrendUp } from "@/utils/icons";
import { 
  HiArrowRightOnRectangle, 
  HiMegaphone, 
  HiBars3, 
  HiShieldCheck,
  HiBookmark,
  HiXMark
} from "react-icons/hi2";
import { useState } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import Image from "next/image";

const QUICK_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <BarChart className="text-lg" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <TrendUp className="text-lg" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="text-lg" /> },
  { label: "Ads", href: "/admin", icon: <HiMegaphone className="text-lg" /> },
];

const ALL_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <BarChart className="text-xl" />, color: "bg-blue-500/20 text-blue-400" },
  { label: "Analytics", href: "/admin/analytics", icon: <TrendUp className="text-xl" />, color: "bg-purple-500/20 text-purple-400" },
  { label: "Admin Users", href: "/admin/manage-users", icon: <HiShieldCheck className="text-xl" />, color: "bg-amber-500/20 text-amber-400" },
  { label: "Site Users", href: "/admin/users", icon: <Users className="text-xl" />, color: "bg-green-500/20 text-green-400" },
  { label: "History", href: "/admin/history", icon: <ListVideo className="text-xl" />, color: "bg-pink-500/20 text-pink-400" },
  { label: "Watchlist", href: "/admin/watchlist", icon: <HiBookmark className="text-xl" />, color: "bg-cyan-500/20 text-cyan-400" },
  { label: "Ads Manager", href: "/admin", icon: <HiMegaphone className="text-xl" />, color: "bg-red-500/20 text-red-400" },
  { label: "Back to Site", href: "/", icon: <Home className="text-xl" />, color: "bg-slate-500/20 text-slate-400" },
];

export default function MobileAdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

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
    <>
      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 z-50 pb-safe select-text">
        <div className="flex items-center justify-around py-1.5 px-2">
          {QUICK_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all",
                  isActive
                    ? "text-primary"
                    : "text-slate-500"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isActive && "bg-primary/20"
                )}>
                  {item.icon}
                </div>
                <span className="text-[9px] font-semibold">{item.label}</span>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMenu(true)}
            className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-slate-500 transition-all"
          >
            <div className="p-1.5 rounded-lg">
              <HiBars3 className="text-lg" />
            </div>
            <span className="text-[9px] font-semibold">More</span>
          </button>
        </div>
      </nav>

      {/* Full Menu Modal */}
      <Modal
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        placement="bottom"
        size="full"
        hideCloseButton
        classNames={{
          wrapper: "items-end",
          base: "rounded-t-2xl rounded-b-none max-h-[85vh] m-0 bg-slate-900",
          body: "p-0",
        }}
      >
        <ModalContent className="select-text">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/40">
                <Image
                  src="/dado.png"
                  alt="DADO CINEMA"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Admin Menu</h2>
                <p className="text-xs text-slate-400">Semua fitur admin</p>
              </div>
            </div>
            <button
              onClick={() => setShowMenu(false)}
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <HiXMark className="text-xl" />
            </button>
          </div>

          <ModalBody className="p-4">
            {/* Menu Grid */}
            <div className="grid grid-cols-4 gap-2">
              {ALL_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                      isActive
                        ? "bg-primary/10 border-primary/30"
                        : "bg-slate-800/50 border-slate-700/50 active:bg-slate-700"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      item.color
                    )}>
                      {item.icon}
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold text-center leading-tight",
                      isActive ? "text-primary" : "text-slate-300"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <Button
                color="danger"
                variant="flat"
                className="w-full bg-red-500/10 text-red-400 font-medium"
                startContent={<HiArrowRightOnRectangle className="text-lg" />}
                onPress={handleLogout}
                size="lg"
              >
                Logout
              </Button>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-2 mt-4 py-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-400">
                DADO CINEMA Admin Panel
              </span>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
