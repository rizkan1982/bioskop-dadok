import { cn } from "@/utils/helpers";
import { ArrowLeft } from "@/utils/icons";
import ActionButton from "./ActionButton";
import { HiCog6Tooth } from "react-icons/hi2";
import { Button } from "@heroui/react";

interface MoviePlayerHeaderProps {
  id: number;
  movieName: string;
  hidden?: boolean;
  onOpenSource?: () => void;
}

const MoviePlayerHeader: React.FC<MoviePlayerHeaderProps> = ({
  id,
  movieName,
  hidden,
  onOpenSource,
}) => {
  return (
    <div
      aria-hidden={hidden ? true : undefined}
      className={cn(
        "absolute top-0 z-40 flex h-28 w-full items-start justify-between gap-4",
        "bg-linear-to-b from-black/80 to-transparent p-2 text-white transition-opacity md:p-4",
        { "opacity-0": hidden },
      )}
    >
      <ActionButton label="Back" href={`/movie/${id}`}>
        <ArrowLeft size={42} />
      </ActionButton>
      <div className="absolute left-1/2 hidden -translate-x-1/2 flex-col justify-center text-center sm:flex">
        <p className="text-sm text-white text-shadow-lg sm:text-lg lg:text-xl">{movieName}</p>
      </div>
      {onOpenSource && (
        <Button
          isIconOnly
          variant="flat"
          className="bg-black/50 hover:bg-black/70"
          onPress={onOpenSource}
          aria-label="Change Video Source"
        >
          <HiCog6Tooth className="text-2xl text-white" />
        </Button>
      )}
    </div>
  );
};

export default MoviePlayerHeader;
