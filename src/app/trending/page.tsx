"use client";

import { useEffect, useState } from "react";
import { getTrendingAnime } from "@/modules/anilist/anilistsAPI";
import { Media } from "@/types/anilistGraphQLTypes";
import { AnimeGrid } from "@/components/anime-grid";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Flame } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function TrendingPage() {
  const [anime, setAnime] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getTrendingAnime(null);
      if (data?.media) {
        setAnime(data.media.slice(0, 48));
      }
    } catch (err) {
      console.error("Failed to fetch trending anime:", err);
      setError("Failed to load trending anime");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

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
        <Button onClick={fetchTrending} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm mb-1">
            <Flame className="h-4 w-4" />
            <span>Top Charts</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Trending Now
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Updated continuously based on global viewer ratings and popularity
        </p>
      </div>

      <AnimeGrid anime={anime} />
    </div>
  );
}