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
  Info,
  Flame,
} from "lucide-react";

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
  const [serverKey, setServerKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const media = listAnimeData?.media;
  const trailerId = media?.trailer?.site === "youtube" ? media.trailer.id : null;

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

        {/* Embedded Video Stream Player (100% internal playback) */}
        {!isLoading && activeServer && activeServerId !== "trailer" && (
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
              const isActive = activeServerId === server.id;
              return (
                <Button
                  key={server.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleServerChange(server.id)}
                  className={`h-7 px-3 text-xs rounded-md transition-all gap-1.5 ${
                    isActive
                      ? isAdult
                        ? "bg-pink-600 text-white font-semibold shadow-sm shadow-pink-600/30"
                        : "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/30"
                      : "border-white/10 hover:bg-white/5"
                  }`}
                  title={server.description}
                >
                  {server.badge === "Recommended" && (
                    <Sparkles className="h-3 w-3 text-amber-300 fill-amber-300" />
                  )}
                  {isAdult && isActive && (
                    <Flame className="h-3 w-3 text-pink-300" />
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

      {/* Helpful streamer tip banner */}
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
    </div>
  );
}