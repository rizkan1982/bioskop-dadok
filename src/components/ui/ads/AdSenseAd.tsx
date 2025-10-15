"use client";

import { useEffect } from "react";

export interface AdSenseAdProps {
  /**
   * Google AdSense client ID (ca-pub-XXXXXXXXXXXXXXXX)
   */
  client: string;
  
  /**
   * Ad slot ID (XXXXXXXXXX)
   */
  slot: string;
  
  /**
   * Ad format: 'auto', 'rectangle', 'vertical', 'horizontal'
   */
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  
  /**
   * Enable responsive ads (default: true)
   */
  responsive?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Ad style (width x height)
   */
  style?: React.CSSProperties;
}

/**
 * Google AdSense Ad Component
 * 
 * Usage:
 * <AdSenseAd 
 *   client="ca-pub-XXXXXXXXXXXXXXXX"
 *   slot="XXXXXXXXXX"
 *   format="auto"
 *   responsive={true}
 * />
 * 
 * Setup:
 * 1. Daftar di https://www.google.com/adsense
 * 2. Tambahkan site URL Anda
 * 3. Tunggu approval (1-2 minggu)
 * 4. Copy client ID dan slot ID
 * 5. Paste di environment variables
 */
const AdSenseAd: React.FC<AdSenseAdProps> = ({
  client,
  slot,
  format = "auto",
  responsive = true,
  className = "",
  style = {},
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      if (typeof window !== "undefined" && window.adsbygoogle) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          ...style,
        }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdSenseAd;
