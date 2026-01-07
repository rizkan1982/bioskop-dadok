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
    <div className="flex flex-col gap-6 sm:gap-8 md:gap-10 lg:gap-12">
      <ContentTypeSelection className="justify-center px-3 sm:px-4 md:px-0" />
      <div className="relative flex min-h-32 flex-col gap-6 sm:gap-8 md:gap-10">
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
                {/* Banner muncul SETIAP 1 kategori (kecuali kategori terakhir) */}
                {index < movies.length - 1 && <InlineBannerAd />}
              </div>
            ))}
          {content === "tv" &&
            tvShows.map((tv, index) => (
              <div key={tv.name}>
                <TvShowHomeList {...tv} />
                {/* Banner muncul SETIAP 1 kategori (kecuali kategori terakhir) */}
                {index < tvShows.length - 1 && <InlineBannerAd />}
              </div>
            ))}
        </Suspense>
      </div>
    </div>
  );
};

export default HomePageList;
