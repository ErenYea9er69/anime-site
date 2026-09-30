import { Media } from "@/types/anilistGraphQLTypes";

/**
 * Checks whether an anime has valid streaming API support.
 * Deletes/filters out anime that do NOT have API support:
 * 1. Unreleased anime (status: NOT_YET_RELEASED) - no episodes or streams exist on any API
 * 2. Cancelled anime (status: CANCELLED)
 * 3. Music singles / music videos (format: MUSIC) - no episodes on streaming providers
 * 4. Finished anime with 0 episodes
 * 5. Corrupted items without ID or titles
 */
export function hasStreamApiSupport(anime?: Partial<Media> | null): boolean {
  if (!anime || !anime.id) return false;

  // Unreleased titles cannot be played on any API
  if (anime.status === "NOT_YET_RELEASED" || anime.status === "CANCELLED") {
    return false;
  }

  // Pure music singles / videos are not anime series/films and have no streaming servers
  if (anime.format === "MUSIC") {
    return false;
  }

  // Finished anime with 0 episodes cannot be streamed
  if (anime.status === "FINISHED" && anime.episodes === 0) {
    return false;
  }

  // Must have a recognizable title
  const hasTitle = Boolean(
    anime.title?.english ||
    anime.title?.romaji ||
    anime.title?.userPreferred
  );
  if (!hasTitle) return false;

  return true;
}

/**
 * Filters a list of anime to only retain those with active streaming API support.
 */
export function filterSupportedAnime<T extends Partial<Media>>(animeList?: T[] | null): T[] {
  if (!animeList || !Array.isArray(animeList)) return [];
  return animeList.filter(hasStreamApiSupport);
}
