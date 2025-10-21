import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Poppins } from "@/utils/fonts";
import "../styles/globals.css";
import "../styles/lightbox.css";
import Providers from "./providers";
import TopNavbar from "@/components/ui/layout/TopNavbar";
import BottomNavbar from "@/components/ui/layout/BottomNavbar";
import Sidebar from "@/components/ui/layout/Sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "@/utils/helpers";
import { IS_PRODUCTION, SpacingClasses } from "@/utils/constants";
import dynamic from "next/dynamic";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
const Disclaimer = dynamic(() => import("@/components/ui/overlay/Disclaimer"));
const PopCashAd = dynamic(() => import("@/components/ui/ads/PopCashAd"));
const CustomAdBanner = dynamic(() => import("@/components/ui/ads/CustomAdBanner"));

export const metadata: Metadata = {
  title: siteConfig.name,
  applicationName: siteConfig.name,
  description: siteConfig.description,
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: siteConfig.favicon,
        type: "image/png",
        sizes: "512x512",
      },
      {
        url: siteConfig.favicon,
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: siteConfig.favicon,
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: siteConfig.favicon,
        type: "image/png",
        sizes: "16x16",
      },
    ],
    shortcut: [
      {
        url: siteConfig.favicon,
        type: "image/png",
      },
    ],
    apple: [
      {
        url: siteConfig.favicon,
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: {
      default: siteConfig.name,
      template: siteConfig.name,
    },
    description: siteConfig.description,
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: {
      default: siteConfig.name,
      template: siteConfig.name,
    },
    description: siteConfig.description,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0C0F" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        {/* PopCash Site Verification */}
        <meta name="ppck-ver" content="20e8554e142282e76e4c2621f556d78c" />
      </head>
      <body className={cn("bg-background min-h-dvh antialiased select-none", Poppins.className)}>
        <Suspense fallback={<div className="text-white text-2xl p-8 absolute-center">Loading app...</div>}>
          <NuqsAdapter>
            <Providers>
              {IS_PRODUCTION && <Disclaimer />}
              <TopNavbar />
              <Sidebar>
                <div className="flex w-full">
                  <main className={cn("container mx-auto max-w-full flex-1", SpacingClasses.main)}>
                    {children}
                  </main>
                  {/* Sidebar Banner Ads - Hidden on mobile, visible on large screens */}
                  <aside className="hidden xl:block w-72 flex-shrink-0 sticky top-20 h-fit p-4">
                    <CustomAdBanner position="sidebar" />
                  </aside>
                </div>
              </Sidebar>
              <BottomNavbar />
            </Providers>
          </NuqsAdapter>
        </Suspense>
        {/* PopCash PopUnder Ads (Indonesia-friendly, payment via Paxum/Bitcoin to Bank Indo) */}
        {process.env.NEXT_PUBLIC_POPCASH_SITE_ID && (
          <PopCashAd siteId={process.env.NEXT_PUBLIC_POPCASH_SITE_ID} />
        )}
        <SpeedInsights debug={false} />
        <Analytics debug={false} />
      </body>
    </html>
  );
}
