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

      // OnClick PopUnder - Desktop only
      if (type === "onclick" && !isMobile) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.innerHTML = `
          try {
            var uid = '${zoneId}';
            var wid = '${zoneId}';
            var pop_tag = document.createElement('script');
            pop_tag.src='//cdn.onclickads.net/'+wid+'.js';
            pop_tag.onerror = function() {
              console.error('[PropellerAd] OnClick script failed to load');
            };
            document.body.appendChild(pop_tag);
          } catch(e) {
            console.error('[PropellerAd] OnClick setup error:', e);
          }
        `;
        
        document.body.appendChild(script);

        return () => {
          try {
            if (document.body.contains(script)) document.body.removeChild(script);
          } catch (e) {
            console.warn('[PropellerAd] OnClick cleanup error:', e);
          }
        };
      }

      // Push Notification - Desktop only
      if (type === "push" && !isMobile) {
        // @ts-ignore
        if (typeof window !== "undefined" && !window.propellerPushLoaded) {
          // @ts-ignore
          window.propellerPushLoaded = true;
          const script = document.createElement("script");
          script.src = "//cdn.p-n.io/pushly-sdk.min.js?ver=2.0.0";
          script.setAttribute("data-pushly-app-id", zoneId);
          script.async = true;
          
          script.onerror = () => {
            console.error('[PropellerAd] Push script failed to load');
            setHasError(true);
          };
          
          document.body.appendChild(script);
        }
      }
    } catch (error) {
      console.error('[PropellerAd] Setup error:', error);
      setHasError(true);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [zoneId, type, isMobile, adLoaded]);

  // Don't render if error occurred
  if (hasError) {
    return null;
  }

  // Banner dan Native perlu container div
  if (type === "banner" || type === "native") {
    return (
      <div 
        className={`propeller-ad-container ${className}`} 
        style={{
          minHeight: type === "banner" ? (isMobile ? '50px' : '90px') : (isMobile ? '200px' : '250px'),
          width: '100%',
          textAlign: 'center',
          ...style
        }}
      >
        <div id={`propeller-ad-${zoneId}`} />
        {!adLoaded && (
          <div className="ad-loading-placeholder p-4 text-center text-sm text-gray-500">
            Loading ad...
          </div>
        )}
      </div>
    );
  }

  // OnClick, Push tidak perlu visible container
  return null;
};

export default PropellerAd;
