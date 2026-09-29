"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Flame, Sparkles, SlidersHorizontal, Film } from "lucide-react";
import type { Anime } from "@/lib/anilist";
import { searchAnime } from "@/lib/actions";

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length >= 2) {
      setIsLoading(true);
      try {
        const data = await searchAnime(q.trim());
        setResults((data || []).slice(0, 6));
      } catch (error) {
        console.error("Error searching anime:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setResults([]);
    }
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 md:h-9 md:w-52 lg:w-64 md:justify-start md:px-3 md:py-2 rounded-lg border-white/10 bg-background/50 hover:bg-background/80 transition-all text-muted-foreground hover:text-foreground"
        onClick={() => {
          setOpen(true);
          if (query) performSearch(query);
        }}
        aria-label="Open search dialog"
      >
        <Search className="h-4 w-4 md:mr-2 shrink-0" />
        <span className="hidden md:inline-flex text-xs font-normal">Search anime...</span>
        <kbd className="pointer-events-none absolute right-2 top-1.5 hidden h-5 select-none items-center gap-0.5 rounded border border-white/10 bg-muted px-1.5 font-mono text-[10px] font-medium opacity-80 md:flex">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 border border-white/10 bg-background/95 backdrop-blur-xl max-w-xl shadow-2xl">
          <DialogTitle className="sr-only">Search Anime</DialogTitle>
          <Command className="bg-transparent [&_[cmdk-input]]:h-12">
            <div className="flex items-center border-b border-white/10 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <CommandInput
                placeholder="Search by title, character, or studio..."
                value={query}
                onValueChange={(val) => {
                  setQuery(val);
                  performSearch(val);
                }}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <CommandList className="max-h-[360px] overflow-y-auto p-2">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                {isLoading ? "Searching..." : "No anime found. Try another query."}
              </CommandEmpty>

              {isLoading && (
                <CommandLoading className="py-2 text-center text-xs text-muted-foreground">
                  Searching anime database...
                </CommandLoading>
              )}

              {results.length > 0 && (
                <CommandGroup heading="Results" className="text-xs text-muted-foreground">
                  {results.map((anime) => (
                    <CommandItem
                      key={anime.id}
                      onSelect={() => handleSelect(`/anime/${anime.id}`)}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
                    >
                      <div className="relative h-12 w-9 flex-none overflow-hidden rounded bg-muted">
                        <Image
                          src={anime.coverImage?.medium || anime.coverImage?.large || ""}
                          alt={anime.title?.english || anime.title?.romaji || "Anime"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate text-sm font-medium text-foreground">
                          {anime.title?.english || anime.title?.romaji}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {anime.format && <span className="uppercase text-[10px] font-semibold">{anime.format}</span>}
                          {anime.episodes && <span>• {anime.episodes} eps</span>}
                          {anime.averageScore && (
                            <span className="text-amber-400">★ {(anime.averageScore / 10).toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandGroup heading="Quick Navigation" className="text-xs text-muted-foreground mt-2 border-t border-white/5 pt-2">
                <CommandItem
                  onSelect={() => handleSelect("/trending")}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors text-sm"
                >
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span>Trending Anime</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect("/popular")}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors text-sm"
                >
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span>Popular This Season</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect(`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`)}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors text-sm"
                >
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <span>Advanced Search & Filters</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}