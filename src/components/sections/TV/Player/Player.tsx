import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { getTvShowPlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { memo, useEffect, useMemo, useRef } from "react";
import { Episode, TvShowDetails } from "tmdb-ts";
import useBreakpoints from "@/hooks/useBreakpoints";
import { SpacingClasses } from "@/utils/constants";
import { useVidlinkPlayer } from "@/hooks/useVidlinkPlayer";
import { recordTvShowView } from "@/actions/histories";
const TvShowPlayerHeader = dynamic(() => import("./Header"));
const TvShowPlayerEpisodeSelection = dynamic(() => import("./EpisodeSelection"));

export interface TvShowPlayerProps {
  tv: TvShowDetails;
  id: number;
  seriesName: string;
  seasonName: string;
  episode: Episode;
  episodes: Episode[];
  nextEpisodeNumber: number | null;
  prevEpisodeNumber: number | null;
  startAt?: number;
}

const TvShowPlayer: React.FC<TvShowPlayerProps> = ({
  tv,
  id,
  episode,
  episodes,
  startAt,
  ...props
}) => {
  const { mobile } = useBreakpoints();
  const players = getTvShowPlayers(id, episode.season_number, episode.episode_number, startAt);
  const idle = useIdle(3000);
  const [episodeOpened, episodeHandlers] = useDisclosure(false);
  const [sourceOpened, sourceHandlers] = useDisclosure(false);
  const [selectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );
  const hasRecorded = useRef(false);

  useVidlinkPlayer({
    saveHistory: true,
    metadata: { season: episode.season_number, episode: episode.episode_number },
  });
  useDocumentTitle(
    `Play ${props.seriesName} - ${props.seasonName} - ${episode.name} | ${siteConfig.name}`,
  );

  // Record TV show view when player opens (regardless of video source)
  useEffect(() => {
    if (!hasRecorded.current) {
      hasRecorded.current = true;
      const title = `${props.seriesName} - ${props.seasonName} E${episode.episode_number}`;
      recordTvShowView(id, episode.season_number, episode.episode_number, title, tv.poster_path);
    }
  }, [id, episode.season_number, episode.episode_number, props.seriesName, props.seasonName, tv.poster_path]);

  const PLAYER = useMemo(() => players[selectedSource] || players[0], [players, selectedSource]);

  return (
    <>
      <div className={cn("relative", SpacingClasses.reset)}>
        <TvShowPlayerHeader
          id={id}
          episode={episode}
          hidden={idle && !mobile}
          selectedSource={selectedSource}
          onOpenSource={sourceHandlers.open}
          onOpenEpisode={episodeHandlers.open}
          {...props}
        />

        <Card shadow="md" radius="none" className="relative h-screen">
          <Skeleton className="absolute h-full w-full" />
          <iframe
            allowFullScreen
            key={PLAYER.title}
            src={PLAYER.source}
            sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
            referrerPolicy="no-referrer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            className={cn("z-10 h-full w-full", { "pointer-events-none": idle && !mobile })}
          />
        </Card>
      </div>

      <TvShowPlayerEpisodeSelection
        id={id}
        opened={episodeOpened}
        onClose={episodeHandlers.close}
        episodes={episodes}
      />
    </>
  );
};

export default memo(TvShowPlayer);
