"use client";

import Rating from "@/components/ui/other/Rating";
import type { HistoryDetail } from "@/types/movie";
import { cn } from "@/utils/helpers";
import { PlayOutline } from "@/utils/icons";
import { formatDuration, getImageUrl, timeAgo } from "@/utils/movies";
import { Chip, Image, Progress } from "@heroui/react";
import Link from "next/link";
import { useCallback } from "react";

interface ResumeCardProps {
  media: HistoryDetail;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ media }) => {
  // Note: release_date, backdrop_path, vote_average not in histories table
  const releaseYear = new Date().getFullYear(); // Placeholder
  const posterImage = getImageUrl(media.poster_path || "");

  const getRedirectLink = useCallback(() => {
    if (media.content_type === "movie") {
      return `/movie/${media.tmdb_id}/player`;
    }
    if (media.content_type === "tv") {
      return `/tv/${media.tmdb_id}/${media.season_number}/${media.episode_number}/player`;
    }
    return "/";
  }, [media]);

  return (
    <>
      <Link href={getRedirectLink()}>
        <div
          className={cn(
            "group motion-preset-focus relative aspect-video overflow-hidden rounded-lg text-white",
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/35 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
              <PlayOutline className="h-6 w-6 text-white" />
            </div>
          </div>
          {media.content_type === "tv" && (
            <Chip
              size="sm"
              variant="faded"
              radius="sm"
              color="warning"
              className="absolute right-2 top-2 z-20"
              classNames={{ content: "font-bold" }}
            >
              S{media.season_number} E{media.episode_number}
            </Chip>
          )}
          <Chip
            radius="sm"
            size="sm"
            variant="faded"
            className="absolute left-2 top-2 z-20"
            color={media.progress >= 95 ? "success" : undefined}
          >
            {media.progress >= 95 ? "Completed" : `${Math.round(media.progress)}%`}
          </Chip>
          <Progress
            size="sm"
            radius="md"
            aria-label="Watch progress"
            className="absolute bottom-0 z-10 w-full"
            color={media.content_type === "movie" ? "primary" : "warning"}
            value={media.progress}
          />
          <div className="absolute bottom-0 z-2 h-1/2 w-full bg-linear-to-t from-black from-1%" />
          <div className="absolute bottom-0 z-3 flex w-full flex-col gap-1 p-3">
            <div className="grid grid-cols-[1fr_auto] items-end justify-between gap-5">
              <h6 className="truncate text-sm font-semibold">{media.title}</h6>
              <p className="truncate text-xs">{timeAgo(media.updated_at)}</p>
            </div>
            <div className="flex justify-between text-xs">
              <p>{releaseYear}</p>
              <Rating rate={0} />
            </div>
          </div>
          <Image
            alt={media.title}
            src={posterImage}
            radius="none"
            className="z-0 aspect-video h-[150px] object-cover object-center transition group-hover:scale-110 md:h-[200px]"
            classNames={{
              img: "group-hover:opacity-70",
            }}
          />
        </div>
      </Link>
    </>
  );
};
export default ResumeCard;
