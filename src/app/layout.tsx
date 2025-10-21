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
        
        {/* Unregister old PWA service workers to fix routing issue */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    console.log('[PWA Cleanup] Unregistering old service worker:', registration.scope);
                    registration.unregister();
                  }
                });
                // Clear all caches
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (let name of names) {
                      console.log('[PWA Cleanup] Deleting cache:', name);
                      caches.delete(name);
                    }
                  });
                }
              }
              
              // Simple iframe monitoring (non-blocking)
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  // Monitor for problematic iframes without blocking
                  const checkIframes = function() {
                    const iframes = document.querySelectorAll('iframe');
                    iframes.forEach(function(iframe) {
                      const src = iframe.src || '';
                      if (src.includes('go_banner') || src.includes('формируется')) {
                        console.warn('[Ad Monitor] Detected problematic iframe:', src);
                        iframe.style.display = 'none';
                      }
                    });
                  };
                  
                  // Check periodically but don't block loading
                  setTimeout(checkIframes, 3000);
                  setTimeout(checkIframes, 10000);
                });
              }
            `,
          }}
        />
      </head>
      <body className={cn("bg-background min-h-dvh antialiased select-none", Poppins.className)}>
        <Suspense fallback={<div className="text-white text-2xl p-8 absolute-center">Loading app...</div>}>
          <NuqsAdapter>
            <Providers>
              {IS_PRODUCTION && <Disclaimer />}
              <TopNavbar />
              <Sidebar>
                <main className={cn("container mx-auto max-w-full", SpacingClasses.main)}>
                  {children}
                </main>
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