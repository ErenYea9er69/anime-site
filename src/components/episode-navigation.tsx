import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EpisodeNavigationProps {
  currentEpisode: number;
  totalEpisodes: number;
  animeId: number;
}

export function EpisodeNavigation({
  currentEpisode,
  totalEpisodes,
  animeId,
}: EpisodeNavigationProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          asChild
          disabled={currentEpisode <= 1}
        >
          <Link href={`/watch/${animeId}/${currentEpisode - 1}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>

        <Select
          value={currentEpisode.toString()}
          onValueChange={(value) => {
            window.location.href = `/watch/${animeId}/${value}`;
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map(
              (episode) => (
                <SelectItem key={episode} value={episode.toString()}>
                  Episode {episode}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          asChild
          disabled={currentEpisode >= totalEpisodes}
        >
          <Link href={`/watch/${animeId}/${currentEpisode + 1}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }, (_, i) => {
          const episode = currentEpisode - 4 + i;
          if (episode < 1 || episode > totalEpisodes) return null;

          return (
            <Button
              key={episode}
              variant={episode === currentEpisode ? "default" : "outline"}
              asChild
              className="w-full"
            >
              <Link href={`/watch/${animeId}/${episode}`}>
                {episode}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}