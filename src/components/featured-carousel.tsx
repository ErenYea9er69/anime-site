"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { WatchButton } from "@/components/watch-button";
import { WatchlistButton } from "@/components/watchlist/watchlist-button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Media } from "@/types/anilistGraphQLTypes";


export function FeaturedCarousel({ items }: { items: Media[] }) {

  const filteredItems = items.filter(
    (anime) => anime.bannerImage
  );
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    duration: 30,
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    // Auto-play functionality
    const autoplayInterval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0); // Reset to first slide
      }
    }, 6000); // Change slide every 6 seconds

    return () => {
      clearInterval(autoplayInterval);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative group h-screen">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {filteredItems.map((anime) => (
            <div
              key={anime.id}
              className="relative h-screen min-w-full flex-[0_0_100%]"
            >
              <div className="absolute inset-0">
                <Image
                  src={anime.bannerImage || anime.coverImage?.large || ""}
                  alt={anime.title?.english || anime.title?.romaji || ""}
                  fill
                  className="object-cover brightness-[0.7] transition-all duration-500"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="container relative flex h-full items-center pb-24">
                <div className="max-w-3xl space-y-4 px-4 sm:px-6 lg:px-8">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {anime.genres?.slice(0, 3).map((genre) => (
                        <Badge key={genre} variant="secondary">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                      {anime.title?.english || anime.title?.romaji}
                    </h1>
                  </div>
                  
                  <p className="line-clamp-2 sm:line-clamp-3 text-base sm:text-lg text-muted-foreground">
                    {anime.description?.replace(/<[^>]*>/g, "")}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <WatchButton anime={anime} size="lg" />
                    <WatchlistButton anime={anime} size="lg" variant="secondary" />
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    {anime.episodes && (
                      <div>{anime.episodes} Episodes</div>
                    )}
                    {anime.duration && (
                      <div>{anime.duration} Min/Ep</div>
                    )}
                    {anime.averageScore && (
                      <div>Score: {(anime.averageScore / 10).toFixed(1)}</div>
                    )}
                    {anime.season && anime.seasonYear && (
                      <div>{`${anime.season.charAt(0) + anime.season.slice(1).toLowerCase()} ${anime.seasonYear}`}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute left-2 right-2 sm:left-4 sm:right-4 top-1/2 flex -translate-y-1/2 justify-between z-20">
  <Button
    variant="ghost"
    size="icon"
    className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-background/50 hover:bg-background/70 transition-all duration-200 backdrop-blur-sm"
    onClick={scrollPrev}
    disabled={prevBtnDisabled}
  >
    <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
    <span className="sr-only">Previous slide</span>
  </Button>
  <Button
    variant="ghost"
    size="icon"
    className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-background/50 hover:bg-background/70 transition-all duration-200 backdrop-blur-sm"
    onClick={scrollNext}
    disabled={nextBtnDisabled}
  >
    <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
    <span className="sr-only">Next slide</span>
  </Button>
</div>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2">
        {filteredItems.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-1.5 sm:h-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              selectedIndex === index
                ? "bg-primary w-6 sm:w-8"
                : "w-1.5 sm:w-2 bg-primary/30 hover:bg-primary/50"
            } rounded-full`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}