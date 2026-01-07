import Rating from "@/components/ui/other/Rating";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDeviceVibration from "@/hooks/useDeviceVibration";
import { getImageUrl, mutateTvShowTitle } from "@/utils/movies";
import { Card, CardBody, CardFooter, CardHeader, Chip, Image, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDisclosure, useHover } from "@mantine/hooks";
import Link from "next/link";
import { useCallback } from "react";
import { TV } from "tmdb-ts/dist/types";
import { useLongPress } from "use-long-press";
import TvShowHoverCard from "./Hover";

interface TvShowPosterCardProps {
  tv: TV;
  variant?: "full" | "bordered";
}

const TvShowPosterCard: React.FC<TvShowPosterCardProps> = ({ tv, variant = "full" }) => {
  const { hovered, ref } = useHover();
  const [opened, handlers] = useDisclosure(false);
  const releaseYear = new Date(tv.first_air_date).getFullYear();
  const posterImage = getImageUrl(tv.poster_path);
  const title = mutateTvShowTitle(tv);
  const { mobile } = useBreakpoints();
  const { startVibration } = useDeviceVibration();

  const callback = useCallback(() => {
    handlers.open();
    setTimeout(() => startVibration([100]), 300);
  }, []);

  const longPress = useLongPress(mobile ? callback : null, {
    cancelOnMovement: true,
    threshold: 300,
  });

  return (
    <>
      <Tooltip
        isDisabled={mobile}
        showArrow
        className="bg-secondary-background p-0"
        shadow="lg"
        delay={1000}
        placement="right-start"
        content={<TvShowHoverCard id={tv.id} />}
      >
        <Link href={`/tv/${tv.id}`} ref={ref} {...longPress()}>
          {variant === "full" && (
            <div className="group motion-preset-focus relative aspect-2/3 w-[140px] overflow-hidden rounded-xl border-[3px] border-transparent text-white shadow-md transition-all duration-200 hover:border-warning hover:shadow-xl active:scale-[0.98] sm:w-[155px] md:w-[170px] lg:w-[185px]">
              {hovered && (
                <Icon
                  icon="line-md:play-filled"
                  width="48"
                  height="48"
                  className="absolute-center z-20 text-white drop-shadow-lg md:h-16 md:w-16"
                />
              )}
              {tv.adult && (
                <Chip
                  color="danger"
                  size="sm"
                  variant="flat"
                  className="absolute left-1.5 top-1.5 z-20 text-xs sm:left-2 sm:top-2"
                >
                  18+
                </Chip>
              )}
              <div className="absolute bottom-0 z-2 h-2/3 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 z-3 flex w-full flex-col gap-0.5 px-2.5 py-2 sm:gap-1 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
                <h6 className="line-clamp-2 text-xs font-semibold leading-tight sm:text-sm">{title}</h6>
                <div className="flex items-center justify-between text-[10px] opacity-90 sm:text-xs">
                  <span className="font-medium">{releaseYear}</span>
                  <Rating rate={tv.vote_average} />
                </div>
              </div>
              <Image
                alt={title}
                src={posterImage}
                radius="none"
                className="z-0 aspect-2/3 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                classNames={{
                  img: "group-hover:opacity-80 transition-opacity duration-300",
                }}
              />
            </div>
          )}

          {variant === "bordered" && (
            <Card
              isHoverable
              fullWidth
              shadow="md"
              className="group h-full bg-secondary-background"
            >
              <CardHeader className="flex items-center justify-center pb-0">
                <div className="relative size-full">
                  {hovered && (
                    <Icon
                      icon="line-md:play-filled"
                      width="64"
                      height="64"
                      className="absolute-center z-20 text-white"
                    />
                  )}
                  {tv.adult && (
                    <Chip
                      color="danger"
                      size="sm"
                      variant="shadow"
                      className="absolute left-2 top-2 z-20"
                    >
                      18+
                    </Chip>
                  )}
                  <div className="relative overflow-hidden rounded-large">
                    <Image
                      isBlurred
                      alt={title}
                      className="aspect-2/3 rounded-lg object-cover object-center group-hover:scale-110"
                      src={posterImage}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody className="justify-end pb-1">
                <p className="text-md truncate font-bold">{title}</p>
              </CardBody>
              <CardFooter className="justify-between pt-0 text-xs">
                <p>{releaseYear}</p>
                <Rating rate={tv.vote_average} />
              </CardFooter>
            </Card>
          )}
        </Link>
      </Tooltip>

      {mobile && (
        <VaulDrawer
          backdrop="blur"
          open={opened}
          onOpenChange={handlers.toggle}
          title={title}
          hiddenTitle
        >
          <TvShowHoverCard id={tv.id} fullWidth />
        </VaulDrawer>
      )}
    </>
  );
};

export default TvShowPosterCard;
