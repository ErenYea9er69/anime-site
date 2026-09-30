"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ListAnimeData } from "@/types/anilistAPITypes";
import {
  resolveStreamServers,
  StreamServer,
  StreamResolution,
  getEpisodeSkipTimes,
  EpisodeSkipTimes,
} from "@/services/streaming";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Server,
  RefreshCw,
  Film,
  Play,
  Sparkles,
  Info,
  Flame,
  FastForward,
  SkipForward,
  X,
  Tv,
} from "lucide-react";
import { toast } from "sonner";

export interface NextEpisodeInfo {
  episodeNumber: number;
  title?: string;
  thumbnail?: string;
  overview?: string;
}

interface VideoPlayerProps {
  animeId: string;
  episodeId: string;
  title: string;
  episodeNumber: number;
  totalEpisodes: number;
  listAnimeData: ListAnimeData;
  nextEpisode?: NextEpisodeInfo | null;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  animeId,
  episodeId,
  title,
  episodeNumber,
  totalEpisodes,
  listAnimeData,
  nextEpisode,
  onNextEpisode,
  onPrevEpisode,
}: VideoPlayerProps) {
  const router = useRouter();
  const [resolution, setResolution] = useState<StreamResolution | null>(null);
  const [activeServerId, setActiveServerId] = useState<string>("vidlink");
  const [isLoading, setIsLoading] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [serverKey, setServerKey] = useState(0);

  // Playback & Skip state
  const [skipTimes, setSkipTimes] = useState<EpisodeSkipTimes | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [introSkipped, setIntroSkipped] = useState<boolean>(false);
  const [outroSkipped, setOutroSkipped] = useState<boolean>(false);
  const [customStartParam, setCustomStartParam] = useState<string>("");

  // Netflix-style Next Episode Prompt
  const [showNextPrompt, setShowNextPrompt] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [isPausedCountdown, setIsPausedCountdown] = useState<boolean>(false);
  const [autoplayNext, setAutoplayNext] = useState<boolean>(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const localTimerRef = useRef<NodeJS.Timeout | null>(null);

  const media = listAnimeData?.media;
  const trailerId = media?.trailer?.site === "youtube" ? media.trailer.id : null;

  // Initialize Autoplay preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("monu_autoplay_next");
      if (stored !== null) {
        setAutoplayNext(stored === "true");
      }
    }
  }, []);

  // Reset state when changing episodes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIntroSkipped(false);
    setOutroSkipped(false);
    setShowNextPrompt(false);
    setCountdown(5);
    setIsPausedCountdown(false);
    setCustomStartParam("");
  }, [episodeNumber, animeId]);

  // Resolve available streaming servers
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

      // Fetch AniSkip Opening/Ending Skip intervals
      const malId = res.malId || media?.idMal;
      if (malId) {
        const skips = await getEpisodeSkipTimes(malId, episodeNumber);
        if (skips) {
          setSkipTimes(skips);
          if (skips.episodeLength && skips.episodeLength > 0) {
            setDuration(skips.episodeLength);
          }
        }
      }
    } catch (err) {
      console.error("Failed to resolve stream servers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [animeId, episodeNumber, media]);

  useEffect(() => {
    loadStreamingData();
  }, [loadStreamingData]);

  // Handle Netflix-style navigation to next episode
  const handleGoToNextEpisode = useCallback(() => {
    setShowNextPrompt(false);
    if (onNextEpisode) {
      onNextEpisode();
    } else if (nextEpisode) {
      router.push(`/watch/${animeId}/${nextEpisode.episodeNumber}`);
    }
  }, [onNextEpisode, nextEpisode, router, animeId]);

  // Listen to postMessage from VidLink player for real-time progress & completion
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin || !event.data) return;

      // VidLink emits PLAYER_EVENT
      if (
        (event.origin.includes("vidlink.pro") || event.origin.includes("vidlink")) &&
        event.data?.type === "PLAYER_EVENT" &&
        event.data?.data
      ) {
        const { event: evtName, currentTime: cur, duration: dur } = event.data.data;

        if (typeof cur === "number" && !isNaN(cur)) {
          setCurrentTime(cur);
        }
        if (typeof dur === "number" && !isNaN(dur) && dur > 0) {
          setDuration(dur);
        }

        if (evtName === "ended") {
          if (nextEpisode) {
            setShowNextPrompt(true);
            setCountdown(5);
            setIsPausedCountdown(false);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [nextEpisode]);

  // Secondary local progress clock (ensures Skip Intro / Outro work on all servers)
  useEffect(() => {
    if (isIframeLoading || isLoading || showNextPrompt) {
      if (localTimerRef.current) clearInterval(localTimerRef.current);
      return;
    }

    localTimerRef.current = setInterval(() => {
      setCurrentTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (localTimerRef.current) clearInterval(localTimerRef.current);
    };
  }, [isIframeLoading, isLoading, showNextPrompt]);

  // Check if player reached outro or end to trigger Next Episode overlay
  useEffect(() => {
    if (showNextPrompt || outroSkipped || !nextEpisode) return;

    // Trigger when within outro interval or at last 45s of episode
    const edStart = skipTimes?.ed?.startTime;
    const isAtOutro = edStart && currentTime >= edStart - 2;
    const isNearEnd = duration > 0 && currentTime >= duration - 45;

    if (isAtOutro || isNearEnd) {
      setShowNextPrompt(true);
      setCountdown(5);
      setIsPausedCountdown(false);
    }
  }, [currentTime, duration, skipTimes, showNextPrompt, outroSkipped, nextEpisode]);

  // Countdown timer for auto-advancing to next episode
  useEffect(() => {
    if (!showNextPrompt || isPausedCountdown || !autoplayNext || !nextEpisode) return;

    if (countdown <= 0) {
      handleGoToNextEpisode();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGoToNextEpisode();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showNextPrompt, isPausedCountdown, autoplayNext, countdown, nextEpisode, handleGoToNextEpisode]);

  // Active Server details
  const activeServer: StreamServer | undefined = resolution?.servers.find(
    (s) => s.id === activeServerId
  );

  const handleServerChange = (serverId: string) => {
    setIsIframeLoading(true);
    setActiveServerId(serverId);
    setServerKey((k) => k + 1);
    setCustomStartParam("");
  };

  const handleReload = () => {
    setIsIframeLoading(true);
    setServerKey((k) => k + 1);
  };

  // Skip Intro Handler
  const handleSkipIntro = () => {
    const targetTime = skipTimes?.op?.endTime
      ? Math.ceil(skipTimes.op.endTime)
      : Math.floor(currentTime) + 85;

    // 1. PostMessage seek command
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: "SEEK", time: targetTime }, "*");
      iframeRef.current?.contentWindow?.postMessage({ event: "seek", time: targetTime }, "*");
    } catch {
      // ignore
    }

    // 2. VidLink iframe reload with startAt offset
    setCustomStartParam(`&startAt=${targetTime}&autoplay=true`);
    setCurrentTime(targetTime);
    setIntroSkipped(true);
    setServerKey((k) => k + 1);
    toast.success(`Skipped opening to ${formatTime(targetTime)}`);
  };

  // Skip Outro Handler
  const handleSkipOutro = () => {
    setOutroSkipped(true);
    if (nextEpisode) {
      setShowNextPrompt(true);
      setCountdown(5);
      setIsPausedCountdown(false);
    } else {
      toast.success("You are at the final episode of the season!");
    }
  };

  const handleDismissNextPrompt = () => {
    setShowNextPrompt(false);
    setIsPausedCountdown(true);
    setOutroSkipped(true);
  };

  const handleToggleAutoplay = (enabled: boolean) => {
    setAutoplayNext(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("monu_autoplay_next", String(enabled));
    }
    if (!enabled) {
      setIsPausedCountdown(true);
    } else {
      setIsPausedCountdown(false);
    }
  };

  // Keyboard Shortcuts: 'I' for Skip Intro, 'N' for Next Ep, 'Escape' to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if ((e.key === "i" || e.key === "I") && !introSkipped) {
        e.preventDefault();
        handleSkipIntro();
      } else if ((e.key === "n" || e.key === "N") && nextEpisode) {
        e.preventDefault();
        if (!showNextPrompt) {
          setShowNextPrompt(true);
          setCountdown(5);
          setIsPausedCountdown(false);
        } else {
          handleGoToNextEpisode();
        }
      } else if (e.key === "Escape" && showNextPrompt) {
        e.preventDefault();
        handleDismissNextPrompt();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [introSkipped, nextEpisode, showNextPrompt, handleGoToNextEpisode]);

  const isAdult = Boolean(resolution?.isAdult);

  // Compute whether Intro button should be visible
  const isIntroActive =
    !introSkipped &&
    !showNextPrompt &&
    (skipTimes?.op
      ? currentTime >= Math.max(0, skipTimes.op.startTime - 2) && currentTime <= skipTimes.op.endTime
      : currentTime >= 0 && currentTime <= 110);

  // Compute whether Outro button should be visible
  const isOutroActive =
    !outroSkipped &&
    !showNextPrompt &&
    Boolean(nextEpisode) &&
    (skipTimes?.ed
      ? currentTime >= Math.max(0, skipTimes.ed.startTime - 2)
      : duration > 0 && currentTime >= duration - 90);

  // Get active iframe URL with optional startAt param
  const getIframeUrl = () => {
    if (!activeServer) return "";
    let url = activeServer.url;
    if (activeServer.id === "vidlink" && customStartParam) {
      if (url.includes("startAt=")) {
        url = url.replace(/startAt=\d+/, customStartParam.replace("&", ""));
      } else {
        url += customStartParam;
      }
    }
    return url;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Video Display Container */}
      <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/10 shadow-2xl">
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
              src={getIframeUrl()}
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

        {/* Floating Skip Intro Pill */}
        {isIntroActive && !isLoading && (
          <div className="absolute bottom-6 right-6 z-30 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <button
              onClick={handleSkipIntro}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950/85 hover:bg-zinc-900/95 text-white border border-white/20 hover:border-white/40 backdrop-blur-md shadow-2xl transition-all hover:scale-105 active:scale-95 group cursor-pointer"
              title="Skip opening sequence [Key: I]"
            >
              <FastForward className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
              <span className="text-xs font-semibold tracking-wide">
                {skipTimes?.op
                  ? `Skip Intro (${formatTime(skipTimes.op.startTime)} - ${formatTime(skipTimes.op.endTime)})`
                  : "Skip Intro"}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-400 bg-white/10 px-1.5 py-0.5 rounded">
                I
              </span>
            </button>
          </div>
        )}

        {/* Floating Skip Outro Pill */}
        {isOutroActive && !isLoading && (
          <div className="absolute bottom-6 right-6 z-30 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <button
              onClick={handleSkipOutro}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950/85 hover:bg-zinc-900/95 text-white border border-white/20 hover:border-white/40 backdrop-blur-md shadow-2xl transition-all hover:scale-105 active:scale-95 group cursor-pointer"
              title="Skip to next episode [Key: N]"
            >
              <SkipForward className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
              <span className="text-xs font-semibold tracking-wide">Next Episode</span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-400 bg-white/10 px-1.5 py-0.5 rounded">
                N
              </span>
            </button>
          </div>
        )}

        {/* Netflix-Style Next Episode Overlay Card */}
        {showNextPrompt && nextEpisode && (
          <div className="absolute bottom-4 right-4 z-40 w-80 sm:w-96 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-white/15 p-4 shadow-2xl ring-1 ring-white/10 animate-in fade-in-0 slide-in-from-bottom-4 zoom-in-95 duration-300">
            {/* Header with Circular Countdown */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-7 h-7">
                  <svg className="w-7 h-7 -rotate-90">
                    <circle
                      cx="14"
                      cy="14"
                      r="11"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="transparent"
                      className="text-white/10"
                    />
                    <circle
                      cx="14"
                      cy="14"
                      r="11"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 11}
                      strokeDashoffset={2 * Math.PI * 11 * (1 - countdown / 5)}
                      strokeLinecap="round"
                      className="text-primary transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="absolute font-mono text-[10px] font-bold text-white">
                    {countdown}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white tracking-wide">
                    Next episode in {countdown}s
                  </span>
                  <p className="text-[10px] text-zinc-400">
                    Auto-playing next episode
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismissNextPrompt}
                className="h-7 w-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Stay on this episode"
                aria-label="Dismiss countdown"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Episode Preview Row */}
            <div
              className="flex gap-3 items-center mb-3 group cursor-pointer"
              onClick={handleGoToNextEpisode}
            >
              {nextEpisode.thumbnail ? (
                <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 bg-black/50 border border-white/10">
                  <img
                    src={nextEpisode.thumbnail}
                    alt={`Episode ${nextEpisode.episodeNumber}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-4 w-4 text-white fill-white" />
                  </div>
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono px-1 rounded text-white font-medium">
                    Ep {nextEpisode.episodeNumber}
                  </span>
                </div>
              ) : (
                <div className="w-20 h-14 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-sm text-primary shrink-0">
                  Ep {nextEpisode.episodeNumber}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                  {nextEpisode.title || `Episode ${nextEpisode.episodeNumber}`}
                </h4>
                {nextEpisode.overview && (
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                    {nextEpisode.overview}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleGoToNextEpisode}
                size="sm"
                className="flex-1 h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25 gap-1.5"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Play Now</span>
              </Button>
              <Button
                onClick={handleDismissNextPrompt}
                variant="outline"
                size="sm"
                className="h-8 text-xs border-white/10 hover:bg-white/10 text-zinc-300"
              >
                Stay
              </Button>
            </div>

            {/* Footer Autoplay Toggle */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-[10px] text-zinc-400">
              <span>Auto-advance episodes</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoplayNext}
                  onChange={(e) => handleToggleAutoplay(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-0 h-3 w-3"
                />
                <span className="text-[11px] text-zinc-300">Autoplay</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Server Selection & Quick Skip Toolbar */}
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

        {/* Quick Skip Actions */}
        <div className="flex items-center gap-2">
          {!introSkipped && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipIntro}
              className="h-7 px-2.5 text-xs border-white/10 hover:bg-white/5 gap-1.5 text-foreground"
              title="Skip Intro (+85s) [Hotkey: I]"
            >
              <FastForward className="h-3.5 w-3.5 text-primary" />
              <span>Skip Intro</span>
            </Button>
          )}

          {nextEpisode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowNextPrompt(true);
                setCountdown(5);
                setIsPausedCountdown(false);
              }}
              className="h-7 px-2.5 text-xs border-white/10 hover:bg-white/5 gap-1.5 text-foreground"
              title="Next Episode [Hotkey: N]"
            >
              <SkipForward className="h-3.5 w-3.5 text-primary" />
              <span>Next Ep</span>
            </Button>
          )}

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

      {/* Streamer Info / Skip times notification */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 px-2 py-1 bg-white/2 rounded border border-white/5">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>
            Streaming <strong className="text-foreground">Episode {episodeNumber}</strong> via{" "}
            <strong className="text-foreground">{activeServer?.name || "Player"}</strong>.
            {skipTimes?.op && (
              <span className="ml-1 text-primary">
                Opening: {formatTime(skipTimes.op.startTime)} - {formatTime(skipTimes.op.endTime)}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[10px] text-zinc-400">
            Keys: <strong className="text-zinc-300">I</strong> (Intro), <strong className="text-zinc-300">N</strong> (Next Ep)
          </span>
          {resolution?.seasonNumber && resolution.seasonNumber > 1 && (
            <span className="text-primary font-mono font-medium">
              S{resolution.seasonNumber} • Ep {resolution.episodeInSeason}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}