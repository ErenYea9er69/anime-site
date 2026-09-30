import { Media } from "@/types/anilistGraphQLTypes";

export interface AniZipEpisode {
  tvdbShowId?: number;
  tvdbId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  absoluteEpisodeNumber?: number;
  title?: {
    ja?: string;
    en?: string;
    de?: string;
    fr?: string;
    es?: string;
    "x-jat"?: string;
    [key: string]: string | undefined;
  };
  airDate?: string;
  airDateUtc?: string;
  runtime?: number;
  overview?: string;
  image?: string;
  episode?: string;
  anidbEid?: number;
  rating?: string;
  summary?: string;
}

export interface AniZipMappings {
  animeplanet_id?: string;
  kitsu_id?: number;
  mal_id?: number;
  type?: string;
  anilist_id?: number;
  anisearch_id?: number;
  anidb_id?: number;
  notifymoe_id?: string | null;
  livechart_id?: number;
  thetvdb_id?: number;
  imdb_id?: string;
  themoviedb_id?: string;
}

export interface AniZipData {
  titles?: Record<string, string>;
  mappings?: AniZipMappings;
  episodes?: Record<string, AniZipEpisode>;
  episodeCount?: number;
  specialCount?: number;
}

export interface SkipTimeInterval {
  startTime: number;
  endTime: number;
}

export interface EpisodeSkipTimes {
  op?: SkipTimeInterval;
  ed?: SkipTimeInterval;
  recap?: SkipTimeInterval;
  episodeLength?: number;
}

export interface StreamServer {
  id: string;
  name: string;
  type: "embed" | "hls";
  url: string;
  badge?: string;
  description: string;
}

export interface StreamResolution {
  servers: StreamServer[];
  defaultServerId: string;
  tmdbId?: string;
  imdbId?: string;
  malId?: number;
  seasonNumber: number;
  episodeNumber: number;
  episodeInSeason: number;
  episodeTitle?: string;
  episodeThumbnail?: string;
  episodeOverview?: string;
  isMovie: boolean;
  isAdult: boolean;
}

// In-memory cache for AniZip data
const aniZipCache = new Map<number, AniZipData>();
// In-memory cache for TMDB ID lookups
const tmdbLookupCache = new Map<number, string>();
// In-memory cache for AniSkip skip times
const skipTimesCache = new Map<string, EpisodeSkipTimes>();

/**
 * Fetches episode opening and ending skip times from AniSkip API
 */
export async function getEpisodeSkipTimes(
  malId: number | string,
  episodeNumber: number
): Promise<EpisodeSkipTimes | null> {
  const id = typeof malId === "string" ? parseInt(malId, 10) : malId;
  if (!id || isNaN(id) || episodeNumber < 1) return null;

  const cacheKey = `${id}_${episodeNumber}`;
  if (skipTimesCache.has(cacheKey)) {
    return skipTimesCache.get(cacheKey)!;
  }

  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`aniskip_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored) as EpisodeSkipTimes;
        skipTimesCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.aniskip.com/v2/skip-times/${id}/${episodeNumber}?types=op&types=ed&types=mixed-op&types=mixed-ed&types=recap&episodeLength=0`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.found || !Array.isArray(data.results)) return null;

    const result: EpisodeSkipTimes = {};

    for (const item of data.results) {
      if (!item.interval) continue;
      const interval: SkipTimeInterval = {
        startTime: Number(item.interval.startTime) || 0,
        endTime: Number(item.interval.endTime) || 0,
      };

      if ((item.skipType === "op" || item.skipType === "mixed-op") && !result.op) {
        result.op = interval;
        if (item.episodeLength) result.episodeLength = item.episodeLength;
      } else if ((item.skipType === "ed" || item.skipType === "mixed-ed") && !result.ed) {
        result.ed = interval;
        if (item.episodeLength && !result.episodeLength) result.episodeLength = item.episodeLength;
      } else if (item.skipType === "recap" && !result.recap) {
        result.recap = interval;
      }
    }

    skipTimesCache.set(cacheKey, result);

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`aniskip_${cacheKey}`, JSON.stringify(result));
      } catch {
        // ignore
      }
    }

    return result;
  } catch (error) {
    console.warn("AniSkip fetch skipped or timed out:", error);
    return null;
  }
}

/**
 * Fetches cross-database mappings and episode metadata from AniZip (free community database)
 */
export async function getAniZipData(anilistId: number | string): Promise<AniZipData | null> {
  const id = typeof anilistId === "string" ? parseInt(anilistId, 10) : anilistId;
  if (!id || isNaN(id)) return null;

  if (aniZipCache.has(id)) {
    return aniZipCache.get(id)!;
  }

  // Check sessionStorage if in browser
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`anizip_${id}`);
      if (stored) {
        const parsed = JSON.parse(stored) as AniZipData;
        aniZipCache.set(id, parsed);
        return parsed;
      }
    } catch {
      // ignore storage errors
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`https://api.ani.zip/mappings?anilist_id=${id}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = (await response.json()) as AniZipData;
    aniZipCache.set(id, data);

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`anizip_${id}`, JSON.stringify(data));
      } catch {
        // ignore
      }
    }

    return data;
  } catch (error) {
    console.warn("AniZip mapping request skipped or timed out:", error);
    return null;
  }
}

/**
 * Resolves TMDB ID via internal lookup API if AniZip lacks the mapping
 */
async function lookupTmdbId(
  animeId: number,
  title: string,
  isMovie: boolean
): Promise<{ tmdbId: string | null; isMovieFallback?: boolean }> {
  if (tmdbLookupCache.has(animeId)) {
    return { tmdbId: tmdbLookupCache.get(animeId)! };
  }

  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`tmdb_id_${animeId}`);
      if (stored) {
        tmdbLookupCache.set(animeId, stored);
        return { tmdbId: stored };
      }
    } catch {
      // ignore
    }
  }

  try {
    const url = `/api/tmdb-lookup?id=${animeId}&title=${encodeURIComponent(title)}&type=${isMovie ? "movie" : "tv"}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return { tmdbId: null };

    const data = await res.json();
    if (data?.tmdbId) {
      const idStr = String(data.tmdbId);
      tmdbLookupCache.set(animeId, idStr);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`tmdb_id_${animeId}`, idStr);
        } catch {
          // ignore
        }
      }
      return { tmdbId: idStr, isMovieFallback: Boolean(data.isMovie) };
    }
  } catch (error) {
    console.warn("Internal TMDB lookup skipped:", error);
  }

  return { tmdbId: null };
}

/**
 * Resolves streaming servers for a given anime and episode
 * Guarantees working embedded HTML5 players without external redirects
 */
export async function resolveStreamServers(
  animeId: number,
  episodeNumber: number,
  media?: Media
): Promise<StreamResolution> {
  const aniZip = await getAniZipData(animeId);
  const mappings = aniZip?.mappings;
  let isMovie = media?.format === "MOVIE" || (media?.episodes === 1 && !media?.format?.includes("TV"));

  const isAdult = Boolean(
    media?.isAdult ||
    media?.genres?.some((g) => g.toLowerCase() === "hentai") ||
    mappings?.type?.toUpperCase() === "HENTAI"
  );

  let tmdbId = mappings?.themoviedb_id;
  const imdbId = mappings?.imdb_id;
  const malId = media?.idMal || mappings?.mal_id;

  const cleanTitle = (
    media?.title?.english ||
    media?.title?.romaji ||
    media?.title?.userPreferred ||
    ""
  ).replace(/[^\w\s-]/gi, " ").trim();

  // If TMDB ID is missing from AniZip (frequent for adult/OVA/ONA titles), resolve via TMDB lookup
  if (!tmdbId && cleanTitle) {
    const lookup = await lookupTmdbId(animeId, cleanTitle, isMovie);
    if (lookup.tmdbId) {
      tmdbId = lookup.tmdbId;
      if (lookup.isMovieFallback) isMovie = true;
    }
  }

  const epKey = episodeNumber.toString();
  const epData = aniZip?.episodes?.[epKey];

  const seasonNumber = epData?.seasonNumber ?? 1;
  const episodeInSeason = epData?.episodeNumber ?? episodeNumber;
  const episodeTitle = epData?.title?.en || epData?.title?.["x-jat"] || epData?.title?.ja;
  const episodeThumbnail = epData?.image;
  const episodeOverview = epData?.overview || epData?.summary;

  const servers: StreamServer[] = [];

  // Server 1: VidLink HD (Fast, Full HD player, sub/dub options)
  if (tmdbId) {
    const vidlinkUrl = isMovie
      ? `https://vidlink.pro/movie/${tmdbId}?primaryColor=6366f1&secondaryColor=18181b&icons=vid&nextbutton=true`
      : `https://vidlink.pro/tv/${tmdbId}/${seasonNumber}/${episodeInSeason}?primaryColor=6366f1&secondaryColor=18181b&icons=vid&nextbutton=true`;

    servers.push({
      id: "vidlink",
      name: "VidLink HD",
      type: "embed",
      url: vidlinkUrl,
      badge: "Recommended",
      description: "Fast 1080p, Auto-Next, Sub & Dub Support",
    });
  } else if (malId) {
    servers.push({
      id: "vidlink",
      name: "VidLink HD",
      type: "embed",
      url: `https://vidlink.pro/anime/${malId}/${episodeNumber}/sub?fallback=true&primaryColor=6366f1&icons=vid&nextbutton=true`,
      badge: "Recommended",
      description: "Fast 1080p Anime Player",
    });
  }

  // Server 2: VidSrc Pro (High availability node)
  if (tmdbId) {
    const vidsrcPmUrl = isMovie
      ? `https://vidsrc.pm/embed/movie/${tmdbId}`
      : `https://vidsrc.pm/embed/tv/${tmdbId}/${seasonNumber}/${episodeInSeason}`;

    servers.push({
      id: "vidsrc_pm",
      name: "VidSrc Pro",
      type: "embed",
      url: vidsrcPmUrl,
      badge: "Fast",
      description: "High-speed backup server",
    });
  }

  // Server 3: VidSrc Classic
  if (tmdbId) {
    const vidsrcMeUrl = isMovie
      ? `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`
      : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${seasonNumber}&episode=${episodeInSeason}`;

    servers.push({
      id: "vidsrc_me",
      name: "VidSrc Classic",
      type: "embed",
      url: vidsrcMeUrl,
      badge: "HD",
      description: "Stable multi-source server",
    });
  }

  // Server 4: AutoEmbed
  if (imdbId || tmdbId) {
    const identifier = imdbId || tmdbId;
    const isImdb = Boolean(imdbId);
    const autoEmbedUrl = isMovie
      ? `https://autoembed.co/movie/${isImdb ? "imdb" : "tmdb"}/${identifier}`
      : `https://autoembed.co/tv/${isImdb ? "imdb" : "tmdb"}/${identifier}${isImdb ? `-${seasonNumber}-${episodeInSeason}` : `/${seasonNumber}/${episodeInSeason}`}`;

    servers.push({
      id: "autoembed",
      name: "AutoEmbed",
      type: "embed",
      url: autoEmbedUrl,
      badge: "Multi",
      description: "Multiple mirrors & alternate audio",
    });
  }

  // Server 5: MultiEmbed (Alternative player)
  if (tmdbId) {
    const multiEmbedUrl = isMovie
      ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`
      : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${seasonNumber}&e=${episodeInSeason}`;

    servers.push({
      id: "multiembed",
      name: "MultiEmbed",
      type: "embed",
      url: multiEmbedUrl,
      badge: "Mirror",
      description: "Alternative multi-mirror player",
    });
  }

  // Server 6: AniStream Direct (Fallback by AniList ID)
  servers.push({
    id: "vidsrc_cc",
    name: "AniStream",
    type: "embed",
    url: `https://vidsrc.cc/v2/embed/anime/${animeId}/${episodeNumber}`,
    badge: "Direct",
    description: "Direct AniList ID player",
  });

  return {
    servers,
    defaultServerId: servers[0]?.id || "vidlink",
    tmdbId,
    imdbId,
    malId,
    seasonNumber,
    episodeNumber,
    episodeInSeason,
    episodeTitle,
    episodeThumbnail,
    episodeOverview,
    isMovie,
    isAdult,
  };
}
