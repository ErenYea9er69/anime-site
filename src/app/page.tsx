import { Suspense } from "react";
import { 
  getTrendingAnimeSlim, 
  getMostPopularAnimeSlim,
  searchFilteredAnimeSlim 
} from "@/modules/anilist/anilistsAPI";
import { LoadingSpinner } from "@/components/loading-spinner";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { AnimeSection } from "@/components/anime-section";
import ContinueWatchingSection from "@/components/ContinueWatchingSection";
import PlanToWatchClient from "@/components/home/PlanToWatchClient";
import MangaClient from "@/components/home/MangaClient";


import { getCurrentSeasonInfo } from "@/utils/season";

// ISR: cache for 5 minutes, then revalidate in the background
export const revalidate = 300;

async function getData() {
  const seasonInfo = getCurrentSeasonInfo();
  try {
    const [trending, popular, topRated] = await Promise.all([
      getTrendingAnimeSlim(),
      searchFilteredAnimeSlim(`type: ANIME, sort: POPULARITY_DESC, season: ${seasonInfo.season}, seasonYear: ${seasonInfo.year}, status: RELEASING`),
      getMostPopularAnimeSlim()
    ]);

    return {
      trending: trending?.media || [],
      popular: popular?.media || [],
      topRated: topRated?.media || [],
      seasonLabel: seasonInfo.label,
    };
  } catch (error) {
    console.error("Error fetching anime data:", error);
    return {
      trending: [],
      popular: [],
      topRated: [],
      seasonLabel: seasonInfo.label,
    };
  }
}


export default async function Home() {
  const data = await getData();

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background pointer-events-none" />
      
      <section className="relative w-full">
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedCarousel items={data.trending.slice(0, 8)} />
        </Suspense>
      </section>

      <section className="relative z-10 container space-y-12 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <ContinueWatchingSection />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <PlanToWatchClient />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <MangaClient />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSection 
            title="Trending Now" 
            anime={data.trending} 
          />
        </Suspense>
  
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSection 
            title="Popular This Season" 
            anime={data.popular} 
          />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSection 
            title="Top Rated" 
            anime={data.topRated} 
          />
        </Suspense>
      </section>
    </div>
  );
}

export interface CurrentMediaTypes {
  status?: string;
  name: string;
  entries: Entry[];
}

export interface Entry {
  id: number;
  mediaId: number;
  status: string;
  progress: number;
  score: number;
  media: Media;
}

export interface Media {
  id: number;
  status: string;
  nextAiringEpisode: any;
  title: Title;
  episodes: number;
  coverImage: CoverImage;
}

export interface Title {
  english: string;
  romaji: string;
}

export interface CoverImage {
  large: string;
}

export interface UserDataType {
  id: string;
  name: string;
  setting: Setting;
  WatchListEpisode: WatchListEpisode[];
}

export interface Setting {
  CustomLists: boolean;
}

export interface WatchListEpisode {
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