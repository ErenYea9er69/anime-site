"use client";

import { useEffect, useState } from "react";
import { VideoPlayer } from "@/components/video-player";
import { Badge } from "@/components/ui/badge";
import { WatchlistButton } from "@/components/watchlist/watchlist-button";
import { EpisodeNavigation } from "@/components/episode-navigation";
import { Media } from "@/types/anilistGraphQLTypes";
import { Card } from "@/components/ui/card";
import { ShareIcon, FlagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import Link from "next/link";

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
  episodeNumber 
}: WatchPageContentProps) {
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [episodeData, setEpisodeData] = useState<any>(null);
  const [episodeNavigation, setEpisodeNavigation] = useState(null);

  useEffect(() => {
    // Set up media session metadata for better media controls
    const mediaSession = navigator.mediaSession;
    if (!mediaSession) return;

    const title = anime.title?.english || anime.title?.romaji;
    const artwork = anime.bannerImage ? 
      [{ src: anime.bannerImage, sizes: "512x512", type: "image/jpeg" }] : 
      undefined;

    mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: `Episode ${episodeNumber}`,
      artwork
    });
  }, [anime, episodeNumber]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Watch Now - ${anime.title?.english || anime.title?.romaji}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <>
      <Head>
        <title>{`${anime.title?.romaji} - Episode ${episodeNumber}`}</title>
        <meta name="description" content={anime.description} />
        <meta property="og:title" content={`Watch - ${anime.title?.english}`} />
        <meta property="og:description" content={anime.description} />
        <meta property="og:image" content={anime.bannerImage} />
      </Head>

      <div className={`container mx-auto px-4 py-6 ${isTheaterMode ? 'theater-mode' : ''}`}>
        <div className="video-container">
          <VideoPlayer
            animeId={animeId}
            episodeId={episodeId}
            title={anime.title?.english || anime.title?.romaji || ""}
            episodeNumber={episodeNumber}
            totalEpisodes={anime.episodes || 9999}
            listAnimeData={{
              id: null,
              mediaId: null,
              progress: undefined,
              media: anime
            }}
          />
        </div>

        <div className="grid gap-8 mt-6 lg:grid-cols-[2fr_1fr]">
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">
                  {anime.title?.english || anime.title?.romaji}
                </h1>
                <p className="text-muted-foreground">Episode {episodeNumber}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <FlagIcon className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {anime.genres?.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>

            <p className="text-muted-foreground">
              {anime.description?.replace(/<[^>]*>/g, "")}
            </p>

            <div className="flex items-center gap-4">
              <WatchlistButton anime={anime} />
              <div className="text-sm text-muted-foreground">
                {anime.episodes ? `${anime.episodes} Episodes` : 'Ongoing'} • {anime.duration} mins
              </div>
            </div>
          </Card>

  <Card className="p-6">
  <h2 className="text-lg font-semibold mb-4">Episodes</h2>
  <div className="grid gap-2 max-h-[60vh] overflow-y-auto">
    {Array.from({ length: anime.episodes || 1 }).map((_, index) => (
      <Link 
        href={`/watch/${animeId}/${index + 1}`} 
        key={index}
        className={`p-3 flex items-center gap-3 rounded-md transition-colors
          ${episodeNumber === index + 1 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-muted'
          }`}
      >
        <div className="flex-shrink-0 w-24 h-16 relative rounded-md overflow-hidden">
          <img
            src={anime.bannerImage || '/episode-placeholder.jpg'}
            alt={`Episode ${index + 1}`}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold flex items-center gap-2">
            <span>Episode {index + 1}</span>
            {episodeData?.episodes?.[index]?.title && (
              <span className="text-sm text-muted-foreground truncate">
                - {episodeData.episodes[index].title}
              </span>
            )}
          </div>
          {episodeData?.episodes?.[index]?.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {episodeData.episodes[index].description}
            </p>
          )}
          <div className="text-sm text-muted-foreground mt-1">
            {episodeNumber === index + 1 ? 'Currently Playing' : 'Click to Watch'}
          </div>
        </div>
      </Link>
    ))}
  </div>
</Card>

        </div>
      </div>
    </>
  );
}