"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimeCard } from "@/components/anime-card";
import { Media } from "@/types/anilistGraphQLTypes";

interface AnimeSectionProps {
  title: string;
  anime: Media[];
}

export function AnimeSection({ title, anime }: AnimeSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter out duplicates
  const uniqueAnime = (anime || []).reduce((acc: Media[], current) => {
    if (!current?.id) return acc;
    if (!acc.some((item) => item.id === current.id)) {
      acc.push(current);
    }
    return acc;
  }, []);

  const updateScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [uniqueAnime]);

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = direction === "left" ? -container.clientWidth * 0.75 : container.clientWidth * 0.75;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (!uniqueAnime.length) return null;

  return (
    <section className="w-full relative group">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-primary" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            className="h-8 w-8 rounded-full border-white/10 bg-background/50 backdrop-blur-sm transition-all hover:bg-primary/20 hover:border-primary/50 disabled:opacity-30"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            className="h-8 w-8 rounded-full border-white/10 bg-background/50 backdrop-blur-sm transition-all hover:bg-primary/20 hover:border-primary/50 disabled:opacity-30"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="relative flex gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden pb-4 pt-1 scrollbar-hide scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {uniqueAnime.map((item, index) => (
          <div
            key={item.id}
            className="flex-none w-[160px] sm:w-[190px] md:w-[210px] snap-start"
          >
            <AnimeCard anime={item} priority={index < 4} />
          </div>
        ))}
      </div>
    </section>
  );
}
