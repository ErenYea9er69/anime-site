import Link from "next/link";
import Image from "next/image";
import { Star, Play, Tv } from "lucide-react";
import { Media } from "@/types/anilistGraphQLTypes";
import { Badge } from "@/components/ui/badge";

interface AnimeCardProps {
  anime: Media;
  priority?: boolean;
}

export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  const title = anime.title?.english || anime.title?.romaji || anime.title?.userPreferred || "Untitled";
  const image = anime.coverImage?.large || anime.coverImage?.extraLarge || anime.bannerImage || "";
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const episodes = anime.episodes;
  const format = anime.format?.replace("_", " ") || "TV";

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-card/60 border border-white/5 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`View details for ${title}`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <Tv className="h-8 w-8 opacity-40" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none gap-1">
          {format && (
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-background/80 backdrop-blur-md text-foreground border border-white/10 shadow-sm">
              {format}
            </span>
          )}
          {score && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-bold rounded-md bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/20 shadow-sm">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {score}
            </span>
          )}
        </div>

        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Bottom Ep count pill inside poster */}
        {episodes ? (
          <div className="absolute bottom-2 left-2 text-[11px] font-medium text-white/90 drop-shadow-md">
            {episodes} {episodes === 1 ? "Ep" : "Eps"}
          </div>
        ) : null}
      </div>

      {/* Card Details */}
      <div className="p-3 flex flex-col justify-between flex-1 gap-1">
        <h3 className="font-semibold text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors text-foreground">
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[120px]">
            {anime.genres?.[0] || anime.seasonYear || anime.status || "Anime"}
          </span>
          {anime.seasonYear && (
            <span className="text-[11px] font-mono text-muted-foreground/80">
              {anime.seasonYear}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
