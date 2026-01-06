import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { getTvShowPlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDocumentTitle, useIdle } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { memo, useEffect, useRef, useState } from "react";
import { Episode, TvShowDetails } from "tmdb-ts";
import useBreakpoints from "@/hooks/useBreakpoints";
import { SpacingClasses } from "@/utils/constants";
import { useVidlinkPlayer } from "@/hooks/useVidlinkPlayer";
import { recordTvShowView } from "@/actions/histories";
import SubtitleSelector from "@/components/ui/other/SubtitleSelector";
const TvShowPlayerHeader = dynamic(() => import("./Header"));

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
  const hasRecorded = useRef(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('id');

  useVidlinkPlayer({
    saveHistory: true,
    metadata: { season: episode.season_number, episode: episode.episode_number },
  });
  useDocumentTitle(
    `Play ${props.seriesName} - ${props.seasonName} - ${episode.name} | ${siteConfig.name}`,
  );

  // Record TV show view when player opens
  useEffect(() => {
    if (!hasRecorded.current) {
      hasRecorded.current = true;
      const title = `${props.seriesName} - ${props.seasonName} E${episode.episode_number}`;
      recordTvShowView(id, episode.season_number, episode.episode_number, title, tv.poster_path).catch(err => {
        console.log('Failed to record view:', err);
      });
    }
  }, [id, episode.season_number, episode.episode_number, props.seriesName, props.seasonName, tv.poster_path]);

  const PLAYER = players[0]; // Always use first (and only) source

  const handleSubtitleChange = (languageCode: string) => {
    setSelectedSubtitle(languageCode);
    console.log('Subtitle changed to:', languageCode);
  };

  return (
    <div className={cn("relative", SpacingClasses.reset)}>
      <TvShowPlayerHeader
        id={id}
        episode={episode}
        hidden={idle && !mobile}
        selectedSource={0}
        onOpenSource={() => {}}
        onOpenEpisode={() => {}}
        {...props}
      />

      {/* Subtitle Selector */}
      <div className={cn(
        "absolute top-20 right-4 z-50 transition-opacity duration-300",
        idle && !mobile ? "opacity-0" : "opacity-100"
      )}>
        <SubtitleSelector
          tvShowId={id}
          season={episode.season_number}
          episode={episode.episode_number}
          onSubtitleChange={handleSubtitleChange}
        />
      </div>

      <Card shadow="md" radius="none" className="relative h-screen">
        <Skeleton className="absolute h-full w-full" />
        <iframe
          allowFullScreen
          key={PLAYER.title}
          src={PLAYER.source}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          className="z-10 h-full w-full"
          style={{ border: 'none' }}
        />
      </Card>
    </div>
  );
};

export default memo(TvShowPlayer);
