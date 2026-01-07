"use client";

import { siteConfig } from "@/config/site";
import clsx from "clsx";
import { Link } from "@heroui/link";
import { usePathname } from "next/navigation";
import { Chip } from "@heroui/chip";

const BottomNavbar = () => {
  const pathName = usePathname();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);

  return (
    show && (
      <>
        {/* Spacer to prevent content from being hidden behind fixed navbar */}
        <div className="pt-24 md:hidden" />
        
        {/* Fixed Bottom Navigation - Mobile Only */}
        <nav 
          className="fixed bottom-0 left-0 z-50 block w-full border-t border-secondary-background/50 bg-background/95 backdrop-blur-lg pb-safe md:hidden"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="mx-auto grid h-full max-w-lg grid-cols-5 px-1">
            {siteConfig.navItems.map((item) => {
              const isActive = pathName === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className="flex items-center justify-center py-2 text-foreground transition-transform active:scale-95"
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Touch-friendly target area with min 44px height (iOS HIG) */}
                  <div className="flex min-h-[52px] min-w-[52px] flex-col items-center justify-center gap-1">
                    <Chip
                      size="lg"
                      variant={isActive ? "solid" : "light"}
                      classNames={{
                        base: clsx(
                          "py-1 px-3 transition-all duration-200",
                          isActive && "shadow-md"
                        ),
                        content: "size-full flex items-center justify-center",
                      }}
                    >
                      {isActive ? item.activeIcon : item.icon}
                    </Chip>
                    <span 
                      className={clsx(
                        "text-[11px] leading-tight transition-colors",
                        isActive ? "font-semibold text-primary" : "font-medium text-foreground/70"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </>
    )
  );
};

export default BottomNavbar;
