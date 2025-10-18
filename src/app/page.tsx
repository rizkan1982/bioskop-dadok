import { NextPage } from "next";
import dynamic from "next/dynamic";

const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));
const AdBanner = dynamic(() => import("@/components/ui/ads/AdBanner"));
const CustomAdBanner = dynamic(() => import("@/components/ui/ads/CustomAdBanner"));
const ScrollingNotice = dynamic(() => import("@/components/ui/ads/ScrollingNotice"));

const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col">
      {/* ========================================= */}
      {/* SCROLLING NOTICE - Banner Informasi */}
      {/* ========================================= */}
      <ScrollingNotice 
        text="Selamat datang di Cinemadadok! Nikmati film dan series terbaik. Jangan lupa follow sosial media kami untuk update terbaru!"
      />
      
      {/* ========================================= */}
      {/* CUSTOM TOP BANNER - GRID LAYOUT */}
      {/* Iklan banner custom dari admin panel */}
      {/* ========================================= */}
      <div className="w-full">
        <CustomAdBanner position="top" />
      </div>
      
      {/* Top banner ad - Adsterra/AdSense existing */}
      <div className="px-4 md:px-6 lg:px-8">
        <AdBanner provider="adsterra" variant="native" placement="top" />
      </div>
      
      {/* ========================================= */}
      {/* MAIN CONTENT */}
      {/* ========================================= */}
      <div className="flex flex-col gap-6 md:gap-10 px-0">
        
        {/* TODAY'S TRENDING MOVIES - Dipindah ke atas */}
        <HomePageList />
        
        {/* CONTINUE YOUR JOURNEY - Dipindah ke bawah trending */}
        <ContinueWatching />
        
        {/* ========================================= */}
        {/* CUSTOM MIDDLE BANNER - Carousel */}
        {/* ========================================= */}
        <div className="w-full">
          <CustomAdBanner position="middle" />
        </div>
        
        {/* Mid-content banner ad */}
        <div className="px-4 md:px-6 lg:px-8">
          <AdBanner provider="adsterra" variant="banner" placement="content" />
        </div>
        
        {/* ========================================= */}
        {/* CUSTOM BOTTOM BANNER - Carousel */}
        {/* ========================================= */}
        <div className="w-full mb-6">
          <CustomAdBanner position="bottom" />
        </div>
        
        {/* Bottom banner ad */}
        <div className="px-4 md:px-6 lg:px-8 mb-8">
          <AdBanner provider="adsterra" variant="native" placement="bottom" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
