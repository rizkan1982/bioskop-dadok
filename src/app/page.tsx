import { NextPage } from "next";
import dynamic from "next/dynamic";

// Temporarily disable ads for debugging white screen
const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));
// const AdBanner = dynamic(() => import("@/components/ui/ads/AdBanner"));
// const CustomAdBanner = dynamic(() => import("@/components/ui/ads/CustomAdBanner"));
// const ScrollingNotice = dynamic(() => import("@/components/ui/ads/ScrollingNotice"));

const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col">
      {/* ========================================= */}
      {/* ADS TEMPORARILY DISABLED FOR WHITE SCREEN DEBUG */}
      {/* ========================================= */}
      <div className="px-4 py-6 text-center bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg mx-4">
        <p className="text-lg">🎬 Welcome to Cikini Asia - Debugging Mode</p>
      </div>
      
      {/* ========================================= */}
      {/* MAIN CONTENT */}
      {/* ========================================= */}
      <div className="flex flex-col gap-6 md:gap-10 px-0">
        
        {/* TODAY'S TRENDING MOVIES */}
        <HomePageList />
        
        {/* CONTINUE YOUR JOURNEY */}
        <ContinueWatching />
        
      </div>
    </div>
  );
};

export default HomePage;
