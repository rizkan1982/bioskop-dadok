import { SpacingClasses } from "@/utils/constants";
import { siteConfig } from "@/config/site";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { mutateMovieTitle } from "@/utils/movies";
import { getMoviePlayers } from "@/utils/players";
import { Card, Skeleton, Chip } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import { useVidlinkPlayer } from "@/hooks/useVidlinkPlayer";
import { recordMovieView } from "@/actions/histories";
const MoviePlayerHeader = dynamic(() => import("./Header"));
const MoviePlayerSourceSelection = dynamic(() => import("./SourceSelection"));

interface MoviePlayerProps {
  movie: MovieDetails;
  startAt?: number;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, startAt }) => {
  console.log("MoviePlayer component rendering:", { movieId: movie.id, title: movie.title, startAt });
  
  const players = getMoviePlayers(movie.id, startAt);
  const title = mutateMovieTitle(movie);
  const idle = useIdle(3000);
  const { mobile } = useBreakpoints();
  const [opened, handlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );
  const hasRecorded = useRef(false);
  const [isTryingAltSource, setIsTryingAltSource] = useState(false);
  const autoSwitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useVidlinkPlayer({ saveHistory: true });
  useDocumentTitle(`Play ${title} | ${siteConfig.name}`);

  // Record movie view when player opens (regardless of video source)
  useEffect(() => {
    if (!hasRecorded.current) {
      hasRecorded.current = true;
      // Don't await - run in background to not block player
      recordMovieView(movie.id, title, movie.poster_path ?? null).catch(err => {
        console.log('Failed to record view (non-critical):', err);
        // Silently fail - don't let this break the player
      });
    }
  }, [movie.id, title, movie.poster_path]);

  // Auto-switch to next source if current one seems to fail
  useEffect(() => {
    // Clear any existing timeout
    if (autoSwitchTimeoutRef.current) {
      clearTimeout(autoSwitchTimeoutRef.current);
    }

    // Set timeout to try next source after 15 seconds (give more time to load)
    setIsTryingAltSource(false);
    autoSwitchTimeoutRef.current = setTimeout(() => {
      const currentIndex = selectedSource ?? 0;
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < players.length) {
        setIsTryingAltSource(true);
        setTimeout(() => {
          setSelectedSource(nextIndex);
        }, 1000);
      }
    }, 15000);

    return () => {
      if (autoSwitchTimeoutRef.current) {
        clearTimeout(autoSwitchTimeoutRef.current);
      }
    };
  }, [selectedSource, players.length, setSelectedSource]);

  const PLAYER = useMemo(() => players[selectedSource ?? 0] || players[0], [players, selectedSource]);

  return (
    <>
      <div className={cn("relative", SpacingClasses.reset)}>
        <MoviePlayerHeader
          id={movie.id}
          movieName={title}
          onOpenSource={handlers.open}
          hidden={idle && !mobile}
        />
        
        {/* Show indicator when trying alternative source */}
        {isTryingAltSource && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <Chip
              color="warning"
              variant="flat"
              className="animate-pulse"
            >
              Mencoba sumber video lain...
            </Chip>
          </div>
        )}

        {/* Show current source info */}
        {!idle && (
          <div className="absolute bottom-4 left-4 z-50">
            <Chip
              size="sm"
              variant="flat"
              className="bg-black/60 text-white"
            >
              {PLAYER.title} {selectedSource !== null && selectedSource > 0 && `(${selectedSource + 1}/${players.length})`}
            </Chip>
          </div>
        )}
        
        <Card shadow="md" radius="none" className="relative h-screen">
          <Skeleton className="absolute h-full w-full" />
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

      <MoviePlayerSourceSelection
        opened={opened}
        onClose={handlers.close}
        players={players}
        selectedSource={selectedSource ?? 0}
        setSelectedSource={setSelectedSource}
      />
    </>
  );
};

MoviePlayer.displayName = "MoviePlayer";

export default MoviePlayer;
