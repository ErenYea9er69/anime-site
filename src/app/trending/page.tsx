"use client";

import { useEffect, useState } from "react";
import { getTrendingAnime } from "@/modules/anilist/anilistsAPI";
import { Media } from "@/types/anilistGraphQLTypes";
import { AnimeGrid } from "@/components/anime-grid";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
        setAnime(data.media.slice(0, 40));
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
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchTrending} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Trending Now</h1>
      <AnimeGrid anime={anime} />
    </div>
  );
}