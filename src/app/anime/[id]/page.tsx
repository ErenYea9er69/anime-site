"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { getAnimeInfo } from "@/modules/anilist/anilistsAPI";
import { Media, AiringSchedule } from "@/types/anilistGraphQLTypes";
import { AnimeTabs } from "../../../components/anime-tabs";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Suspense } from "react";
import { AnimeDetails } from "@/components/anime-details";
import { EpisodeList } from "@/components/episode-list";
import { Anime } from "@/lib/anilist";
import { Separator } from "@/components/ui/separator";

export default function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [anime, setAnime] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [releasedEpisodes, setReleasedEpisodes] = useState<number>(0);

  useEffect(() => {
    async function fetchAnimeData() {
      try {
        const data = await getAnimeInfo(parseInt(resolvedParams.id));
        setAnime(data);
        // console.log('Relations:', data.relations?.edges?.length);
        // console.log('Recommendations:', data.recommendations?.nodes?.length);
        
        
        // Calculate released episodes
        const totalEpisodes = data.episodes || 0;
        const nextAiring = data.nextAiringEpisode;
        
        if (nextAiring && nextAiring.timeUntilAiring > 0) {
          setReleasedEpisodes(nextAiring.episode - 1);
        } else {
          setReleasedEpisodes(totalEpisodes);
        }
        
      } catch (error) {
        console.error("Failed to fetch anime:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnimeData();
  }, [resolvedParams.id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!anime || anime.id === undefined) {
    return <div>Anime not found</div>;
  }

  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <AnimeDetails anime={anime as Anime} />
      </Suspense>
      <div className="container space-y-8 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <EpisodeList 
            episodes={releasedEpisodes} 
            animeId={anime.id} 
            coverImage={anime.coverImage?.large ?? ''}
            bannerImage={anime.bannerImage ?? ''}
          />
        </Suspense>
        
        <Separator className="my-8" />
        
        <AnimeTabs anime={anime} />
      </div>
    </div>
  );
}
