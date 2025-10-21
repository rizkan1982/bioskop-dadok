"use client";

import { useEffect, useState } from "react";

export interface PropellerAdProps {
  zoneId: string;
  type?: "banner" | "native" | "interstitial" | "onclick" | "push";
  className?: string;
  style?: React.CSSProperties;
  isMobile?: boolean;
}

/**
 * Mobile-Safe PropellerAds Component with Error Handling
 * Prevents error text from appearing on mobile devices
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
    if (!zoneId) {
      console.warn('[PropellerAd] No zone ID provided');
      return;
    }

    // Skip certain ad types on mobile
    if (isMobile && (type === "interstitial" || type === "onclick")) {
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let cleanupFns: (() => void)[] = [];
    
    try {
      // Banner and Native ads
      if (type === "banner" || type === "native") {
        // Create container first
        const containerId = `propeller-${zoneId}-${Date.now()}`;
        const container = document.createElement('div');
        container.id = containerId;
        container.style.minHeight = isMobile ? '50px' : '90px';
        container.style.textAlign = 'center';
        
        // Hide any error text that might appear
        container.style.overflow = 'hidden';
        
        const configScript = document.createElement("script");
        configScript.type = "text/javascript";
        configScript.textContent = `
          (function() {
            try {
              if (typeof atOptions === 'undefined') {
                window.atOptions = {
                  'key': '${zoneId}',
                  'format': 'iframe',
                  'height': ${type === "banner" ? (isMobile ? 50 : 90) : (isMobile ? 200 : 250)},
                  'width': ${type === "banner" ? (isMobile ? 320 : 728) : (isMobile ? 280 : 300)},
                  'params': {}
                };
              }
            } catch(e) {
              console.warn('PropellerAd config error:', e);
            }
          })();
        `;
        
        const adScript = document.createElement("script");
        adScript.type = "text/javascript";
        adScript.src = `//www.highperformanceformat.com/${zoneId}/invoke.js`;
        adScript.async = true;
        
        adScript.onload = () => {
          setAdLoaded(true);
        };
        
        adScript.onerror = () => {
          setHasError(true);
          // Hide the container on error
          if (container.parentNode) {
            container.style.display = 'none';
          }
        };

        // Timeout to detect issues
        timeoutId = setTimeout(() => {
          if (!adLoaded) {
            setHasError(true);
            if (container.parentNode) {
              container.style.display = 'none';
            }
          }
        }, 8000);

        // Append scripts
        try {
          document.body.appendChild(configScript);
          document.body.appendChild(adScript);
          
          cleanupFns.push(() => {
            try {
              if (configScript.parentNode) configScript.parentNode.removeChild(configScript);
              if (adScript.parentNode) adScript.parentNode.removeChild(adScript);
            } catch (e) {
              // Silent cleanup
            }
          });
        } catch (e) {
          console.warn('[PropellerAd] Script append error:', e);
          setHasError(true);
        }
      }

      // OnClick PopUnder
      if (type === "onclick") {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.textContent = `
          (function() {
            try {
              var uid = '${zoneId}';
              var wid = '${zoneId}';
              var pop_tag = document.createElement('script');
              pop_tag.src='//cdn.onclickads.net/'+wid+'.js';
              document.body.appendChild(pop_tag);
            } catch(e) {
              console.warn('OnClick ad error:', e);
            }
          })();
        `;
        
        try {
          document.body.appendChild(script);
          cleanupFns.push(() => {
            try {
              if (script.parentNode) script.parentNode.removeChild(script);
            } catch (e) {}
          });
        } catch (e) {
          console.warn('[PropellerAd] OnClick error:', e);
        }
      }

      // Interstitial
      if (type === "interstitial") {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `//thubanoa.com/1?z=${zoneId}`;
        script.onerror = () => setHasError(true);
        
        try {
          document.body.appendChild(script);
          cleanupFns.push(() => {
            try {
              if (script.parentNode) script.parentNode.removeChild(script);
            } catch (e) {}
          });
        } catch (e) {
          console.warn('[PropellerAd] Interstitial error:', e);
        }
      }

      // Push Notification
      if (type === "push") {
        const w = window as any;
        if (!w.propellerPushLoaded) {
          w.propellerPushLoaded = true;
          const script = document.createElement("script");
          script.src = "//cdn.p-n.io/pushly-sdk.min.js?ver=2.0.0";
          script.setAttribute("data-pushly-app-id", zoneId);
          script.onerror = () => setHasError(true);
          
          try {
            document.body.appendChild(script);
          } catch (e) {
            console.warn('[PropellerAd] Push error:', e);
          }
        }
      }
    } catch (error) {
      console.warn('[PropellerAd] Setup error:', error);
      setHasError(true);
    }

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      cleanupFns.forEach(fn => {
        try {
          fn();
        } catch (e) {
          // Silent cleanup
        }
      });
    };
  }, [zoneId, type, isMobile]);

  // Don't render anything if error or ad hasn't loaded yet on mobile
  if (hasError) {
    return null;
  }

  // Banner and Native need visible container
  if (type === "banner" || type === "native") {
    return (
      <div 
        className={`propeller-ad-container ${className}`} 
        style={{
          ...style,
          minHeight: isMobile ? '50px' : '90px',
          overflow: 'hidden', // Hide error text
          position: 'relative'
        }}
      >
        {!adLoaded && (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#666',
            fontSize: '12px'
          }}>
            {/* Loading placeholder - will be hidden if ad loads */}
          </div>
        )}
      </div>
    );
  }

  // OnClick, Interstitial, Push don't need visible container
  return null;
};

export default PropellerAd;
