import { Suspense } from "react";
import { getHomePageDataSlim } from "@/modules/anilist/anilistsAPI";
import { LoadingSpinner } from "@/components/loading-spinner";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { AnimeSection } from "@/components/anime-section";
import { CategoryChips } from "@/components/home/CategoryChips";
import ContinueWatchingSection from "@/components/ContinueWatchingSection";
import PlanToWatchClient from "@/components/home/PlanToWatchClient";
import MangaClient from "@/components/home/MangaClient";
import { getCurrentSeasonInfo } from "@/utils/season";
import { filterSupportedAnime } from "@/utils/animeSupport";

// ISR: cache for 5 minutes, then revalidate in the background
export const revalidate = 300;

async function getData() {
  const seasonInfo = getCurrentSeasonInfo();
  try {
    const rawData = await getHomePageDataSlim(seasonInfo.season, seasonInfo.year);

    return {
      trending: filterSupportedAnime(rawData.trending),
      popular: filterSupportedAnime(rawData.popular),
      topRated: filterSupportedAnime(rawData.topRated),
      movies: filterSupportedAnime(rawData.movies),
      isekai: filterSupportedAnime(rawData.isekai),
      adult: filterSupportedAnime(rawData.adult),
      seasonLabel: seasonInfo.label,
    };
  } catch (error) {
    console.error("Error fetching anime data for home page:", error);
    return {
      trending: [],
      popular: [],
      topRated: [],
      movies: [],
      isekai: [],
      adult: [],
      seasonLabel: seasonInfo.label,
    };
  }
}

export default async function Home() {
  const data = await getData();

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background pointer-events-none" />

      {/* Hero Carousel */}
      <section className="relative w-full">
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedCarousel items={data.trending.slice(0, 10)} />
        </Suspense>
      </section>

      {/* Main Content Sections */}
      <section className="relative z-10 container space-y-12 py-8">
        {/* Quick Category Chips */}
        <CategoryChips />

        {/* User Watchlist / Continue Watching */}
        <Suspense fallback={<LoadingSpinner />}>
          <ContinueWatchingSection />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <PlanToWatchClient />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <MangaClient />
        </Suspense>

        {/* Trending Anime (Increased count) */}
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSection
            title="Trending Now"
            anime={data.trending}
          />
        </Suspense>

        {/* Popular Seasonal Anime */}
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSection
            title={`Popular This Season (${data.seasonLabel})`}
            anime={data.popular}
          />
        </Suspense>

        {/* Top Rated Anime */}
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSection
            title="Top Rated All Time"
            anime={data.topRated}
          />
        </Suspense>

        {/* Feature Films & Anime Movies */}
        {data.movies.length > 0 && (
          <Suspense fallback={<LoadingSpinner />}>
            <AnimeSection
              title="Featured Anime Movies"
              anime={data.movies}
            />
          </Suspense>
        )}

        {/* Isekai & Fantasy Category */}
        {data.isekai.length > 0 && (
          <Suspense fallback={<LoadingSpinner />}>
            <AnimeSection
              title="Popular Isekai & Fantasy"
              anime={data.isekai}
            />
          </Suspense>
        )}

        {/* 18+ Mature & Hentai Anime supported by APIs */}
        {data.adult.length > 0 && (
          <Suspense fallback={<LoadingSpinner />}>
            <AnimeSection
              title="18+ Mature & Hentai Hits"
              anime={data.adult}
            />
          </Suspense>
        )}
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