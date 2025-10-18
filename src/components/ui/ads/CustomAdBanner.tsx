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

  useEffect(() => {
    fetchAds();
  }, [position]);

  const fetchAds = async () => {
    try {
      const res = await fetch(`/api/ads?active=true&position=${position}`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setAds(data.data);
      }
    } catch (error) {
      console.error("Error fetching custom ads:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate hanya untuk posisi selain top (middle, bottom, sidebar tetap carousel)
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
      await fetch(`/api/ads/${ad.id}`, { method: "PATCH" });
    } catch (error) {
      console.error("Error tracking click:", error);
    }

    if (ad.link_url) {
      window.open(ad.link_url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading || ads.length === 0) {
    return null;
  }

  // GRID LAYOUT untuk posisi TOP (menampilkan semua banner sekaligus)
  if (position === "top") {
    return (
      <div className={`${className} custom-ad-banner-grid my-4 md:my-6`}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Grid: 1 kolom mobile, 2 kolom tablet+desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {ads.map((ad) => (
              <Card
                key={ad.id}
                isPressable
                onPress={() => handleClick(ad)}
                className="relative overflow-hidden group cursor-pointer hover:shadow-xl 
                  transition-all duration-300 rounded-lg border border-default-200 h-28 md:h-32"
              >
                <div className="relative w-full h-full bg-gradient-to-br from-default-100 to-default-50">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 
                    transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <p className="text-white text-xs md:text-sm font-medium">
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

  // CAROUSEL LAYOUT untuk posisi lain (middle, bottom, sidebar)
  const currentAd = ads[currentAdIndex];

  const containerClasses = {
    top: "w-full h-40 md:h-52 lg:h-64", // tidak dipakai karena top pakai grid
    middle: "w-full h-44 md:h-56 lg:h-72",
    bottom: "w-full h-36 md:h-48 lg:h-56",
    sidebar: "w-full h-auto aspect-[3/4]",
  };

  return (
    <div className={`${className} custom-ad-banner-wrapper my-4 md:my-6`}>
      <div className="max-w-7xl mx-auto px-4">
        <Card
          isPressable
          onPress={() => handleClick(currentAd)}
          className={`${containerClasses[position]} relative overflow-hidden group cursor-pointer 
            hover:shadow-2xl transition-all duration-300 rounded-xl border border-default-200`}
        >
          <div className="relative w-full h-full bg-gradient-to-br from-default-100 to-default-50">
            <img
              src={currentAd.image_url}
              alt={currentAd.title}
              className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 
              flex flex-col justify-end p-4 md:p-6">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-sm md:text-base font-medium mb-2">
                  {currentAd.title}
                </p>
                <div className="flex items-center gap-2 text-white/80 text-xs md:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Klik untuk info lebih lanjut</span>
                </div>
              </div>
            </div>

            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-xs font-medium uppercase tracking-wide">
                {position === "middle" ? "Iklan" : 
                 position === "bottom" ? "Sponsor" : "Promosi"}
              </span>
            </div>
          </div>
        </Card>

        {ads.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentAdIndex 
                    ? "bg-primary w-8 h-2" 
                    : "bg-default-300 hover:bg-default-400 w-2 h-2"
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
