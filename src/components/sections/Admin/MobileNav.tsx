"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/helpers";
import { BarChart, Home, ListVideo, Users, TrendUp } from "@/utils/icons";
import { HiArrowRightOnRectangle, HiMegaphone, HiBars3 } from "react-icons/hi2";
import { useState } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, Divider } from "@heroui/react";

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <BarChart className="text-xl" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <TrendUp className="text-xl" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="text-xl" /> },
  { label: "History", href: "/admin/history", icon: <ListVideo className="text-xl" /> },
  { label: "Ads", href: "/admin", icon: <HiMegaphone className="text-xl" /> },
];

const ALL_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <BarChart className="text-xl" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <TrendUp className="text-xl" /> },
  { label: "Admin Users", href: "/admin/manage-users", icon: <Users className="text-xl" /> },
  { label: "Site Users", href: "/admin/users", icon: <Users className="text-xl" /> },
  { label: "Watch History", href: "/admin/history", icon: <ListVideo className="text-xl" /> },
  { label: "Watchlist", href: "/admin/watchlist", icon: <ListVideo className="text-xl" /> },
  { label: "Ads Manager", href: "/admin", icon: <HiMegaphone className="text-xl" /> },
  { label: "Back to Site", href: "/", icon: <Home className="text-xl" /> },
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-default-400 hover:text-white"
                )}
              >
                <div className={cn(
                  "transition-transform",
                  isActive && "scale-110"
                )}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMenu(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-default-400 hover:text-white transition-all min-w-[60px]"
          >
            <HiBars3 className="text-xl" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* Full Menu Modal */}
      <Modal
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        placement="bottom"
        size="full"
        classNames={{
          wrapper: "items-end",
          base: "rounded-t-3xl rounded-b-none max-h-[80vh] m-0",
          body: "p-0",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 pb-2">
            <span className="text-lg font-bold">Menu Admin</span>
            <span className="text-xs text-default-400 font-normal">Semua fitur admin panel</span>
          </ModalHeader>
          <Divider />
          <ModalBody className="py-4">
            <div className="grid grid-cols-3 gap-3 px-4">
              {ALL_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                      isActive
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-white/5 border-white/10 text-default-400 hover:bg-white/10"
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium text-center">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <Divider className="my-4" />

            {/* Logout Button */}
            <div className="px-4 pb-4">
              <Button
                color="danger"
                variant="flat"
                className="w-full"
                startContent={<HiArrowRightOnRectangle className="text-xl" />}
                onPress={handleLogout}
                size="lg"
              >
                Logout
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
