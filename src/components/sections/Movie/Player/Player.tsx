import { SpacingClasses } from "@/utils/constants";
import { siteConfig } from "@/config/site";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { mutateMovieTitle } from "@/utils/movies";
import { getMoviePlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDocumentTitle, useIdle } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import { useVidlinkPlayer } from "@/hooks/useVidlinkPlayer";
import { recordMovieView } from "@/actions/histories";
import SubtitleOverlay from "@/components/ui/other/SubtitleOverlay";
const MoviePlayerHeader = dynamic(() => import("./Header"));

interface MoviePlayerProps {
  movie: MovieDetails;
  startAt?: number;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, startAt }) => {
  console.log("MoviePlayer component rendering:", { movieId: movie.id, title: movie.title, startAt });
  
  const title = mutateMovieTitle(movie);
  const idle = useIdle(3000);
  const { mobile } = useBreakpoints();
  const hasRecorded = useRef(false);

  // Get players (no subtitle param needed - we use overlay)
  const players = getMoviePlayers(movie.id, startAt);
  const PLAYER = players[0];

  useVidlinkPlayer({ saveHistory: true });
  useDocumentTitle(`Play ${title} | ${siteConfig.name}`);

  // Record movie view when player opens
  useEffect(() => {
    if (!hasRecorded.current) {
      hasRecorded.current = true;
      recordMovieView(movie.id, title, movie.poster_path ?? null).catch(err => {
        console.log('Failed to record view (non-critical):', err);
      });
    }
  }, [movie.id, title, movie.poster_path]);

  return (
    <div className={cn("relative", SpacingClasses.reset)}>
      <MoviePlayerHeader
        id={movie.id}
        movieName={title}
        onOpenSource={() => {}}
        hidden={idle && !mobile}
      />
      
      <Card shadow="md" radius="none" className="relative h-screen">
        <Skeleton className="absolute h-full w-full" />
        
        {/* Subtitle Overlay with AI */}
        <SubtitleOverlay tmdbId={movie.id} type="movie" />
        
        <iframe
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          key={PLAYER.title}
          src={PLAYER.source}
          className="z-10 h-full w-full"
          style={{ border: 'none' }}
          onError={(e) => {
            console.error("Iframe error:", e);
          }}
        />
      </Card>
    </div>
  );
};

MoviePlayer.displayName = "MoviePlayer";

export default MoviePlayer;
