"use client";

import { Suspense, use } from "react";
import { Spinner } from "@heroui/spinner";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/api/tmdb";
import { Cast } from "tmdb-ts/dist/types/credits";
import { notFound } from "next/navigation";
import { Image } from "tmdb-ts";
import dynamic from "next/dynamic";
import { Params } from "@/types";
import { NextPage } from "next";

const PhotosSection = dynamic(() => import("@/components/ui/other/PhotosSection"));
const BackdropSection = dynamic(() => import("@/components/sections/Movie/Detail/Backdrop"));
const OverviewSection = dynamic(() => import("@/components/sections/Movie/Detail/Overview"));
const CastsSection = dynamic(() => import("@/components/sections/Movie/Detail/Casts"));
const RelatedSection = dynamic(() => import("@/components/sections/Movie/Detail/Related"));

const MovieDetailPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);

  // Debug logging to track component mounting
  console.log("🎬 [MovieDetailPage] Component mounted with ID:", id);
  console.log("🌐 [MovieDetailPage] Current URL:", typeof window !== "undefined" ? window.location.href : "SSR");

  const {
    data: movie,
    isPending,
    error,
  } = useQuery({
    queryFn: () =>
      tmdb.movies.details(id, [
        "images",
        "videos",
        "credits",
        "keywords",
        "recommendations",
        "similar",
        "reviews",
        "watch/providers",
      ]),
    queryKey: ["movie-detail", id],
  });

  console.log("📊 [MovieDetailPage] Query state:", { 
    isPending, 
    hasError: !!error, 
    hasData: !!movie,
    movieTitle: movie?.title 
  });

  if (isPending) {
    console.log("⏳ [MovieDetailPage] Loading movie data...");
    return <Spinner size="lg" className="absolute-center" variant="simple" />;
  }

  if (error) {
    console.error("❌ [MovieDetailPage] Error loading movie:", error);
    notFound();
  }

  console.log("✅ [MovieDetailPage] Rendering movie:", movie.title);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Visible indicator that movie detail page loaded */}
      <div className="bg-primary-500 text-white p-2 text-center text-sm mb-4 rounded">
        ✅ Movie Detail Page Loaded: {movie.title} (ID: {id})
      </div>
      <Suspense fallback={<Spinner size="lg" className="absolute-center" variant="simple" />}>
        <div className="flex flex-col gap-10">
          <BackdropSection movie={movie} />
          <OverviewSection movie={movie} />
          <CastsSection casts={movie.credits.cast as Cast[]} />
          <PhotosSection images={movie.images.backdrops as Image[]} />
          <RelatedSection movie={movie} />
        </div>
      </Suspense>
    </div>
  );
};

export default MovieDetailPage;
