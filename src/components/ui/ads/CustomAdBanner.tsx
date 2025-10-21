"use client";

import { useState, useEffect } from "react";
import { Card } from "@heroui/react";

interface CustomAdBannerProps {
  position: "top" | "middle" | "bottom" | "sidebar";
  className?: string;
}

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
}

export default function CustomAdBanner({ position, className = "" }: CustomAdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetchAds();
  }, [position]);

  const fetchAds = async () => {
    try {
      const res = await fetch(`/api/ads?active=true&position=${position}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setAds(data.data);
      }
    } catch (error) {
      console.error("Error fetching custom ads:", error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ads.length > 1 && position !== "top") {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads.length, position]);

  const handleClick = async (ad: Ad) => {
    try {
      // Track click
      await fetch(`/api/ads/${ad.id}`, { 
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error("Error tracking click:", error);
    }

    if (ad.link_url) {
      // Use window.open with security measures
      const newWindow = window.open(ad.link_url, "_blank", "noopener,noreferrer,width=800,height=600");
      if (newWindow) {
        newWindow.focus();
      }
    }
  };

  // Handle image load error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Failed to load ad image:", e.currentTarget.src);
    e.currentTarget.style.display = "none";
  };

  // Don't render until mounted (prevents hydration mismatch)
  if (!isMounted) {
    return null;
  }

  // Don't render if loading, no ads, or error
  if (loading || ads.length === 0 || hasError) {
    return null;
  }

  // Safety check: ensure ads have valid image URLs
  const validAds = ads.filter(ad => ad.image_url && ad.image_url.trim().length > 0);
  if (validAds.length === 0) {
    return null;
  }

  // GRID LAYOUT untuk posisi TOP (lebih kecil)
  if (position === "top") {
    return (
      <div className={`${className} custom-ad-banner-grid my-3 md:my-4`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            {ads.map((ad) => (
              <Card
                key={ad.id}
                isPressable
                onPress={() => handleClick(ad)}
                className="relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 rounded-lg border border-default-200 h-20 md:h-24"
              >
                <div className="relative w-full h-full bg-gradient-to-br from-default-100 to-default-50">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    crossOrigin="anonymous"
                    onError={handleImageError}
                  />
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        <p className="text-white text-xs font-medium">
                          {ad.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CAROUSEL LAYOUT untuk posisi lain
  const currentAd = ads[currentAdIndex];

  const containerClasses = {
    top: "w-full h-20 md:h-24",
    middle: "w-full h-24 md:h-32 lg:h-36",
    bottom: "w-full h-20 md:h-28 lg:h-32",
    sidebar: "w-full h-auto aspect-[3/4]",
  };

  return (
    <div className={`${className} custom-ad-banner-wrapper my-2 md:my-3`}>
      <div className="max-w-7xl mx-auto px-4">
        <Card
          isPressable
          onPress={() => handleClick(currentAd)}
          className={`${containerClasses[position]} relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 rounded-lg border border-default-200`}
        >
          <div className="relative w-full h-full bg-gradient-to-br from-default-100 to-default-50">
            <img
              src={currentAd.image_url}
              alt={currentAd.title}
              className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
              crossOrigin="anonymous"
              onError={handleImageError}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 md:p-3">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-xs md:text-sm font-medium mb-1">
                  {currentAd.title}
                </p>
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Klik</span>
                </div>
              </div>
            </div>

            <div className="absolute top-1.5 left-1.5 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <span className="text-white text-xs font-medium uppercase">
                {position === "middle" ? "Iklan" : "Sponsor"}
              </span>
            </div>
          </div>
        </Card>

        {ads.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-2">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentAdIndex 
                    ? "bg-primary w-5 h-1.5" 
                    : "bg-default-300 hover:bg-default-400 w-1.5 h-1.5"
                }`}
                aria-label={`Lihat iklan ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
