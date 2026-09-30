"use client";

import Link from "next/link";
import { Flame, Sparkles, Film, Compass } from "lucide-react";

interface CategoryChip {
  label: string;
  href: string;
  isAdult?: boolean;
  isMovie?: boolean;
  icon?: any;
}

const FEATURED_CATEGORIES: CategoryChip[] = [
  { label: "Action", href: "/search?genre=Action" },
  { label: "Isekai", href: "/search?tag=Isekai" },
  { label: "Romance", href: "/search?genre=Romance" },
  { label: "Comedy", href: "/search?genre=Comedy" },
  { label: "Fantasy", href: "/search?genre=Fantasy" },
  { label: "Sci-Fi", href: "/search?genre=Sci-Fi" },
  { label: "Supernatural", href: "/search?genre=Supernatural" },
  { label: "Movies", href: "/search?format=MOVIE", isMovie: true, icon: Film },
  { label: "Shounen", href: "/search?tag=Shounen" },
  { label: "Seinen", href: "/search?tag=Seinen" },
  { label: "Drama", href: "/search?genre=Drama" },
  { label: "Ecchi", href: "/search?genre=Ecchi" },
  { label: "Hentai (18+)", href: "/search?genre=Hentai&adult=true", isAdult: true, icon: Flame },
];

export function CategoryChips() {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span>Browse By Category</span>
        </div>
        <Link
          href="/search"
          className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
        >
          <span>All Categories & Filters</span>
          <span>→</span>
        </Link>
      </div>

      <div
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {FEATURED_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.label}
              href={cat.href}
              className={`flex-none inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 ${
                cat.isAdult
                  ? "bg-pink-600/10 border-pink-500/30 text-pink-300 hover:bg-pink-600 hover:text-white hover:border-pink-500 shadow-sm shadow-pink-600/10"
                  : cat.isMovie
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-black hover:border-amber-500"
                  : "bg-card/70 border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 hover:border-primary/40"
              }`}
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
              <span>{cat.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
