import { searchFilteredAnimeSlim } from "@/modules/anilist/anilistsAPI";
import { AnimeGrid } from "@/components/anime-grid";
import { getCurrentSeasonInfo } from "@/utils/season";
import { Sparkles } from "lucide-react";

// ISR: cache for 5 minutes, then revalidate in the background
export const revalidate = 300;

export default async function PopularPage() {
  const seasonInfo = getCurrentSeasonInfo();
  const data = await searchFilteredAnimeSlim(
    `type: ANIME, sort: POPULARITY_DESC, season: ${seasonInfo.season}, seasonYear: ${seasonInfo.year}, status: RELEASING`
  );
  const anime = data?.media || [];

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