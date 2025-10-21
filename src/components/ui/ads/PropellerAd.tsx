"use client";

import { useEffect, useState } from "react";

export interface PropellerAdProps {
  /**
   * PropellerAds zone ID
   */
  zoneId: string;
  
  /**
   * Ad type: 'banner', 'native', 'interstitial', 'onclick', 'push'
   */
  type?: "banner" | "native" | "interstitial" | "onclick" | "push";
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Container style
   */
  style?: React.CSSProperties;
  
  /**
   * Mobile device detection
   */
  isMobile?: boolean;
}

/**
 * Mobile-Safe PropellerAds Component
 * 
 * Usage:
 * <PropellerAd zoneId="XXXXXXX" type="banner" />
 * 
 * Setup:
 * 1. Daftar di https://propellerads.com
 * 2. Tambahkan website Anda
 * 3. Buat ad zone (Banner, Native, Interstitial, etc)
 * 4. Copy zone ID
 * 5. Paste di environment variables
 * 
 * Ad Types:
 * - banner: Standard banner ads (top, sidebar, bottom)
 * - native: Native ads yang blend dengan content
 * - interstitial: Full-page ads saat navigasi
 * - onclick: PopUnder ads (1 click = 1 popup)
 * - push: Push notification subscriptions
 */
const PropellerAd: React.FC<PropellerAdProps> = ({
  zoneId,
  type = "banner",
  className = "",
  style = {},
  isMobile = false,
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Skip certain ad types on mobile to prevent issues
    if (isMobile && (type === "interstitial" || type === "onclick")) {
      console.warn(`[PropellerAd] Skipping ${type} ad on mobile device`);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    
    try {
      // Banner dan Native ads menggunakan iframe
      if (type === "banner" || type === "native") {
        const containerId = `propeller-ad-${zoneId}-${Date.now()}`;
        
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.innerHTML = `
          try {
            atOptions = {
              'key' : '${zoneId}',
              'format' : 'iframe',
              'height' : ${type === "banner" ? (isMobile ? 50 : 90) : (isMobile ? 200 : 250)},
              'width' : ${type === "banner" ? (isMobile ? 320 : 728) : (isMobile ? 280 : 300)},
              'params' : {}
            };
          } catch(e) {
            console.error('[PropellerAd] Configuration error:', e);
          }
        `;
        
        const adScript = document.createElement("script");
        adScript.type = "text/javascript";
        adScript.src = `//www.highperformanceformat.com/${zoneId}/invoke.js`;
        adScript.async = true;
        
        adScript.onload = () => {
          setAdLoaded(true);
          console.log('[PropellerAd] Ad loaded successfully');
        };
        
        adScript.onerror = (error) => {
          console.error('[PropellerAd] Script load error:', error);
          setHasError(true);
        };

        // Set timeout to detect loading issues
        timeoutId = setTimeout(() => {
          if (!adLoaded) {
            console.warn('[PropellerAd] Ad loading timeout');
            setHasError(true);
          }
        }, 10000);

        document.body.appendChild(script);
        document.body.appendChild(adScript);

        return () => {
          clearTimeout(timeoutId);
          try {
            if (document.body.contains(script)) document.body.removeChild(script);
            if (document.body.contains(adScript)) document.body.removeChild(adScript);
          } catch (e) {
            console.warn('[PropellerAd] Cleanup error:', e);
          }
        };
      }

      // OnClick PopUnder
      if (type === "onclick") {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.innerHTML = `
          var uid = '${zoneId}';
          var wid = '${zoneId}';
          var pop_tag = document.createElement('script');
          pop_tag.src='//cdn.onclickads.net/'+wid+'.js';
          document.body.appendChild(pop_tag);
        `;
        document.body.appendChild(script);

        return () => {
          try {
            if (document.body.contains(script)) document.body.removeChild(script);
          } catch (e) {
            // Silent cleanup error
          }
        };
      }

      // Interstitial
      if (type === "interstitial") {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `//thubanoa.com/1?z=${zoneId}`;
        document.body.appendChild(script);

        return () => {
          try {
            if (document.body.contains(script)) document.body.removeChild(script);
          } catch (e) {
            // Silent cleanup error
          }
        };
      }

      // Push Notification
      if (type === "push") {
        // @ts-ignore
        if (typeof window !== "undefined" && !window.propellerPushLoaded) {
          // @ts-ignore
          window.propellerPushLoaded = true;
          const script = document.createElement("script");
          script.src = "//cdn.p-n.io/pushly-sdk.min.js?ver=2.0.0";
          script.setAttribute("data-pushly-app-id", zoneId);
          document.body.appendChild(script);
        }
      }
    } catch (error) {
      // Silent error handling to prevent crashes
      console.warn('PropellerAd setup error:', error);
    }
  }, [zoneId, type]);

  // Banner dan Native perlu container div
  if (type === "banner" || type === "native") {
    return (
      <div className={`propeller-ad-container ${className}`} style={style}>
        <div id={`propeller-ad-${zoneId}`} />
      </div>
    );
  }

  // OnClick, Interstitial, Push tidak perlu visible container
  return null;
};

export default PropellerAd;
