"use client";

import { useEffect } from "react";

export interface PopCashAdProps {
  /**
   * PopCash Site ID (from PopCash dashboard)
   */
  siteId: string;
  
  /**
   * Enable debug mode (shows console logs)
   */
  debug?: boolean;
}

/**
 * PopCash PopUnder Ad Component
 * 
 * PopCash adalah platform iklan Indonesia-friendly dengan:
 * - Instant approval (5 menit)
 * - Payment ke bank Indonesia via Paxum/Bitcoin
 * - Minimum payout $10
 * - High CPM ($0.50-$2 untuk traffic Indonesia)
 * 
 * Usage:
 * <PopCashAd siteId="1234567" />
 * 
 * Setup:
 * 1. Daftar di https://www.popcash.net/
 * 2. Add website: bioskop-dadok.vercel.app
 * 3. Get Site ID dari dashboard
 * 4. Set environment variable: NEXT_PUBLIC_POPCASH_SITE_ID
 * 5. Component otomatis load
 * 
 * Payment Methods:
 * - Paxum → Bank Indonesia (BCA, Mandiri, BRI, dll) - Fee: $3
 * - Bitcoin → Indodax/Tokocrypto → Bank - Fee: ~0.5%
 * - PayPal (jika punya)
 * 
 * Expected Revenue (Indonesia traffic):
 * - 100 visitors/day: $0.10-0.20/day ($3-6/bulan)
 * - 500 visitors/day: $0.50-1/day ($15-30/bulan)
 * - 1,000 visitors/day: $1-2/day ($30-60/bulan)
 * - 5,000 visitors/day: $5-10/day ($150-300/bulan)
 * 
 * Policy:
 * - ❌ Never click your own popups
 * - ❌ Never ask friends/family to click
 * - ✅ Max 1 popup per 24 hours per user
 * - ✅ Natural user behavior
 * - ✅ Quality organic traffic
 */
const PopCashAd: React.FC<PopCashAdProps> = ({
  siteId,
  debug = false,
}) => {
  useEffect(() => {
    // Only load in browser environment
    if (typeof window === "undefined") {
      return;
    }

    // Check if PopCash already loaded
    // @ts-ignore
    if (window.popCashLoaded) {
      if (debug) {
        console.log("[PopCash] Already loaded, skipping...");
      }
      return;
    }

    if (debug) {
      console.log("[PopCash] Loading PopUnder script...");
      console.log("[PopCash] Site ID:", siteId);
    }

    try {
      // Create script element
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      
      // PopCash PopUnder script
      // This loads a background popup (1 per 24 hours per user)
      script.src = `//cdn.popcash.net/show.js`;
      
      // Set global config
      // @ts-ignore
      window.pop_config = {
        site_id: parseInt(siteId),
        // Optional: customize behavior
        frequency: 1, // 1 popup per 24 hours (user-friendly)
      };

      // Mark as loaded
      // @ts-ignore
      window.popCashLoaded = true;

      // Append to body
      document.body.appendChild(script);

      if (debug) {
        console.log("[PopCash] Script loaded successfully!");
      }

      // Cleanup function
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
          // @ts-ignore
          window.popCashLoaded = false;
          
          if (debug) {
            console.log("[PopCash] Script cleaned up");
          }
        }
      };
    } catch (error) {
      console.error("[PopCash] Error loading script:", error);
    }
  }, [siteId, debug]);

  // PopUnder ads don't need visible container
  // They work in background
  return null;
};

export default PopCashAd;
