"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  isHLSProvider,
  MediaPlayer,
  MediaProviderAdapter,
  MediaProvider,
  Track,
} from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { ListAnimeData } from "@/types/anilistAPITypes";
import { IVideo } from "@consumet/extensions";
import { getUniversalEpisodeUrl } from "@/modules/providers/api";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Server, RefreshCw, AlertCircle, Film, Play } from "lucide-react";
import Hls from "hls.js";

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

type ServerType = "hls" | "embed1" | "embed2" | "trailer";

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
  const router = useRouter();
  const [activeServer, setActiveServer] = useState<ServerType>("hls");
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<{ url: string; lang: string }[]>([]);
  const [thumbnails, setThumbnails] = useState<string>("");

  const trailerId = listAnimeData.media?.trailer?.site === "youtube" ? listAnimeData.media.trailer.id : null;

  // Function to load native HLS source
  const loadHlsSource = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const cacheKey = `source-${animeId}-${episodeNumber}`;

    try {
      // Check localStorage safely
      let cached: IVideo[] | null = null;
      try {
        const item = localStorage.getItem(cacheKey);
        if (item) cached = JSON.parse(item);
      } catch (e) {
        // ignore storage errors
      }

      const parseTracks = (tracks: any): { url: string; lang: string }[] => {
        if (Array.isArray(tracks)) {
          return tracks
            .map((t: any) => ({
              url: typeof t?.url === "string" ? t.url : "",
              lang: typeof t?.lang === "string" ? t.lang : "Sub",
            }))
            .filter((t) => Boolean(t.url));
        }
        return [];
      };

      if (cached && cached.length > 0) {
        const bestSource = cached[0];
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(bestSource.url)}&type=m3u8`;
        setVideoSource(proxyUrl);
        setSubtitles(parseTracks(bestSource.tracks));
        setThumbnails(getThumbnailUrl(bestSource.url, Boolean(bestSource.isM3U8)));
        setIsLoading(false);
        return;
      }

      const sources = await getUniversalEpisodeUrl(listAnimeData, episodeNumber);
      if (sources && sources.length > 0) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(sources));
        } catch (e) {}

        const bestSource = sources[0];
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(bestSource.url)}&type=m3u8`;
        setVideoSource(proxyUrl);
        setThumbnails(getThumbnailUrl(bestSource.url, Boolean(bestSource.isM3U8)));
        setSubtitles(parseTracks(bestSource.tracks));
      } else {
        // If HLS source scraper is unavailable, seamlessly switch to embed server 1
        console.warn("HLS sources unavailable, falling back to Embed Server 1");
        setActiveServer("embed1");
      }
    } catch (err) {
      console.error("Failed to load HLS video:", err);
      // Auto-fallback to embed stream instead of dead end
      setActiveServer("embed1");
    } finally {
      setIsLoading(false);
    }
  }, [animeId, episodeNumber, listAnimeData]);

  useEffect(() => {
    if (activeServer === "hls") {
      loadHlsSource();
    } else {
      setIsLoading(false);
    }
  }, [activeServer, loadHlsSource]);

  function getThumbnailUrl(sourceUrl: string, isM3U8: boolean) {
    try {
      const url = new URL(sourceUrl);
      const hostname = url.hostname.replace("sbfull.com", "thumb.sbplay.org");
      if (isM3U8) {
        const id = url.searchParams.get("id");
        return id ? `https://${hostname}/hls/${id}/thumbs.vtt` : "";
      } else {
        const pathSegments = url.pathname.split("/");
        const lastSegment = pathSegments[pathSegments.length - 1];
        return lastSegment ? `https://${hostname}/preview/${lastSegment}.vtt` : "";
      }
    } catch {
      return "";
    }
  }

  const embedUrls: Record<string, string> = {
    embed1: `https://vidsrc.cc/v2/embed/anime/${animeId}/${episodeNumber}`,
    embed2: `https://2embed.cc/embed/anime?id=${animeId}&ep=${episodeNumber}`,
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Video Display Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/10 shadow-2xl">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 z-30">
            <LoadingSpinner />
            <p className="text-xs text-muted-foreground animate-pulse">
              Resolving stream servers for Episode {episodeNumber}...
            </p>
          </div>
        )}

        {activeServer === "hls" && videoSource && (
          <MediaPlayer
            key={videoSource}
            title={title}
            src={{
              src: videoSource,
              type: "application/vnd.apple.mpegurl",
            }}
            poster={listAnimeData.media?.coverImage?.extraLarge || listAnimeData.media?.bannerImage}
            crossOrigin="anonymous"
            autoPlay
            onProviderChange={(provider) => {
              if (isHLSProvider(provider)) {
                provider.library = Hls;
                provider.config = {
                  enableWorker: true,
                  lowLatencyMode: true,
                  backBufferLength: 90,
                  xhrSetup: (xhr) => {
                    xhr.withCredentials = false;
                  },
                };
              }
            }}
            onError={(e) => {
              console.warn("HLS Player error, switching to Embed Server 1", e);
              setActiveServer("embed1");
            }}
            className="w-full h-full"
          >
            <MediaProvider>
              {subtitles.map((sub, i) => (
                <Track
                  key={`sub-${i}`}
                  src={sub.url}
                  label={sub.lang || `Subtitle ${i + 1}`}
                  kind="subtitles"
                  type="vtt"
                  default={i === 0}
                />
              ))}
            </MediaProvider>
            <DefaultVideoLayout
              thumbnails={thumbnails}
              icons={defaultLayoutIcons}
              className="!border-0 !shadow-none"
            />
          </MediaPlayer>
        )}

        {(activeServer === "embed1" || activeServer === "embed2") && (
          <iframe
            key={activeServer + episodeNumber}
            src={embedUrls[activeServer]}
            title={`Episode ${episodeNumber} Stream`}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}

        {activeServer === "trailer" && trailerId && (
          <iframe
            key={trailerId}
            src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1`}
            title={`${title} Official Trailer`}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}
      </div>

      {/* Multi-Server Selection Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-card/60 border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground mr-1">SERVER:</span>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant={activeServer === "hls" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveServer("hls")}
              className={`h-7 px-3 text-xs rounded-md ${activeServer === "hls" ? "bg-primary text-primary-foreground font-semibold" : "border-white/10"}`}
            >
              HLS Player
            </Button>

            <Button
              variant={activeServer === "embed1" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveServer("embed1")}
              className={`h-7 px-3 text-xs rounded-md ${activeServer === "embed1" ? "bg-primary text-primary-foreground font-semibold" : "border-white/10"}`}
            >
              Stream 1
            </Button>

            <Button
              variant={activeServer === "embed2" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveServer("embed2")}
              className={`h-7 px-3 text-xs rounded-md ${activeServer === "embed2" ? "bg-primary text-primary-foreground font-semibold" : "border-white/10"}`}
            >
              Stream 2
            </Button>

            {trailerId && (
              <Button
                variant={activeServer === "trailer" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveServer("trailer")}
                className={`h-7 px-3 text-xs rounded-md ${activeServer === "trailer" ? "bg-primary text-primary-foreground font-semibold" : "border-white/10"}`}
              >
                <Film className="h-3 w-3 mr-1 text-red-400" />
                Official Trailer
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (activeServer === "hls") loadHlsSource();
              else {
                const current = activeServer;
                setActiveServer("hls");
                setTimeout(() => setActiveServer(current), 100);
              }
            }}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}