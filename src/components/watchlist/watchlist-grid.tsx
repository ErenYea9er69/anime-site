"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WatchlistEntry } from "@/types/watchlist";

interface WatchlistGridProps {
  entries: WatchlistEntry[];
}

export function WatchlistGrid({ entries }: WatchlistGridProps) {
  if (!entries.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No entries found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          href={`/anime/${entry.media.id}`}
          className="transition-transform hover:scale-[1.02]"
        >
          <Card className="overflow-hidden h-full">
            <div className="aspect-[2/3] relative">
              <Image
                src={entry.media.coverImage?.large || ""}
                alt={entry.media.title?.english || entry.media.title?.romaji || ""}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            </div>
            <div className="p-3 space-y-2">
              <h3 className="font-medium text-sm line-clamp-1">
                {entry.media.title?.english || entry.media.title?.romaji}
              </h3>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>
                  {entry.progress} / {entry.media.episodes || "?"}
                </span>
              </div>
              <Progress 
                value={entry.media.episodes ? (entry.progress / entry.media.episodes) * 100 : 0} 
                className="h-1"
              />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}