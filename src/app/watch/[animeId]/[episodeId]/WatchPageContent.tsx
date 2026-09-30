"use client";

import { useEffect, useState, useRef } from "react";
import { VideoPlayer } from "@/components/video-player";
import { Badge } from "@/components/ui/badge";
import { WatchlistButton } from "@/components/watchlist/watchlist-button";
import { Media } from "@/types/anilistGraphQLTypes";
import { Card } from "@/components/ui/card";
import {
  Share2,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ListVideo,
  Clock,
  Tv,
  Star,
  Search,
  PlayCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAniZipData, AniZipData, AniZipEpisode } from "@/services/streaming";
import { NextEpisodeInfo } from "@/components/video-player";

interface WatchPageContentProps {
  anime: Media;
  animeId: string;
  episodeId: string;
  episodeNumber: number;
}

export function WatchPageContent({
  anime,
  animeId,
  episodeId,
  episodeNumber,
}: WatchPageContentProps) {
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [episodeSearch, setEpisodeSearch] = useState("");
  const [aniZipData, setAniZipData] = useState<AniZipData | null>(null);
  const activeEpisodeRef = useRef<HTMLAnchorElement>(null);

  const router = useRouter();
  const title = anime.title?.english || anime.title?.romaji || anime.title?.userPreferred || "Anime Episode";
  const totalEpisodes = anime.episodes || 1;
  const hasPrev = episodeNumber > 1;
  const hasNext = episodeNumber < totalEpisodes;

  const nextEpNumber = episodeNumber + 1;
  const nextEpData: AniZipEpisode | undefined = aniZipData?.episodes?.[nextEpNumber.toString()];
  const nextEpInfo: NextEpisodeInfo | null = hasNext
    ? {
        episodeNumber: nextEpNumber,
        title: nextEpData?.title?.en || nextEpData?.title?.["x-jat"] || `Episode ${nextEpNumber}`,
        thumbnail: nextEpData?.image || anime.bannerImage || anime.coverImage?.large,
        overview: nextEpData?.overview || nextEpData?.summary,
      }
    : null;

  const handleNextEpisode = () => {
    if (hasNext) {
      router.push(`/watch/${animeId}/${nextEpNumber}`);
    }
  };

  const handlePrevEpisode = () => {
    if (hasPrev) {
      router.push(`/watch/${animeId}/${episodeNumber - 1}`);
    }
  };

  // Load AniZip cross-database episode metadata
  useEffect(() => {
    let isMounted = true;
    getAniZipData(animeId).then((data) => {
      if (isMounted && data) {
        setAniZipData(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [animeId]);

  const currentEpData: AniZipEpisode | undefined = aniZipData?.episodes?.[episodeNumber.toString()];
  const currentEpTitle = currentEpData?.title?.en || currentEpData?.title?.["x-jat"] || null;

  // Set document title
  useEffect(() => {
    const epLabel = currentEpTitle ? `Ep ${episodeNumber} - ${currentEpTitle}` : `Episode ${episodeNumber}`;
    document.title = `${title} | ${epLabel} - Monu`;
  }, [title, episodeNumber, currentEpTitle]);

  // Auto-scroll episode list to current active episode
  useEffect(() => {
    if (activeEpisodeRef.current) {
      activeEpisodeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [episodeNumber]);

  // Media session metadata
  useEffect(() => {
    const mediaSession = navigator.mediaSession;
    if (!mediaSession) return;

    const artwork = (currentEpData?.image || anime.bannerImage)
      ? [{ src: currentEpData?.image || anime.bannerImage!, sizes: "512x512", type: "image/jpeg" }]
      : undefined;

    mediaSession.metadata = new MediaMetadata({
      title: currentEpTitle ? `${title} - ${currentEpTitle}` : title,
      artist: `Episode ${episodeNumber}`,
      artwork,
    });
  }, [anime, title, episodeNumber, currentEpTitle, currentEpData]);

  const handleShare = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `Watch ${title} - Episode ${episodeNumber}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        toast.error("Failed to copy link");
      }
    }
  };

  // Filter episodes based on user search (searches episode number or title)
  const allEpisodes = Array.from({ length: totalEpisodes }, (_, i) => i + 1);
  const filteredEpisodes = episodeSearch.trim()
    ? allEpisodes.filter((ep) => {
        const query = episodeSearch.trim().toLowerCase();
        if (ep.toString().includes(query)) return true;
        const epMeta = aniZipData?.episodes?.[ep.toString()];
        const epName = epMeta?.title?.en || epMeta?.title?.["x-jat"] || "";
        return epName.toLowerCase().includes(query);
      })
    : allEpisodes;

  return (
    <div className={`transition-all duration-300 ${isTheaterMode ? "max-w-full" : "max-w-7xl"} mx-auto space-y-6`}>
      {/* Video Player Section */}
      <div className="relative rounded-xl overflow-hidden bg-black/60 shadow-2xl">
        <VideoPlayer
          animeId={animeId}
          episodeId={episodeId}
          title={title}
          episodeNumber={episodeNumber}
          totalEpisodes={totalEpisodes}
          listAnimeData={{
            id: null,
            mediaId: null,
            progress: undefined,
            media: anime,
          }}
          nextEpisode={nextEpInfo}
          onNextEpisode={handleNextEpisode}
          onPrevEpisode={handlePrevEpisode}
        />

        {/* Quick Nav & Controls Beneath Player */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card/80 border-t border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Link
              href={`/anime/${animeId}`}
              className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Back to Anime Details</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {hasPrev && (
              <Button asChild variant="outline" size="sm" className="h-8 text-xs border-white/10">
                <Link href={`/watch/${animeId}/${episodeNumber - 1}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev Ep
                </Link>
              </Button>
            )}

            <span className="text-xs font-semibold px-2 text-foreground">
              Ep {episodeNumber} of {totalEpisodes}
            </span>

            {hasNext && (
              <Button asChild variant="outline" size="sm" className="h-8 text-xs border-white/10">
                <Link href={`/watch/${animeId}/${episodeNumber + 1}`}>
                  Next Ep
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className="h-8 px-2 text-xs border-white/10 hidden md:flex items-center gap-1"
              aria-label="Toggle theater mode"
            >
              {isTheaterMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span>{isTheaterMode ? "Standard" : "Theater"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Anime Info & Episode Selection Grid */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left Column: Details */}
        <Card className="p-6 space-y-5 bg-card/50 border-white/10 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {anime.format || "TV"} Series
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs text-muted-foreground font-medium">
                  Episode {episodeNumber}
                </span>
                {currentEpData?.seasonNumber && currentEpData.seasonNumber > 1 && (
                  <>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-xs text-primary font-medium">
                      Season {currentEpData.seasonNumber}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {title}
              </h1>
              {currentEpTitle && (
                <p className="text-sm font-semibold text-primary/90 pt-0.5">
                  Ep {episodeNumber}: {currentEpTitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 self-start shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-8 text-xs border-white/10 hover:bg-white/10"
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {anime.genres?.map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="bg-white/5 hover:bg-white/10 border-white/10 text-xs"
              >
                {genre}
              </Badge>
            ))}
          </div>

          {/* Episode overview if available, else anime description */}
          {currentEpData?.overview ? (
            <div className="space-y-1 p-3 rounded-lg bg-white/3 border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Episode Synopsis
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {currentEpData.overview}
              </p>
            </div>
          ) : anime.description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {anime.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <WatchlistButton anime={anime} />
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {anime.averageScore && (
                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{(anime.averageScore / 10).toFixed(1)}</span>
                </div>
              )}
              {(currentEpData?.runtime || anime.duration) && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{currentEpData?.runtime || anime.duration} mins</span>
                </div>
              )}
              {currentEpData?.airDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{currentEpData.airDate}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Tv className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{anime.status || "Finished"}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Episode Navigator */}
        <Card className="p-4 sm:p-5 flex flex-col bg-card/50 border-white/10 backdrop-blur-sm h-fit max-h-[680px]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <ListVideo className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm sm:text-base">Episodes ({totalEpisodes})</h2>
            </div>
          </div>

          {totalEpisodes > 8 && (
            <div className="relative mb-3">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search episode # or title..."
                value={episodeSearch}
                onChange={(e) => setEpisodeSearch(e.target.value)}
                className="h-8 text-xs pl-8 bg-background/50 border-white/10"
              />
            </div>
          )}

          <div className="grid gap-2 overflow-y-auto pr-1 max-h-[520px] scrollbar-hide">
            {filteredEpisodes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No episodes matching &quot;{episodeSearch}&quot;
              </p>
            ) : (
              filteredEpisodes.map((epNum) => {
                const isCurrent = epNum === episodeNumber;
                const epMeta = aniZipData?.episodes?.[epNum.toString()];
                const epTitleText = epMeta?.title?.en || epMeta?.title?.["x-jat"];
                const epThumb = epMeta?.image;

                return (
                  <Link
                    key={epNum}
                    ref={isCurrent ? activeEpisodeRef : null}
                    href={`/watch/${animeId}/${epNum}`}
                    className={`flex items-center gap-3 p-2 rounded-lg text-xs font-medium transition-all group ${
                      isCurrent
                        ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/25"
                        : "hover:bg-white/5 text-muted-foreground hover:text-foreground border border-transparent hover:border-white/5"
                    }`}
                  >
                    {/* Thumbnail preview if available */}
                    {epThumb ? (
                      <div className="relative h-11 w-16 rounded overflow-hidden bg-black/40 shrink-0 border border-white/10">
                        <img
                          src={epThumb}
                          alt={`Ep ${epNum}`}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`h-9 w-10 rounded flex items-center justify-center font-mono text-[11px] shrink-0 ${
                          isCurrent ? "bg-black/30 text-white" : "bg-black/40 text-foreground"
                        }`}
                      >
                        {epNum}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="truncate font-semibold">
                        Episode {epNum}
                      </div>
                      {epTitleText && (
                        <div
                          className={`truncate text-[11px] ${
                            isCurrent ? "text-primary-foreground/90 font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {epTitleText}
                        </div>
                      )}
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/30 text-white font-bold shrink-0">
                        Playing
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}