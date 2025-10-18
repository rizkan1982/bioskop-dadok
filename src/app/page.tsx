import { NextPage } from "next";
import dynamic from "next/dynamic";

const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));
const AdBanner = dynamic(() => import("@/components/ui/ads/AdBanner"));
const CustomAdBanner = dynamic(() => import("@/components/ui/ads/CustomAdBanner"));

const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col gap-3 md:gap-8">
      {/* ========================================= */}
      {/* CUSTOM TOP BANNER - Iklan dari Admin */}
      {/* ========================================= */}
      <CustomAdBanner position="top" />
      
      {/* Top banner ad - Native Banner (Adsterra/AdSense existing) */}
      <AdBanner provider="adsterra" variant="native" placement="top" />
      
      <ContinueWatching />
      
      {/* ========================================= */}
      {/* CUSTOM MIDDLE BANNER - Iklan dari Admin */}
      {/* ========================================= */}
      <CustomAdBanner position="middle" />
      
      {/* Mid-content banner ad - Banner 320x50 (Adsterra/AdSense existing) */}
      <AdBanner provider="adsterra" variant="banner" placement="content" />
      
      <HomePageList />
      
      {/* ========================================= */}
      {/* CUSTOM BOTTOM BANNER - Iklan dari Admin */}
      {/* ========================================= */}
      <CustomAdBanner position="bottom" />
      
      {/* Bottom banner ad - Native Banner (Adsterra/AdSense existing) */}
      <AdBanner provider="adsterra" variant="native" placement="bottom" />
    </div>
  );
};

export default HomePage;
