import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { getTvShowPlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDocumentTitle, useIdle } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { memo, useEffect, useRef } from "react";
import { Episode, TvShowDetails } from "tmdb-ts";
import useBreakpoints from "@/hooks/useBreakpoints";
import { SpacingClasses } from "@/utils/constants";
import { useVidlinkPlayer } from "@/hooks/useVidlinkPlayer";
import { recordTvShowView } from "@/actions/histories";
import SubtitleOverlay from "@/components/ui/other/SubtitleOverlay";
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
  const idle = useIdle(3000);
  const hasRecorded = useRef(false);

  // Get players (no subtitle param - we use overlay)
  const players = getTvShowPlayers(id, episode.season_number, episode.episode_number, startAt);
  const PLAYER = players[0];

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

      <Card shadow="md" radius="none" className="relative h-screen">
        <Skeleton className="absolute h-full w-full" />
        
        {/* Subtitle Overlay with AI */}
        <SubtitleOverlay 
          tmdbId={id} 
          type="tv" 
          season={episode.season_number}
          episode={episode.episode_number}
        />
        
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
