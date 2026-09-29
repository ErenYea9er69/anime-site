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
}

// In-memory cache for AniZip data
const aniZipCache = new Map<number, AniZipData>();

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
 * Resolves streaming servers for a given anime and episode
 */
export async function resolveStreamServers(
  animeId: number,
  episodeNumber: number,
  media?: Media
): Promise<StreamResolution> {
  const aniZip = await getAniZipData(animeId);
  const mappings = aniZip?.mappings;
  const isMovie = media?.format === "MOVIE" || (media?.episodes === 1 && !media?.format?.includes("TV"));

  const tmdbId = mappings?.themoviedb_id;
  const imdbId = mappings?.imdb_id;
  const malId = media?.idMal || mappings?.mal_id;

  const epKey = episodeNumber.toString();
  const epData = aniZip?.episodes?.[epKey];

  const seasonNumber = epData?.seasonNumber ?? 1;
  const episodeInSeason = epData?.episodeNumber ?? episodeNumber;
  const episodeTitle = epData?.title?.en || epData?.title?.["x-jat"] || epData?.title?.ja;
  const episodeThumbnail = epData?.image;
  const episodeOverview = epData?.overview || epData?.summary;

  const servers: StreamServer[] = [];

  // Primary: VidLink (Rich responsive player, high uptime, theme customizable)
  if (tmdbId) {
    const vidlinkUrl = isMovie
      ? `https://vidlink.pro/movie/${tmdbId}?primaryColor=6366f1&secondaryColor=18181b&icons=vid`
      : `https://vidlink.pro/tv/${tmdbId}/${seasonNumber}/${episodeInSeason}?primaryColor=6366f1&secondaryColor=18181b&icons=vid`;

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
      url: `https://vidlink.pro/anime/${malId}/${episodeNumber}/sub?fallback=true&primaryColor=6366f1`,
      badge: "Recommended",
      description: "Fast 1080p Anime Player",
    });
  }

  // Backup 1: VidSrc Pro (VidSrc.pm node)
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

  // Backup 2: VidSrc Classic (VidSrc.me node)
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

  // Backup 3: AutoEmbed
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

  // Fallback: Direct VidSrc Anime endpoint by AniList ID
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
  };
}
