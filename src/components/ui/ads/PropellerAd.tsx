"use client";

import { useEffect } from "react";

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
}

/**
 * PropellerAds Component
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
}) => {
  useEffect(() => {
    try {
      // Banner dan Native ads menggunakan iframe
      if (type === "banner" || type === "native") {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.innerHTML = `
          atOptions = {
            'key' : '${zoneId}',
            'format' : 'iframe',
            'height' : ${type === "banner" ? 90 : 250},
            'width' : ${type === "banner" ? 728 : 300},
            'params' : {}
          };
        `;
        document.body.appendChild(script);

        const adScript = document.createElement("script");
        adScript.type = "text/javascript";
        adScript.src = `//www.highperformanceformat.com/${zoneId}/invoke.js`;
        document.body.appendChild(adScript);

        return () => {
          try {
            if (document.body.contains(script)) document.body.removeChild(script);
            if (document.body.contains(adScript)) document.body.removeChild(adScript);
          } catch (e) {
            // Silent cleanup error
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