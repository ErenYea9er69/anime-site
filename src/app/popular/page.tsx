"use client";

import { useState, useEffect } from "react";
import { searchFilteredAnime } from "@/modules/anilist/anilistsAPI";
import { AnimeGrid } from "@/components/anime-grid";
import { LoadingSpinner } from "@/components/loading-spinner";
import type { Media } from "@/types/anilistGraphQLTypes";
import { getCurrentSeasonInfo } from "@/utils/season";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default function PopularPage() {
  const [anime, setAnime] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seasonInfo = getCurrentSeasonInfo();

  useEffect(() => {
    async function fetchPopular() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await searchFilteredAnime(
          `type: ANIME, sort: POPULARITY_DESC, season: ${seasonInfo.season}, seasonYear: ${seasonInfo.year}, status: RELEASING`,
          null
        );
        
        if (data?.media) {
          setAnime(data.media);
        }
      } catch (err) {
        setError("Failed to load popular anime");
        console.error("Error fetching popular anime:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPopular();
  }, [seasonInfo.season, seasonInfo.year]);

  if (isLoading) {
    return (
      <div className="container py-24 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16 text-center space-y-4">
        <p className="text-destructive font-medium">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Seasonal Highlights</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Popular This Season
          </h1>
        </div>
        <span className="self-start sm:self-auto px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20">
          {seasonInfo.label}
        </span>
      </div>

      <AnimeGrid anime={anime} />
    </div>
  );
}