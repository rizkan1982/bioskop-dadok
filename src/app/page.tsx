import { NextPage } from "next";
import dynamic from "next/dynamic";
const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));
const AdBanner = dynamic(() => import("@/components/ui/ads/AdBanner"));

const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col gap-3 md:gap-8">
      {/* Top banner ad - Native Banner */}
      <AdBanner provider="adsterra" variant="native" placement="top" />
      
      <ContinueWatching />
      
      {/* Mid-content banner ad - Banner 320x50 */}
      <AdBanner provider="adsterra" variant="banner" placement="content" />
      
      <HomePageList />
      
      {/* Bottom banner ad - Native Banner */}
      <AdBanner provider="adsterra" variant="native" placement="bottom" />
    </div>
  );
};

export default HomePage;
