"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getAnimeInfo } from "@/modules/anilist/anilistsAPI";
import { Media } from "@/types/anilistGraphQLTypes";
import { AnimeTabs } from "@/components/anime-tabs";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Suspense } from "react";
import { AnimeDetails } from "@/components/anime-details";
import { EpisodeList } from "@/components/episode-list";
import { Anime } from "@/lib/anilist";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";

export default function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [anime, setAnime] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [releasedEpisodes, setReleasedEpisodes] = useState<number>(0);

  useEffect(() => {
    async function fetchAnimeData() {
      try {
        const id = parseInt(resolvedParams.id);
        if (isNaN(id)) return;
        const data = await getAnimeInfo(id);
        setAnime(data);

        // Calculate released episodes
        const totalEpisodes = data?.episodes || 0;
        const nextAiring = data?.nextAiringEpisode;

        if (nextAiring && nextAiring.timeUntilAiring > 0) {
          setReleasedEpisodes(nextAiring.episode - 1);
        } else {
          setReleasedEpisodes(totalEpisodes);
        }
      } catch (error) {
        console.error("Failed to fetch anime details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnimeData();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!anime || anime.id === undefined) {
    return (
      <div className="container py-24 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Search className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">Anime Not Found</h2>
        <p className="text-muted-foreground max-w-md text-sm">
          We couldn't retrieve information for this anime ID. It may have been removed or the ID is invalid.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Button asChild variant="default">
            <Link href="/search">
              <Search className="h-4 w-4 mr-2" />
              Browse Anime
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Suspense fallback={<LoadingSpinner />}>
        <AnimeDetails anime={anime as Anime} />
      </Suspense>

      <div className="container space-y-8 py-6">
        <Suspense fallback={<LoadingSpinner />}>
          <EpisodeList
            episodes={releasedEpisodes}
            animeId={anime.id}
            coverImage={anime.coverImage?.large ?? ""}
            bannerImage={anime.bannerImage ?? ""}
          />
        </Suspense>

        <Separator className="my-8 border-white/10" />

        <AnimeTabs anime={anime} />
      </div>
    </div>
  );
}
