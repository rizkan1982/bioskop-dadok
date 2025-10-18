"use client";

import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import { siteConfig } from "@/config/site";
import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Suspense } from "react";

const MovieHomeList = dynamic(() => import("@/components/sections/Movie/HomeList"));
const TvShowHomeList = dynamic(() => import("@/components/sections/TV/HomeList"));
const InlineBannerAd = dynamic(() => import("@/components/ui/ads/InlineBannerAd"));

const HomePageList: React.FC = () => {
  const { movies, tvShows } = siteConfig.queryLists;
  const [content] = useQueryState(
    "content",
    parseAsStringLiteral(["movie", "tv"]).withDefault("movie"),
  );

  return (
    <div className="flex flex-col gap-10 md:gap-12">
      <ContentTypeSelection className="justify-center" />
      <div className="relative flex min-h-32 flex-col gap-8 md:gap-10">
        <Suspense
          fallback={
            <Spinner
              size="lg"
              variant="simple"
              className="absolute-center"
              color={content === "movie" ? "primary" : "warning"}
            />
          }
        >
          {content === "movie" &&
            movies.map((movie, index) => (
              <div key={movie.name}>
                <MovieHomeList {...movie} />
                {/* Sisipkan banner setelah setiap kategori */}
                {(index + 1) % 2 === 0 && <InlineBannerAd />}
              </div>
            ))}
          {content === "tv" &&
            tvShows.map((tv, index) => (
              <div key={tv.name}>
                <TvShowHomeList {...tv} />
                {/* Sisipkan banner setelah setiap kategori */}
                {(index + 1) % 2 === 0 && <InlineBannerAd />}
              </div>
            ))}
        </Suspense>
      </div>
    </div>
  );
};

export default HomePageList;
