"use client";

import { useState, useEffect } from "react";
import { Card } from "@heroui/react";

interface InlineBannerAdProps {
  className?: string;
}

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
}

export default function InlineBannerAd({ className = "" }: InlineBannerAdProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAd();
  }, []);

  const fetchAd = async () => {
    try {
      const res = await fetch(`/api/ads?active=true&position=middle`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        const randomAd = data.data[Math.floor(Math.random() * data.data.length)];
        setAd(randomAd);
      }
    } catch (error) {
      console.error("Error fetching inline ad:", error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading || !ad) {
    return null;
  }

  return (
    <div className={`${className} inline-banner-ad my-4 md:my-5`}>
      <div className="max-w-7xl mx-auto px-4">
        <Card
          isPressable
          onPress={() => handleClick(ad)}
          className="relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 rounded-lg border border-default-200 h-20 md:h-24"
        >
          <div className="relative w-full h-full bg-gradient-to-r from-default-100 to-default-50">
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
            
            <div className="absolute top-1.5 right-1.5 bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-bold uppercase">
              Ad
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
