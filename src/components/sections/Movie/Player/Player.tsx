import { SpacingClasses } from "@/utils/constants";
import { siteConfig } from "@/config/site";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { mutateMovieTitle } from "@/utils/movies";
import { getMoviePlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef } from "react";
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

  useVidlinkPlayer({ saveHistory: true });
  useDocumentTitle(`Play ${title} | ${siteConfig.name}`);

  // Record movie view when player opens (regardless of video source)
  useEffect(() => {
    if (!hasRecorded.current) {
      hasRecorded.current = true;
      // Don't await - run in background to not block player
      recordMovieView(movie.id, title, movie.poster_path ?? null).catch(err => {
        console.log('Failed to record view:', err);
      });
    }
  }, [movie.id, title, movie.poster_path]);

  const PLAYER = useMemo(() => players[selectedSource] || players[0], [players, selectedSource]);

  return (
    <>
      <div className={cn("relative", SpacingClasses.reset)}>
        <MoviePlayerHeader
          id={movie.id}
          movieName={title}
          onOpenSource={handlers.open}
          hidden={idle && !mobile}
        />
        <Card shadow="md" radius="none" className="relative h-screen">
          <Skeleton className="absolute h-full w-full" />
          <iframe
            allowFullScreen
            key={PLAYER.title}
            src={PLAYER.source}
            className={cn("z-10 h-full", { "pointer-events-none": idle && !mobile })}
          />
        </Card>
      </div>

      <MoviePlayerSourceSelection
        opened={opened}
        onClose={handlers.close}
        players={players}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
      />
    </>
  );
};

MoviePlayer.displayName = "MoviePlayer";

export default MoviePlayer;
