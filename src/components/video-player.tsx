"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ListAnimeData } from "@/types/anilistAPITypes";
import { resolveStreamServers, StreamServer, StreamResolution } from "@/services/streaming";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  RefreshCw,
  Film,
  Play,
  Sparkles,
  AlertCircle,
  Info,
  ExternalLink,
  ShieldAlert,
  Flame,
} from "lucide-react";
import Image from "next/image";

interface VideoPlayerProps {
  animeId: string;
  episodeId: string;
  title: string;
  episodeNumber: number;
  totalEpisodes: number;
  listAnimeData: ListAnimeData;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
}

export function VideoPlayer({
  animeId,
  episodeId,
  title,
  episodeNumber,
  totalEpisodes,
  listAnimeData,
  onNextEpisode,
  onPrevEpisode,
}: VideoPlayerProps) {
  const [resolution, setResolution] = useState<StreamResolution | null>(null);
  const [activeServerId, setActiveServerId] = useState<string>("vidlink");
  const [isLoading, setIsLoading] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [showEmbedAnyway, setShowEmbedAnyway] = useState(false);
  const [serverKey, setServerKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const media = listAnimeData?.media;
  const trailerId = media?.trailer?.site === "youtube" ? media.trailer.id : null;
  const posterImage = media?.bannerImage || media?.coverImage?.extraLarge || media?.coverImage?.large;

  // Resolve available streaming servers and cross-database mapping
  const loadStreamingData = useCallback(async () => {
    setIsLoading(true);
    setIsIframeLoading(true);
    try {
      const res = await resolveStreamServers(parseInt(animeId, 10), episodeNumber, media);
      setResolution(res);
      setActiveServerId((prev) => {
        if (prev === "trailer") return "trailer";
        const exists = res.servers.some((s) => s.id === prev);
        return exists ? prev : res.defaultServerId;
      });
    } catch (err) {
      console.error("Failed to resolve stream servers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [animeId, episodeNumber, media]);

  useEffect(() => {
    loadStreamingData();
  }, [loadStreamingData]);

  const activeServer: StreamServer | undefined = resolution?.servers.find(
    (s) => s.id === activeServerId
  );

  const handleServerChange = (serverId: string) => {
    setIsIframeLoading(true);
    setShowEmbedAnyway(true);
    setActiveServerId(serverId);
    setServerKey((k) => k + 1);
  };

  const handleReload = () => {
    setIsIframeLoading(true);
    setServerKey((k) => k + 1);
  };

  const isAdult = Boolean(resolution?.isAdult);

  return (
    <div className="flex flex-col gap-3">
      {/* Video Display Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/10 shadow-2xl">
        {/* Loading overlay when resolving servers */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/95 z-30">
            <LoadingSpinner />
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-white">Connecting to Anime Stream Servers...</p>
              <p className="text-xs text-muted-foreground animate-pulse">
                Resolving Episode {episodeNumber} sources
              </p>
            </div>
          </div>
        )}

        {/* 18+ Adult Hub Interactive Player Screen when embed is not yet forced */}
        {!isLoading && isAdult && !showEmbedAnyway && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-black via-zinc-950/90 to-black/80 z-20 text-center">
            {posterImage && (
              <div
                className="absolute inset-0 opacity-20 bg-cover bg-center filter blur-md -z-10"
                style={{ backgroundImage: `url(${posterImage})` }}
              />
            )}
            <div className="max-w-xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>18+ Adult Content Notice</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Stream {title} (Ep {episodeNumber})
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mainstream TV databases (TMDB/IMDb) do not index explicit 18+ anime. Stream this episode directly in Full HD / 4K on dedicated adult anime networks below:
                </p>
              </div>

              {/* Direct Launch Cards */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {resolution?.adultSources?.map((source) => (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-start p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/50 transition-all group text-left shadow-lg"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-sm text-foreground group-hover:text-pink-400 transition-colors flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5 text-pink-500" />
                        {source.name}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[11px] text-muted-foreground line-clamp-1">
                      {source.description}
                    </span>
                    <span className="mt-2 text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-semibold uppercase tracking-wider">
                      {source.badge}
                    </span>
                  </a>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmbedAnyway(true)}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  Or try Embedded Scraper Player
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Embedded Video Stream Player */}
        {!isLoading && activeServer && activeServerId !== "trailer" && (!isAdult || showEmbedAnyway) && (
          <div className="relative w-full h-full">
            {isIframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 z-20 backdrop-blur-xs">
                <LoadingSpinner />
                <p className="text-xs text-muted-foreground">Buffering {activeServer.name}...</p>
              </div>
            )}
            <iframe
              ref={iframeRef}
              key={`${activeServer.id}-${episodeNumber}-${serverKey}`}
              src={activeServer.url}
              title={`${title} - Episode ${episodeNumber} (${activeServer.name})`}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              onLoad={() => setIsIframeLoading(false)}
            />
          </div>
        )}

        {/* Official Trailer fallback player */}
        {activeServerId === "trailer" && trailerId && (
          <iframe
            key={`trailer-${trailerId}`}
            src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1`}
            title={`${title} Official Trailer`}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            onLoad={() => setIsIframeLoading(false)}
          />
        )}
      </div>

      {/* Multi-Server Selection Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-card/60 border border-white/5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
            <Server className="h-4 w-4 text-primary shrink-0" />
            <span>SERVERS:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {resolution?.servers.map((server) => {
              const isActive = activeServerId === server.id && showEmbedAnyway;
              return (
                <Button
                  key={server.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleServerChange(server.id)}
                  className={`h-7 px-3 text-xs rounded-md transition-all gap-1.5 ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/30"
                      : "border-white/10 hover:bg-white/5"
                  }`}
                  title={server.description}
                >
                  {server.badge === "Recommended" && (
                    <Sparkles className="h-3 w-3 text-amber-300 fill-amber-300" />
                  )}
                  <span>{server.name}</span>
                  {server.badge && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-semibold uppercase tracking-wider ${
                        isActive
                          ? "bg-black/30 text-white"
                          : "bg-white/10 text-muted-foreground"
                      }`}
                    >
                      {server.badge}
                    </span>
                  )}
                </Button>
              );
            })}

            {isAdult && (
              <Button
                variant={!showEmbedAnyway ? "default" : "outline"}
                size="sm"
                onClick={() => setShowEmbedAnyway(false)}
                className={`h-7 px-3 text-xs rounded-md gap-1.5 ${
                  !showEmbedAnyway
                    ? "bg-pink-600 text-white font-semibold shadow-sm shadow-pink-600/30"
                    : "border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                }`}
              >
                <Flame className="h-3 w-3 text-pink-300" />
                <span>18+ Streaming Hub</span>
              </Button>
            )}

            {trailerId && (
              <Button
                variant={activeServerId === "trailer" ? "default" : "outline"}
                size="sm"
                onClick={() => handleServerChange("trailer")}
                className={`h-7 px-2.5 text-xs rounded-md ${
                  activeServerId === "trailer"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "border-white/10 hover:bg-white/5"
                }`}
              >
                <Film className="h-3 w-3 mr-1 text-red-400" />
                Trailer
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReload}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Reload video stream"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reload
          </Button>
        </div>
      </div>

      {/* 18+ Dedicated Streaming Mirrors Bar (when isAdult is true) */}
      {isAdult && resolution?.adultSources && (
        <div className="p-3 rounded-lg bg-pink-950/20 border border-pink-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-400">
              <Flame className="h-3.5 w-3.5 text-pink-500" />
              <span>DEDICATED 18+ ANIME SOURCES FOR &quot;{title}&quot;:</span>
            </div>
            <span className="text-[10px] text-pink-300/70">Click to open episode on source</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {resolution.adultSources.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-500/40 text-xs font-semibold text-foreground hover:text-pink-300 transition-all group"
              >
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{source.name}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">{source.badge}</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-pink-400 shrink-0 ml-1.5" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Helpful streamer tip banner */}
      {!isAdult && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 px-2 py-1 bg-white/2 rounded border border-white/5">
          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>
              Streaming <strong className="text-foreground">Episode {episodeNumber}</strong> via{" "}
              <strong className="text-foreground">{activeServer?.name || "Player"}</strong>. If you experience buffering, switch to <strong className="text-foreground">VidSrc Pro</strong> or <strong className="text-foreground">AutoEmbed</strong>.
            </span>
          </div>
          {resolution?.seasonNumber && resolution.seasonNumber > 1 && (
            <span className="hidden sm:inline-block text-primary font-mono font-medium">
              Season {resolution.seasonNumber} • Ep {resolution.episodeInSeason}
            </span>
          )}
        </div>
      )}
    </div>
  );
}