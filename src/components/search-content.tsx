"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { searchFilteredAnimeSlim } from "@/modules/anilist/anilistsAPI";
import { Media } from "@/types/anilistGraphQLTypes";
import { SearchFilters as Filters } from "@/types/search";

export function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams ? searchParams.get("q") || "" : "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    genres: [],
    seasons: [],
    year: "",
    format: "",
    sort: "TRENDING_DESC"
  });

  const buildSearchQuery = useCallback((currentFilters: Filters, searchTerm: string) => {
    let queryArgs = "type: ANIME";
    
    if (searchTerm && searchTerm.trim()) {
      const clean = searchTerm.trim().replace(/["\\]/g, "");
      queryArgs += `, search: "${clean}"`;
    }

    if (currentFilters.genres?.length) {
      const quoted = currentFilters.genres.map(g => `"${g}"`).join(", ");
      queryArgs += `, genre_in: [${quoted}]`;
    }
    
    if (currentFilters.seasons?.length) {
      queryArgs += `, season_in: [${currentFilters.seasons.join(", ")}]`;
    }
    
    if (currentFilters.year) {
      queryArgs += `, seasonYear: ${currentFilters.year}`;
    }
    
    if (currentFilters.format && currentFilters.format !== "ALL") {
      queryArgs += `, format: ${currentFilters.format}`;
    }
    
    if (currentFilters.sort && currentFilters.sort !== "ALL") {
      queryArgs += `, sort: ${currentFilters.sort}`;
    }

    return queryArgs;
  }, []);

  const handleSearch = useCallback(async (resetResults = true, overrideQuery?: string, overrideFilters?: Filters) => {
    try {
      setIsLoading(true);
      setError(null);

      const qToUse = overrideQuery !== undefined ? overrideQuery : query;
      const fToUse = overrideFilters !== undefined ? overrideFilters : filters;
      const currentPageToFetch = resetResults ? 1 : page;

      const searchQuery = buildSearchQuery(fToUse, qToUse);
      const data = await searchFilteredAnimeSlim(searchQuery, currentPageToFetch, 36);

      const mediaList: Media[] = data?.media ? (data.media as Media[]) : [];
      if (mediaList.length === 0) {
        if (resetResults) setResults([]);
        setHasMore(false);
        return;
      }

      setResults((prev) => (resetResults ? mediaList : [...prev, ...mediaList]));
      setHasMore(data?.pageInfo?.hasNextPage || false);
      setPage((prev) => (resetResults ? 2 : prev + 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search anime");
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, query, buildSearchQuery]);

  // Initial load
  useEffect(() => {
    handleSearch(true, initialQ);
  }, []);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    handleSearch(true, query, newFilters);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      handleSearch(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    const defaultFilters: Filters = {
      genres: [],
      seasons: [],
      year: "",
      format: "",
      sort: "TRENDING_DESC"
    };
    setFilters(defaultFilters);
    setResults([]);
    setPage(1);
    setHasMore(true);
    router.push("/search");
    handleSearch(true, "", defaultFilters);
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Explore Anime</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search titles, filter by genres, seasons, and release formats.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4 rounded-xl border border-white/10 bg-card/40 p-4 backdrop-blur-sm h-fit">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(true);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Input
                placeholder="Search anime title..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-8"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" size="icon" className="shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <SearchFilters filters={filters} onFilterChange={handleFilterChange} />

          {(query || filters.genres?.length || filters.seasons?.length || filters.year || filters.format) && (
            <Button
              variant="outline"
              onClick={handleClear}
              className="w-full text-xs text-muted-foreground hover:text-destructive"
            >
              Reset all filters
            </Button>
          )}
        </aside>

        <main className="min-w-0">
          <SearchResults
            results={results}
            isLoading={isLoading}
            error={error}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </main>
      </div>
    </div>
  );
}