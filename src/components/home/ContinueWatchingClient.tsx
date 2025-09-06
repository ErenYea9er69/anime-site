"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import GetMedia from "@/lib/anilist/getMedia";
import { motion } from "framer-motion";

interface CurrentMediaTypes {
  status: string;
  entries: {
    media: {
      id: number;
      title: {
        userPreferred: string;
      };
      coverImage: {
        large: string;
      };
      episodes: number;
      nextAiringEpisode: {
        episode: number;
      } | null;
    };
  }[];
}

interface AnimeEntry {
  media: {
    id: number;
    title: {
      userPreferred: string;
      english: string;
      romaji: string;
    };
    coverImage: {
      large: string;
    };
    episodes: number;
    nextAiringEpisode: {
      episode: number;
    } | null;
    description: string;
    progress?: number;
  };
}

interface WatchListEpisode {
  id: string;
  aniId?: string;
  title?: string;
  aniTitle?: string;
  image?: string;
  episode?: number;
  timeWatched?: number;
  duration?: number;
  provider?: string;
  nextId?: string;
  nextNumber?: number;
  dub?: boolean;
  createdDate: string;
  userProfileId: string;
  watchId: string;
}

interface MangaEntry {
  media: {
    id: number;
    title: {
      userPreferred: string;
      english: string;
      romaji: string;
    };
    coverImage: {
      large: string;
    };
    chapters: number;
    nextAiringChapter: {
      chapter: number;
    } | null;
    description: string;
    progress?: number;
  };
}

export default function ContinueWatchingClient() {
  const { data: sessions }: any = useSession();
  const [currentlyWatching, setCurrentlyWatching] = useState<any[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { anime: currentAnime } = GetMedia(sessions, {
    stats: "CURRENT",
  });

  useEffect(() => {
    if (currentAnime && currentAnime.length > 0) {
      const watching = currentAnime
        .find((item: CurrentMediaTypes) => item.status === "CURRENT")
        ?.entries.map(({ media }) => media)
        .filter((media) => media) || [];
      setCurrentlyWatching(watching);
    }
  }, [currentAnime]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = direction === 'left' ? -800 : 800;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!currentlyWatching.length) return null;

  return (
    <section className="w-full mx-auto relative group">
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Continue Watching</h2>
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
        <div className="flex gap-4">
          {currentlyWatching.map((anime) => (
            <Link 
              key={anime.id} 
              href={`/anime/${anime.id}`}
              className="flex-none w-[200px] transition-transform hover:scale-[1.02]"
            >
              <Card className="h-full overflow-hidden">
                <div className="aspect-[3/4] relative">
                <Image
                  src={anime.coverImage.large}
                  alt={`Cover image for ${anime.title.userPreferred || anime.title.english || anime.title.romaji}`}
                  fill
                  className="object-cover z-10"
                  sizes="(max-width: 768px) 200px, 240px"
                  quality={85}
                />
                </div>
                <CardContent className="p-4">
                <h2 className="font-karla font-bold text-lg line-clamp-2">
                  {anime.title.userPreferred || anime.title.english || anime.title.romaji}
                </h2>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
