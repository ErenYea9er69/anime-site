"use client";
import React from "react";
import Image from "next/image";
import { WatchButton } from "@/components/watch-button";
import { WatchlistButton } from "@/components/watchlist/watchlist-button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Anime } from "@/lib/anilist";

export function AnimeDetails({ anime }: { anime: Anime }) {
  return (
    <div>
      <div className="relative h-[50vh] w-full overflow-hidden">
        <Image
          src={anime.bannerImage || anime.coverImage.large}
          alt={anime.title.english || anime.title.romaji}
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container relative -mt-32">
        <div className="grid gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border shadow-lg">
            <Image
              src={anime.coverImage.large}
              alt={anime.title.english || anime.title.romaji}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold">
              {anime.title.english || anime.title.romaji}
            </h1>
            
            <div className="flex flex-wrap gap-2">
              {anime.genres?.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 text-yellow-500" />
                <span>{anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "N/A"}</span>
              </div>
              <div>{anime.format}</div>
              <div>{anime.episodes} Episodes</div>
              {anime.duration && <div>{anime.duration} mins</div>}
            </div>

            <p className="text-muted-foreground">
              {anime.description?.replace(/<[^>]*>/g, "")}
            </p>

            <div className="flex gap-4">
              <WatchButton anime={anime} size="lg" />
              <WatchlistButton anime={anime} size="lg" variant="secondary" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                <p className="text-sm">{anime.status}</p>
              </div>
              {anime.season && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Season</h4>
                  <p className="text-sm">{`${anime.season} ${anime.seasonYear}`}</p>
                </div>
              )}
              {anime.studios?.nodes && anime.studios.nodes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Studio</h4>
                  <p className="text-sm">{anime.studios.nodes[0].name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}