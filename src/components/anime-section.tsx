"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimeGrid } from "@/components/anime-grid";
import { Media } from "@/types/anilistGraphQLTypes";
import { ListAnimeData } from '../types/anilistAPITypes';
import { ListsProvider, useLists } from '@/context/ListsContext';
interface AnimeSectionProps {
  title: string;
  anime: Media[];
  animeData: (lists: ListAnimeData[]) => void;
  
}

export function AnimeSection({ title, anime }: AnimeSectionProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = direction === 'left' ? -800 : 800;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <ListsProvider>
    <section className="w-full mx-auto relative group">
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll('left')}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll('right')}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
      <div 
        ref={scrollContainerRef}
        className="relative overflow-x-auto overflow-y-hidden"
      >
        <AnimeGrid anime={anime} />
      </div>
    </section>
    </ListsProvider>
  );
}
