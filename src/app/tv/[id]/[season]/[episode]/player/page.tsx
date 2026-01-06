"use client";

import { tmdb } from "@/api/tmdb";
import { Params } from "@/types";
import { Button, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { use } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { NextPage } from "next";
import { getTvShowLastPosition } from "@/actions/histories";
const TvShowPlayer = dynamic(() => import("@/components/sections/TV/Player/Player"));

const TvShowPlayerPage: NextPage<Params<{ id: number; season: number; episode: number }>> = ({
  params,
}) => {
  const { id, season, episode } = use(params);

  const {
    data: tv,
    isPending: isPendingTv,
    error: errorTv,
    refetch: refetchTv,
  } = useQuery({
    queryFn: () => tmdb.tvShows.details(id),
    queryKey: ["tv-show-player-details", id],
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data: seasonDetail,
    isPending: isPendingSeason,
    error: errorSeason,
    refetch: refetchSeason,
  } = useQuery({
    queryFn: () => tmdb.tvShows.season(id, season),
    queryKey: ["tv-show-season", id, season],
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: startAt, isPending: isPendingStartAt } = useQuery({
    queryFn: () => getTvShowLastPosition(id, season, episode),
    queryKey: ["tv-show-player-start-at", id, season, episode],
    retry: 1,
  });

  if (isPendingTv || isPendingSeason || isPendingStartAt) {
    return <Spinner size="lg" className="absolute-center" color="warning" variant="simple" />;
  }

  // Handle error state with user-friendly message
  if (errorTv || errorSeason) {
    return (
      <div className="absolute-center flex flex-col items-center gap-4 text-center p-4">
        <h2 className="text-xl font-semibold text-red-400">Failed to Load Player</h2>
        <p className="text-slate-400 max-w-md">
          Unable to load TV show data. This could be due to network issues or the episode may not be available.
        </p>
        <div className="flex gap-3 mt-2">
          <Button color="primary" onPress={() => { refetchTv(); refetchSeason(); }}>
            Try Again
          </Button>
          <Button as={Link} href={`/tv/${id}`} variant="bordered">
            Back to Details
          </Button>
        </div>
      </div>
    );
  }

  const EPISODE = seasonDetail?.episodes.find(
    (e) => e.episode_number.toString() === episode.toString(),
  );

  if (!EPISODE) notFound();

  const isNotReleased = new Date(EPISODE.air_date) > new Date();

  if (isNotReleased) notFound();

  const currentEpisodeIndex = seasonDetail.episodes.findIndex(
    (e) => e.episode_number === EPISODE.episode_number,
  );

  const nextEpisodeNumber =
    currentEpisodeIndex < seasonDetail.episodes.length - 1
      ? new Date(seasonDetail.episodes[currentEpisodeIndex + 1].air_date) > new Date()
        ? null
        : seasonDetail.episodes[currentEpisodeIndex + 1].episode_number
      : null;

  const prevEpisodeNumber =
    currentEpisodeIndex > 0 ? seasonDetail.episodes[currentEpisodeIndex - 1].episode_number : null;

  return (
    <TvShowPlayer
      tv={tv}
      id={id}
      seriesName={tv.name}
      seasonName={seasonDetail.name}
      episode={EPISODE}
      episodes={seasonDetail.episodes}
      nextEpisodeNumber={nextEpisodeNumber}
      prevEpisodeNumber={prevEpisodeNumber}
      startAt={startAt}
    />
  );
};

export default TvShowPlayerPage;
