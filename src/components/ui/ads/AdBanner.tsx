"use client";

import { Card } from "@heroui/react";
import { IS_PRODUCTION } from "@/utils/constants";
import AdSenseAd from "./AdSenseAd";
import PropellerAd from "./PropellerAd";
import AdsterraAd from "./AdsterraAd";
import { useEffect, useState } from "react";

export interface AdBannerProps {
  /**
   * Ad provider: 'adsense', 'propeller', 'adsterra'
   */
  provider?: "adsense" | "propeller" | "adsterra" | "auto";
  
  /**
   * Ad placement: 'top', 'bottom', 'sidebar', 'content'
   */
  placement?: "top" | "bottom" | "sidebar" | "content";
  
  /**
   * Adsterra ad variant: 'native' or 'banner'
   * Only used when provider='adsterra'
   */
  variant?: "native" | "banner";
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Universal Ad Banner Component with Mobile-Safe Loading
 */
const AdBanner: React.FC<AdBannerProps> = ({
  provider = "auto",
  placement = "content",
  variant = "native",
  className = "",
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Detect mobile device
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    // Add error listener for iframe issues
    const handleError = (event: ErrorEvent) => {
      if (event.message && (
        event.message.includes('go_banner') ||
        event.message.includes('iframe') ||
        event.message.match(/[а-яё]/i) // Cyrillic characters
      )) {
        console.warn('[AdBanner] Error detected, hiding ad:', event.message);
        setHasError(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Hide ad if error detected
  if (hasError) {
    return null;
  }

  // Show placeholder in development
  if (!IS_PRODUCTION) {
    return (
      <Card className={`my-4 p-4 text-center ${className}`}>
        <p className="text-sm text-default-500">
          [Ad Placeholder - {provider} - {variant} - {placement}]
        </p>
        <p className="text-xs text-default-400 mt-1">
          Ads will appear in production mode
        </p>
      </Card>
    );
  }

  // Auto-select provider berdasarkan environment variables
  if (provider === "auto") {
    if (process.env.NEXT_PUBLIC_ADSENSE_CLIENT) {
      provider = "adsense";
    } else if (process.env.NEXT_PUBLIC_PROPELLER_ZONE_ID) {
      provider = "propeller";
    } else if (process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_KEY || process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY) {
      provider = "adsterra";
    }
  }

  // Google AdSense - Mobile Safe
  if (provider === "adsense") {
    const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
    const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT || "";
    
    if (!client || !slot) {
      console.warn("AdSense credentials not found in environment variables");
      return null;
    }

    return (
      <div className={`ad-banner-container my-4 ${className}`} style={{ minHeight: isMobile ? '50px' : '90px' }}>
        <AdSenseAd
          client={client}
          slot={slot}
          format="auto"
          responsive={true}
        />
      </div>
    );
  }

  // PropellerAds - Mobile Optimized
  if (provider === "propeller") {
    const zoneId = process.env.NEXT_PUBLIC_PROPELLER_ZONE_ID || "";
    
    if (!zoneId) {
      console.warn("PropellerAds zone ID not found in environment variables");
      return null;
    }

    return (
      <div className={`ad-banner-container my-4 ${className}`}>
        <PropellerAd zoneId={zoneId} type="banner" isMobile={isMobile} />
      </div>
    );
  }

  // Adsterra with Mobile Safety
  if (provider === "adsterra") {
    const nativeKey = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_KEY || "";
    const bannerKey = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY || "";
    
    let adKey = "";
    let adType: "banner" | "native" = "native";
    
    if (variant === "native" && nativeKey) {
      adKey = nativeKey;
      adType = "native";
    } else if (variant === "banner" && bannerKey) {
      adKey = bannerKey;
      adType = "banner";
    } else if (nativeKey) {
      adKey = nativeKey;
      adType = "native";
    } else if (bannerKey) {
      adKey = bannerKey;
      adType = "banner";
    }
    
    if (!adKey) {
      console.warn("Adsterra ad keys not found in environment variables");
      return null;
    }

    return (
      <div className={`ad-banner-container my-4 ${className}`}>
        <AdsterraAd adKey={adKey} type={adType} isMobile={isMobile} />
      </div>
    );
  }

  return null;
};

export default AdBanner;
