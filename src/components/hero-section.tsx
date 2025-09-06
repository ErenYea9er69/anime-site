import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlayCircle, Plus } from "lucide-react";
import type { Anime } from "@/lib/anilist";

export function HeroSection({ anime }: { anime: Anime }) {
  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={anime.bannerImage || anime.coverImage.large}
          alt={anime.title.english || anime.title.romaji}
          fill
          className="object-cover brightness-50"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      <div className="container relative flex h-full items-end pb-16">
        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-bold">
            {anime.title.english || anime.title.romaji}
          </h1>
          <p className="mb-6 line-clamp-3 text-lg text-muted-foreground">
            {anime.description?.replace(/<[^>]*>/g, "")}
          </p>
          <div className="flex gap-4">
            <Button size="lg">
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Now
            </Button>
            <Button size="lg" variant="secondary">
              <Plus className="mr-2 h-5 w-5" />
              Add to Watchlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}