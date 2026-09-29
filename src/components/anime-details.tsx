"use client";

import React from "react";
import Image from "next/image";
import { WatchButton } from "@/components/watch-button";
import { WatchlistButton } from "@/components/watchlist/watchlist-button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Film, Calendar, Building, Sparkles } from "lucide-react";
import type { Anime } from "@/lib/anilist";
import type { Media } from "@/types/anilistGraphQLTypes";

export function AnimeDetails({ anime }: { anime: Media | Anime }) {
  const title =
    anime.title?.english ||
    anime.title?.romaji ||
    (anime.title as any)?.userPreferred ||
    "Anime";
  const backdrop =
    anime.bannerImage ||
    (anime.coverImage as any)?.extraLarge ||
    anime.coverImage?.large ||
    "";
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const cleanDesc = anime.description ? anime.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

  return (
    <div className="relative">
      {/* Cinematic Banner Backdrop */}
      <div className="relative h-[32vh] sm:h-[42vh] lg:h-[50vh] w-full overflow-hidden bg-black">
        <Image
          src={backdrop}
          alt={title}
          fill
          className="object-cover object-center brightness-[0.45] blur-[1px] scale-105"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/60" />
      </div>

      {/* Main Content Area */}
      <div className="container relative -mt-24 sm:-mt-32 lg:-mt-40 z-10 pb-8">
        <div className="grid gap-6 md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] items-start">
          {/* Poster Image */}
          <div className="relative aspect-[3/4] w-48 sm:w-full mx-auto sm:mx-0 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/80 bg-muted">
            <Image
              src={(anime.coverImage as any)?.extraLarge || anime.coverImage?.large || backdrop}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 200px, (max-width: 1024px) 240px, 300px"
            />
          </div>

          {/* Details Column */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {anime.format && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-primary text-primary-foreground">
                    {anime.format.replace("_", " ")}
                  </span>
                )}
                {score && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-md bg-black/60 backdrop-blur-md text-amber-400 border border-amber-500/20">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {score}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-muted-foreground font-medium">
                  {anime.status || "Finished"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                {title}
              </h1>

              {anime.title?.romaji && anime.title.romaji !== title && (
                <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                  {anime.title.romaji}
                </p>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5">
              {anime.genres?.map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="bg-white/5 hover:bg-white/10 border-white/10 text-xs text-muted-foreground hover:text-foreground"
                >
                  {genre}
                </Badge>
              ))}
            </div>

            {/* Synopsis */}
            {cleanDesc && (
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4 max-w-3xl">
                {cleanDesc}
              </p>
            )}

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <WatchButton anime={anime as any} size="lg" />
              <WatchlistButton anime={anime as any} size="lg" variant="secondary" />
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <div className="p-2.5 rounded-lg bg-card/40 border border-white/5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                  Episodes
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {anime.episodes ? `${anime.episodes} Episodes` : "Ongoing"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-card/40 border border-white/5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                  Duration
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {anime.duration ? `${anime.duration}m / Ep` : "N/A"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-card/40 border border-white/5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                  Season
                </span>
                <span className="text-sm font-semibold text-foreground truncate block">
                  {anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : "N/A"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-card/40 border border-white/5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                  Studio
                </span>
                <span className="text-sm font-semibold text-foreground truncate block">
                  {(anime as any)?.studios?.nodes?.[0]?.name || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}