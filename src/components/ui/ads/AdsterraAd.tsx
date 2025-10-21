"use client";

import { useEffect, useState } from "react";

export interface AdsterraAdProps {
  /**
   * Adsterra ad key
   */
  adKey: string;
  
  /**
   * Ad type: 'banner' or 'native'
   */
  type?: "banner" | "native";
  
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
 * Mobile-Safe Adsterra Ad Component
 */
const AdsterraAd: React.FC<AdsterraAdProps> = ({
  adKey,
  type = "native",
  className = "",
  style = {},
  isMobile = false,
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerId = `adsterra-ad-${adKey}-${Date.now()}`;

  useEffect(() => {
    if (!adKey) {
      setHasError(true);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    try {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;

      if (type === "native") {
        // Native ad configuration
        script.innerHTML = `
          try {
            atOptions = {
              'key' : '${adKey}',
              'format' : 'iframe',
              'height' : ${isMobile ? 200 : 250},
              'width' : ${isMobile ? 280 : 300},
              'params' : {}
            };
            document.write('<scr' + 'ipt type="text/javascript" src="//www.profitabledisplaynetwork.com/${adKey}/invoke.js"></scr' + 'ipt>');
          } catch(e) {
            console.error('[AdsterraAd] Native ad setup error:', e);
          }
        `;
      } else {
        // Banner ad configuration
        script.innerHTML = `
          try {
            atOptions = {
              'key' : '${adKey}',
              'format' : 'iframe',
              'height' : ${isMobile ? 50 : 90},
              'width' : ${isMobile ? 320 : 728},
              'params' : {}
            };
            document.write('<scr' + 'ipt type="text/javascript" src="//www.profitabledisplaynetwork.com/${adKey}/invoke.js"></scr' + 'ipt>');
          } catch(e) {
            console.error('[AdsterraAd] Banner ad setup error:', e);
          }
        `;
      }

      // Create container for the ad
      const container = document.getElementById(containerId);
      if (container) {
        container.appendChild(script);
      }

      // Set timeout to detect loading issues
      timeoutId = setTimeout(() => {
        if (!adLoaded) {
          console.warn('[AdsterraAd] Ad loading timeout');
          setHasError(true);
        }
      }, 10000);

      // Detect ad load success
      setTimeout(() => {
        const adElements = document.querySelectorAll(`#${containerId} iframe`);
        if (adElements.length > 0) {
          setAdLoaded(true);
        }
      }, 3000);

    } catch (error) {
      console.error('[AdsterraAd] Setup error:', error);
      setHasError(true);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [adKey, type, isMobile, containerId, adLoaded]);

  // Don't render if error occurred
  if (hasError) {
    return null;
  }

  return (
    <div 
      className={`adsterra-ad-container ${className}`}
      style={{
        minHeight: type === "banner" ? (isMobile ? '50px' : '90px') : (isMobile ? '200px' : '250px'),
        width: '100%',
        textAlign: 'center',
        ...style
      }}
    >
      <div id={containerId} />
      {!adLoaded && (
        <div className="ad-loading-placeholder p-4 text-center text-sm text-gray-500">
          Loading ad...
        </div>
      )}
    </div>
  );
};

export default AdsterraAd;
