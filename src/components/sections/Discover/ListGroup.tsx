"use client";

import MovieDiscoverList from "./MovieList";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import DiscoverFilters from "./Filters";
import TvShowDiscoverList from "./TvShowList";

const DiscoverListGroup = () => {
  const { content } = useDiscoverFilters();

  return (
    <div className="flex flex-col gap-6 px-3 sm:gap-8 sm:px-4 md:gap-10 md:px-6">
      <DiscoverFilters />
      {content === "movie" && <MovieDiscoverList />}
      {content === "tv" && <TvShowDiscoverList />}
    </div>
  );
};

export default DiscoverListGroup;
