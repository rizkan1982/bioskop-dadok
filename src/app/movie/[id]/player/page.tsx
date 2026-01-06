"use client";

import { tmdb } from "@/api/tmdb";
import { getMovieLastPosition } from "@/actions/histories";
import MoviePlayer from "@/components/sections/Movie/Player/Player";
import { Params } from "@/types";
import { isEmpty } from "@/utils/helpers";
import { Button, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { NextPage } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { use, useEffect } from "react";

const MoviePlayerPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);

  console.log("Movie Player Page - ID:", id);

  // Prevent accidental navigation back
  useEffect(() => {
    const preventBack = (e: PopStateEvent) => {
      console.log("Prevented back navigation");
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventBack);

    return () => {
      window.removeEventListener("popstate", preventBack);
    };
  }, []);

const MoviePlayerPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);

  console.log("Movie Player Page - ID:", id);

  const {
    data: movie,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryFn: () => tmdb.movies.details(id),
    queryKey: ["movie-player-detail", id],
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: startAt, isPending: isPendingStartAt } = useQuery({
    queryFn: () => getMovieLastPosition(id),
    queryKey: ["movie-player-start-at", id],
    retry: 1,
  });

  console.log("Movie data:", { movie, isPending, error, isEmpty: isEmpty(movie) });

  if (isPending || isPendingStartAt) {
    return <Spinner size="lg" className="absolute-center" variant="simple" />;
  }

  // Handle error state with user-friendly message
  if (error) {
    console.error("Movie player error:", error);
    return (
      <div className="absolute-center flex flex-col items-center gap-4 text-center p-4">
        <h2 className="text-xl font-semibold text-red-400">Failed to Load Player</h2>
        <p className="text-slate-400 max-w-md">
          Unable to load movie data. This could be due to network issues or the movie may not be available.
        </p>
        <p className="text-xs text-slate-500 mt-2">Error: {error instanceof Error ? error.message : String(error)}</p>
        <div className="flex gap-3 mt-2">
          <Button color="primary" onPress={() => refetch()}>
            Try Again
          </Button>
          <Button as={Link} href={`/movie/${id}`} variant="bordered">
            Back to Details
          </Button>
        </div>
      </div>
    );
  }

  if (isEmpty(movie)) {
    console.error("Movie is empty, calling notFound()");
    return notFound();
  }

  console.log("Rendering MoviePlayer with movie:", movie.title);
  return <MoviePlayer movie={movie} startAt={startAt} />;
};

export default MoviePlayerPage;
