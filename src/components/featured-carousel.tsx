"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { WatchButton } from "@/components/watch-button";
import { WatchlistButton } from "@/components/watchlist/watchlist-button";
import { ChevronLeft, ChevronRight, Star, Calendar, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Media } from "@/types/anilistGraphQLTypes";

export function FeaturedCarousel({ items }: { items: Media[] }) {
  // Use bannerImage or coverImage as fallback
  const validItems = (items || []).filter(
    (anime) => anime && (anime.bannerImage || anime.coverImage?.extraLarge || anime.coverImage?.large)
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 35,
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    const autoplayInterval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 7000);

    return () => {
      clearInterval(autoplayInterval);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!validItems.length) return null;

  return (
    <div className="relative group w-full h-[62vh] min-h-[460px] max-h-[680px] sm:h-[72vh] overflow-hidden bg-background">
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {validItems.map((anime, index) => {
            const title = anime.title?.english || anime.title?.romaji || anime.title?.userPreferred || "Featured Anime";
            const backdropImg = anime.bannerImage || anime.coverImage?.extraLarge || anime.coverImage?.large || "";
            const cleanDesc = anime.description ? anime.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
            const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;

            return (
              <div
                key={anime.id}
                className="relative h-full min-w-full flex-[0_0_100%] overflow-hidden"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={backdropImg}
                    alt={title}
                    fill
                    className="object-cover object-center brightness-[0.55] transition-transform duration-700 ease-out"
                    priority={index === 0}
                    sizes="100vw"
                  />
                </div>

                {/* Multi-layer Gradient for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

                {/* Content Container */}
                <div className="container relative h-full flex flex-col justify-end pb-12 sm:pb-16 pt-20">
                  <div className="max-w-2xl space-y-4">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {anime.format && (
                        <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-primary text-primary-foreground shadow-sm">
                          {anime.format.replace("_", " ")}
                        </span>
                      )}
                      {score && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-md bg-black/60 backdrop-blur-md text-amber-400 border border-amber-500/20">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {score}
                        </span>
                      )}
                      {anime.genres?.slice(0, 3).map((genre) => (
                        <Badge key={genre} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border-0 text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>

                    {/* Headline Title */}
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                      {title}
                    </h1>

                    {/* Description */}
                    {cleanDesc && (
                      <p className="line-clamp-2 sm:line-clamp-3 text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
                        {cleanDesc}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <WatchButton anime={anime} size="lg" />
                      <WatchlistButton anime={anime} size="lg" variant="secondary" />
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-400 pt-1">
                      {anime.episodes && (
                        <span className="flex items-center gap-1">
                          <Film className="h-3.5 w-3.5 text-primary" />
                          {anime.episodes} Episodes
                        </span>
                      )}
                      {anime.season && anime.seasonYear && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {`${anime.season.charAt(0) + anime.season.slice(1).toLowerCase()} ${anime.seasonYear}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prev / Next Controls */}
      <div className="hidden sm:flex absolute right-6 bottom-10 z-20 gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-white/15 bg-black/40 backdrop-blur-md text-white hover:bg-white/20 transition-all shadow-lg"
          onClick={scrollPrev}
          aria-label="Previous featured anime"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-white/15 bg-black/40 backdrop-blur-md text-white hover:bg-white/20 transition-all shadow-lg"
          onClick={scrollNext}
          aria-label="Next featured anime"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Slide Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {validItems.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              selectedIndex === index
                ? "bg-primary w-8 h-2"
                : "bg-white/30 hover:bg-white/60 w-2 h-2"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}