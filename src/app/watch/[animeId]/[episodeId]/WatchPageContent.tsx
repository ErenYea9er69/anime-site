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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

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
  const activeEpisodeRef = useRef<HTMLAnchorElement>(null);

  const title = anime.title?.english || anime.title?.romaji || anime.title?.userPreferred || "Anime Episode";
  const totalEpisodes = anime.episodes || 1;
  const hasPrev = episodeNumber > 1;
  const hasNext = episodeNumber < totalEpisodes;

  // Set document title
  useEffect(() => {
    document.title = `${title} - Episode ${episodeNumber} | Monu`;
  }, [title, episodeNumber]);

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

    const artwork = anime.bannerImage
      ? [{ src: anime.bannerImage, sizes: "512x512", type: "image/jpeg" }]
      : undefined;

    mediaSession.metadata = new MediaMetadata({
      title,
      artist: `Episode ${episodeNumber}`,
      artwork,
    });
  }, [anime, title, episodeNumber]);

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

  // Filter episodes based on user search
  const allEpisodes = Array.from({ length: totalEpisodes }, (_, i) => i + 1);
  const filteredEpisodes = episodeSearch.trim()
    ? allEpisodes.filter((ep) => ep.toString().includes(episodeSearch.trim()))
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
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {anime.format || "TV"} Series
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs text-muted-foreground font-medium">
                  Episode {episodeNumber}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-2 self-start">
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

          {anime.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {anime.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
            </p>
          )}

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
              {anime.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{anime.duration} mins</span>
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
        <Card className="p-4 sm:p-5 flex flex-col bg-card/50 border-white/10 backdrop-blur-sm h-fit max-h-[650px]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <ListVideo className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm sm:text-base">Episodes ({totalEpisodes})</h2>
            </div>
          </div>

          {totalEpisodes > 12 && (
            <div className="relative mb-3">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Jump to ep..."
                value={episodeSearch}
                onChange={(e) => setEpisodeSearch(e.target.value)}
                className="h-8 text-xs pl-8 bg-background/50 border-white/10"
              />
            </div>
          )}

          <div className="grid gap-2 overflow-y-auto pr-1 max-h-[500px] scrollbar-hide">
            {filteredEpisodes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No episodes matching "{episodeSearch}"
              </p>
            ) : (
              filteredEpisodes.map((epNum) => {
                const isCurrent = epNum === episodeNumber;
                return (
                  <Link
                    key={epNum}
                    ref={isCurrent ? activeEpisodeRef : null}
                    href={`/watch/${animeId}/${epNum}`}
                    className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium transition-all ${
                      isCurrent
                        ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/25"
                        : "hover:bg-white/5 text-muted-foreground hover:text-foreground border border-transparent hover:border-white/5"
                    }`}
                  >
                    <div className="h-6 w-8 rounded bg-black/40 flex items-center justify-center font-mono text-[11px] shrink-0">
                      {epNum}
                    </div>
                    <div className="flex-1 truncate">
                      Episode {epNum}
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