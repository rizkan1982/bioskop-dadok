"use client";

import { useEffect } from "react";

export interface AdsterraAdProps {
  /**
   * Adsterra ad key
   */
  adKey: string;
  
  /**
   * Ad type: 'banner', 'native', 'social-bar', 'popunder', 'direct-link'
   */
  type?: "banner" | "native" | "social-bar" | "popunder" | "direct-link";
  
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
 * Adsterra Ad Component
 * 
 * Usage:
 * <AdsterraAd adKey="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" type="banner" />
 * 
 * Setup:
 * 1. Daftar di https://publishers.adsterra.com
 * 2. Tambahkan website Anda
 * 3. Buat ad unit (Banner, Native, Social Bar, PopUnder, Direct Link)
 * 4. Copy ad key (32 character string)
 * 5. Paste di environment variables
 * 
 * Ad Types:
 * - banner: Standard banner ads (responsive)
 * - native: Native banner yang blend dengan design
 * - social-bar: Fixed bottom bar with social icons
 * - popunder: PopUnder ads (background popup)
 * - direct-link: Direct link ads (link-based monetization)
 */
const AdsterraAd: React.FC<AdsterraAdProps> = ({
  adKey,
  type = "banner",
  className = "",
  style = {},
}) => {
  useEffect(() => {
    // Banner ads
    if (type === "banner") {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.innerHTML = `
        atOptions = {
          'key' : '${adKey}',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      document.body.appendChild(script);

      const adScript = document.createElement("script");
      adScript.type = "text/javascript";
      adScript.src = `//www.topcreativeformat.com/${adKey}/invoke.js`;
      document.body.appendChild(adScript);

      return () => {
        if (document.body.contains(script)) document.body.removeChild(script);
        if (document.body.contains(adScript)) document.body.removeChild(adScript);
      };
    }

    // Native Banner
    if (type === "native") {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.innerHTML = `
        atOptions = {
          'key' : '${adKey}',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `;
      document.body.appendChild(script);

      const adScript = document.createElement("script");
      adScript.type = "text/javascript";
      adScript.src = `//www.topcreativeformat.com/${adKey}/invoke.js`;
      document.body.appendChild(adScript);

      return () => {
        if (document.body.contains(script)) document.body.removeChild(script);
        if (document.body.contains(adScript)) document.body.removeChild(adScript);
      };
    }

    // Social Bar (fixed bottom bar)
    if (type === "social-bar") {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.innerHTML = `
        atOptions = {
          'key' : '${adKey}',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;
      document.body.appendChild(script);

      const adScript = document.createElement("script");
      adScript.type = "text/javascript";
      adScript.src = `//www.topcreativeformat.com/${adKey}/invoke.js`;
      document.body.appendChild(adScript);

      return () => {
        if (document.body.contains(script)) document.body.removeChild(script);
        if (document.body.contains(adScript)) document.body.removeChild(adScript);
      };
    }

    // PopUnder ads
    if (type === "popunder") {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `//pl${Math.floor(Math.random() * 25) + 1}.profitabledisplaynetwork.com/d${adKey.substring(0, 8)}/invocations.js`;
      script.setAttribute("data-cfasync", "false");
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) document.body.removeChild(script);
      };
    }

    // Direct Link
    if (type === "direct-link") {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.innerHTML = `
        atOptions = {
          'key' : '${adKey}',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      document.body.appendChild(script);

      const adScript = document.createElement("script");
      adScript.type = "text/javascript";
      adScript.src = `//www.topcreativeformat.com/${adKey}/invoke.js`;
      document.body.appendChild(adScript);

      return () => {
        if (document.body.contains(script)) document.body.removeChild(script);
        if (document.body.contains(adScript)) document.body.removeChild(adScript);
      };
    }
  }, [adKey, type]);

  // Visible container untuk banner, native, social-bar, direct-link
  if (type !== "popunder") {
    return (
      <div className={`adsterra-ad-container ${className}`} style={style}>
        <div id={`adsterra-ad-${adKey}`} />
      </div>
    );
  }

  // PopUnder tidak perlu visible container
  return null;
};

export default AdsterraAd;
