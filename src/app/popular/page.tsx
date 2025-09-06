"use client";

import { useState, useEffect } from "react";
import { searchFilteredAnime } from "@/modules/anilist/anilistsAPI";
import { AnimeGrid } from "@/components/anime-grid";
import { LoadingSpinner } from "@/components/loading-spinner";
import type { Media } from "@/types/anilistGraphQLTypes";

export const dynamic = 'force-dynamic';

export default function PopularPage() {
  const [anime, setAnime] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPopular() {
      try {
        setIsLoading(true);
        const data = await searchFilteredAnime(
          "type: ANIME, sort: POPULARITY_DESC, season: FALL, seasonYear: 2024, status: RELEASING",
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
  }, []);

  if (isLoading) {
    return (
      <div className="container py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-2">{error}</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Popular This Season</h1>
      </div>
      <AnimeGrid anime={anime} />
    </div>
  );
}