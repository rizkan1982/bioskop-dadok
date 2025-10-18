"use client";

import { useState, useEffect } from "react";
import { Card } from "@heroui/react";
import Image from "next/image";

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

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

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

  const currentAd = ads[currentAdIndex];

  const sizeClasses = {
    top: "w-full h-32 md:h-48",
    middle: "w-full h-40 md:h-56",
    bottom: "w-full h-32 md:h-40",
    sidebar: "w-full h-96",
  };

  return (
    <div className={`${className} custom-ad-banner-container`}>
      <Card
        isPressable
        onPress={() => handleClick(currentAd)}
        className={`${sizeClasses[position]} relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform`}
      >
        <div className="relative w-full h-full">
          <Image
            src={currentAd.image_url}
            alt={currentAd.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            priority={position === "top"}
          />
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium px-4 py-2 bg-black/50 rounded-lg transition-opacity duration-300">
              Klik untuk info lebih lanjut
            </span>
          </div>
        </div>
      </Card>

      {ads.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAdIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentAdIndex ? "bg-primary w-6" : "bg-default-300 w-2"
              }`}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
