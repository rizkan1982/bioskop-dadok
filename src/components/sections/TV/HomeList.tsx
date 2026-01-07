"use client";

import TvShowHomeCard from "@/components/sections/TV/Cards/Poster";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import { QueryList } from "@/types";
import { Link, Skeleton } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { kebabCase } from "string-ts";
import { TV } from "tmdb-ts/dist/types";

const TvShowHomeList: React.FC<QueryList<TV>> = ({ query, name, param }) => {
  const key = kebabCase(name) + "-list";
  const { ref, inViewport } = useInViewport();
  const { data, isPending } = useQuery({
    queryFn: query,
    queryKey: [key],
    enabled: inViewport,
  });

  return (
    <section id={key} className="min-h-[220px] sm:min-h-[260px] md:min-h-[300px]" ref={ref}>
      {isPending ? (
        <div className="flex w-full flex-col gap-3 px-3 sm:gap-4 sm:px-4 md:gap-5 md:px-0">
          <div className="flex grow items-center justify-between">
            <Skeleton className="h-6 w-32 rounded-full sm:h-7 sm:w-40" />
            <Skeleton className="h-4 w-16 rounded-full sm:h-5 sm:w-20" />
          </div>
          <Skeleton className="h-[200px] rounded-xl sm:h-[240px] md:h-[300px]" />
        </div>
      ) : (
        <div className="z-3 flex flex-col gap-2 sm:gap-3">
          <div className="flex grow items-center justify-between px-3 sm:px-4 md:px-0">
            <SectionTitle color="warning">{name}</SectionTitle>
            <Link
              size="sm"
              href={`/discover?type=${param}&content=tv`}
              isBlock
              color="foreground"
              className="rounded-full text-xs font-medium sm:text-sm"
            >
              See All &gt;
            </Link>
          </div>
          <Carousel>
            {data?.results.map((tv) => (
              <div
                key={tv.id}
                className="embla__slide flex min-h-fit max-w-fit items-center px-1.5 py-2 first:pl-3 last:pr-3 sm:px-2 sm:first:pl-4 sm:last:pr-4 md:first:pl-0 md:last:pr-0"
              >
                <TvShowHomeCard tv={tv} />
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </section>
  );
};

export default TvShowHomeList;
