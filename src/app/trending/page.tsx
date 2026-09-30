import { getTrendingAnimeSlim } from "@/modules/anilist/anilistsAPI";
import { AnimeGrid } from "@/components/anime-grid";
import { filterSupportedAnime } from "@/utils/animeSupport";
import { Flame } from "lucide-react";

// ISR: cache for 5 minutes, then revalidate in the background
export const revalidate = 300;

export default async function TrendingPage() {
  const data = await getTrendingAnimeSlim(50);
  const anime = filterSupportedAnime(data?.media || []);

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
          Streamable top trending anime, updated continuously based on global viewer ratings
        </p>
      </div>

      <AnimeGrid anime={anime} />
    </div>
  );
}