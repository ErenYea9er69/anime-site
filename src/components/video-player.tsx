import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isHLSProvider, MediaPlayer, MediaProviderAdapter, MediaProvider, useMediaPlayer } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { ListAnimeData } from "@/types/anilistAPITypes";
import { IVideo } from "@consumet/extensions";
import { getUniversalEpisodeUrl } from "@/modules/providers/api";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import Hls from 'hls.js';

interface VideoPlayerProps {
  animeId: string;
  episodeId: string;
  title: string;
  episodeNumber: number;
  totalEpisodes: number;
  listAnimeData: ListAnimeData;
}

export function VideoPlayer({
  animeId,
  episodeId,
  title,
  episodeNumber,
  totalEpisodes,
  listAnimeData,
}: VideoPlayerProps) {
  const router = useRouter();
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSourceReady, setIsSourceReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<{ url: string; lang: string }[]>([]);
  const [thumbnails, setThumbnails] = useState<string>('');
  const [cachedSources, setCachedSources] = useLocalStorage<Record<string, IVideo[]>>("cached-sources", {});

  useEffect(() => {
    let mounted = true;
    setIsSourceReady(false);
    const loadVideo = async () => {
      console.log('Loading video started');
      setIsLoading(true);
      setError(null);

      const cacheKey = `${animeId}-${episodeNumber}`;
      if (!mounted) return;

      try {
        if (cachedSources[cacheKey]) {
          const bestSource = cachedSources[cacheKey][0];
          const proxyUrl = `/api/proxy?url=${encodeURIComponent(bestSource.url)}&type=m3u8`;
          console.log('Best Source URL:', bestSource.url);
          console.log('Proxy URL:', proxyUrl);
          setVideoSource(proxyUrl);
          setSubtitles(bestSource.tracks || []);
          setThumbnails(getThumbnailUrl(bestSource.url, bestSource.isM3U8));
        } else {
          const sources = await getUniversalEpisodeUrl(listAnimeData, episodeNumber);
          if (sources?.[0]?.url) {
            // Only preload the primary video source
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'fetch';
            preloadLink.href = sources[0].url;
            
            // Remove preload link after it's no longer needed
            setTimeout(() => {
              document.head.removeChild(preloadLink);
            }, 10000);
            
            document.head.appendChild(preloadLink);
          }
          if (!sources || sources.length === 0) throw new Error("No video sources found");
          setCachedSources(prev => ({ ...prev, [cacheKey]: sources }));
          const bestSource = sources[0];
          console.log('Best Source URL:', bestSource.url);

      

          const proxyUrl = `/api/proxy?url=${encodeURIComponent(bestSource.url)}&type=m3u8`;
          console.log("Proxy URL:", proxyUrl);
          setVideoSource(proxyUrl);
          setThumbnails(getThumbnailUrl(bestSource.url, bestSource.isM3U8));
          if (bestSource.tracks) {
            setSubtitles(bestSource.tracks);
          } else {
            setSubtitles([]);
          }
        }
      } catch (err) {
        console.error("Failed to load video:", err);
        setError("Failed to load video. Please try again later.");
      } finally {
        setIsLoading(false);
      }

      setIsSourceReady(true);
    };

    loadVideo();

    return () => {
      mounted = false;
      setIsSourceReady(false);
      setVideoSource(null);
    };
  }, [listAnimeData, episodeNumber, animeId, cachedSources]);

  function getThumbnailUrl(sourceUrl: string, isM3U8: boolean) {
    try {
      const url = new URL(sourceUrl);
      const hostname = url.hostname.replace('sbfull.com', 'thumb.sbplay.org');
      if (isM3U8) {
        const id = url.searchParams.get('id');
        return id ? `https://${hostname}/hls/${id}/thumbs.vtt` : '';
      } else {
        const pathSegments = url.pathname.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1];
        return lastSegment ? `https://${hostname}/preview/${lastSegment}.vtt` : '';
      }
    } catch {
      return '';
    }
  }

  function onError(error: any) {
    console.log('HLS Error:', error);
  }

  function onProviderChange(provider: MediaProviderAdapter | null) {
    if (isHLSProvider(provider)) {
      provider.library = Hls;
      provider.config = {
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      };
    }
  }
  
  if (isLoading) {
    return (
      <div className="aspect-video bg-black rounded-lg shadow-lg flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video bg-black rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center text-white p-4">
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <MediaPlayer 
      key={videoSource}
      title={title} 
      src={{
        src: videoSource!,
        type: 'application/vnd.apple.mpegurl'
      }}
      poster={listAnimeData.media?.coverImage?.extraLarge}
      crossOrigin='anonymous'
      autoPlay
      onProviderChange={(provider) => {
        if (isHLSProvider(provider)) {
          provider.library = Hls;
          provider.config = {
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            xhrSetup: (xhr, url) => {
              xhr.withCredentials = false;
            }
          };
        }
      }}
      onError={onError}
      
    >
      <MediaProvider />
      <DefaultVideoLayout
        thumbnails={thumbnails}
        icons={defaultLayoutIcons} 
        className="!border-0 !shadow-none" 
      />
    </MediaPlayer>
  );
}