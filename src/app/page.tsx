import { NextPage } from "next";
import dynamic from "next/dynamic";

const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));
const CustomAdBanner = dynamic(() => import("@/components/ui/ads/CustomAdBanner"));

const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col">
      {/* ========================================= */}
      {/* TOP BANNER ADS */}
      {/* ========================================= */}
      <CustomAdBanner position="top" />
      
      {/* ========================================= */}
      {/* MAIN CONTENT */}
      {/* ========================================= */}
      <div className="flex flex-col gap-6 md:gap-10 px-0">
        
        {/* TODAY'S TRENDING MOVIES */}
        <HomePageList />
        
        {/* MIDDLE BANNER ADS */}
        <CustomAdBanner position="middle" />
        
        {/* CONTINUE YOUR JOURNEY */}
        <ContinueWatching />
        
        {/* BOTTOM BANNER ADS */}
        <CustomAdBanner position="bottom" />
        
      </div>
    </div>
  );
};

export default HomePage;
