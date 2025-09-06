"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2 } from "lucide-react";
import { useWatchProgress } from "@/hooks/use-watch-progress";
import { Media } from "@/types/anilistGraphQLTypes";

interface WatchButtonProps {
  anime: Media;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function WatchButton({ anime, variant = "default", size = "default" }: WatchButtonProps) {
  const router = useRouter();
  const { getProgress, isLoading } = useWatchProgress();
  
  const handleClick = () => {
    const progress = getProgress(anime.id!);
    const nextEpisode = progress ? progress + 1 : 1;
    
    // Only navigate if there are more episodes to watch
    if (!anime.episodes || nextEpisode <= anime.episodes) {
      router.push(`/watch/${anime.id}/${nextEpisode}`);
    }
  };

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading
      </Button>
    );
  }

  const progress = getProgress(anime.id!);
  const isComplete = progress && anime.episodes && progress >= anime.episodes;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isComplete}
    >
      <PlayCircle className="mr-2 h-4 w-4" />
      {progress ? (
        isComplete ? (
          "Completed"
        ) : (
          `Continue Episode ${progress + 1}`
        )
      ) : (
        "Start Watching"
      )}
    </Button>
  );
}