"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { searchFilteredAnime } from "@/modules/anilist/anilistsAPI";
import { Media } from "@/types/anilistGraphQLTypes";
import { SearchFilters as Filters } from "@/types/search";

export function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
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

  const buildSearchQuery = useCallback((currentFilters: Filters) => {
    let query = "type: ANIME";
    
    if (currentFilters.genres?.length) {
      query += `, genre_in: [${currentFilters.genres.join(", ")}]`;
    }
    
    if (currentFilters.seasons?.length) {
      query += `, season_in: [${currentFilters.seasons.join(", ")}]`;
    }
    
    if (currentFilters.year) {
      query += `, seasonYear: ${currentFilters.year}`;
    }
    
    if (currentFilters.format) {
      query += `, format: ${currentFilters.format}`;
    }
    
    if (currentFilters.sort) {
      query += `, sort: ${currentFilters.sort}`;
    }

    return query;
  }, []);

  const handleSearch = useCallback(async (resetResults = true) => {
    try {
      setIsLoading(true);
      setError(null);

      const searchQuery = buildSearchQuery(filters);
      const data = await searchFilteredAnime(searchQuery, null, resetResults ? 1 : page);

      if (!data?.media) {
        throw new Error("No results found");
      }

      setResults(prev => resetResults ? data.media : [...prev, ...data.media]);
      setHasMore(data.pageInfo?.hasNextPage || false);
      setPage(prev => resetResults ? 2 : prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search anime");
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, buildSearchQuery]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    handleSearch(true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      handleSearch(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setFilters({
      genres: [],
      seasons: [],
      year: "",
      format: "",
      sort: "TRENDING_DESC"
    });
    setResults([]);
    setPage(1);
    setHasMore(true);
    router.push("/search");
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search anime..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(true)}
            />
            {(query || filters.genres?.length || filters.seasons?.length || filters.year || filters.format) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>

        <SearchResults
          results={results}
          isLoading={isLoading}
          error={error}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      </div>
    </div>
  );
}