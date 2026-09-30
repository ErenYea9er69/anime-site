"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search, Flame, Sparkles } from "lucide-react";
import { searchFilteredAnimeSlim } from "@/modules/anilist/anilistsAPI";
import { Media } from "@/types/anilistGraphQLTypes";
import { SearchFilters as Filters } from "@/types/search";
import { filterSupportedAnime } from "@/utils/animeSupport";

export function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams ? searchParams.get("q") || "" : "";
  const initialGenre = searchParams ? searchParams.get("genre") || searchParams.get("category") || "" : "";
  const initialTag = searchParams ? searchParams.get("tag") || "" : "";
  const initialFormat = searchParams ? searchParams.get("format") || "" : "";
  const initialSort = searchParams ? searchParams.get("sort") || "TRENDING_DESC" : "TRENDING_DESC";
  const initialAdult = searchParams
    ? searchParams.get("adult") === "true" || initialGenre.toLowerCase() === "hentai"
    : false;

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    genres: initialGenre ? [initialGenre] : [],
    tags: initialTag ? [initialTag] : [],
    seasons: [],
    year: "",
    format: initialFormat,
    sort: initialSort,
    isAdult: initialAdult,
  });

  const buildSearchQuery = useCallback((currentFilters: Filters, searchTerm: string) => {
    let queryArgs = "type: ANIME";

    // Delete and exclude unreleased and pure music anime (no streaming API support)
    queryArgs += ", status_not: NOT_YET_RELEASED, format_not: MUSIC";

    if (searchTerm && searchTerm.trim()) {
      const clean = searchTerm.trim().replace(/["\\]/g, "");
      queryArgs += `, search: "${clean}"`;
    }

    if (currentFilters.genres?.length) {
      const quoted = currentFilters.genres.map((g) => `"${g}"`).join(", ");
      queryArgs += `, genre_in: [${quoted}]`;
    }

    if (currentFilters.tags?.length) {
      const quoted = currentFilters.tags.map((t) => `"${t}"`).join(", ");
      queryArgs += `, tag_in: [${quoted}]`;
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

    // Include adult anime when adult filter or Hentai category is enabled
    const hasAdultGenre = currentFilters.genres?.some((g) => g.toLowerCase() === "hentai");
    if (currentFilters.isAdult || hasAdultGenre) {
      queryArgs += ", isAdult: true";
    }

    return queryArgs;
  }, []);

  const handleSearch = useCallback(
    async (resetResults = true, overrideQuery?: string, overrideFilters?: Filters) => {
      try {
        setIsLoading(true);
        setError(null);

        const qToUse = overrideQuery !== undefined ? overrideQuery : query;
        const fToUse = overrideFilters !== undefined ? overrideFilters : filters;
        const currentPageToFetch = resetResults ? 1 : page;

        const searchQuery = buildSearchQuery(fToUse, qToUse);
        // Fetch 48 per page to display more anime
        const data = await searchFilteredAnimeSlim(searchQuery, currentPageToFetch, 48);

        const rawList: Media[] = data?.media ? (data.media as Media[]) : [];
        // Strictly filter out any anime without streaming API support
        const supportedList = filterSupportedAnime(rawList);

        if (supportedList.length === 0 && rawList.length === 0) {
          if (resetResults) setResults([]);
          setHasMore(false);
          return;
        }

        setResults((prev) => (resetResults ? supportedList : [...prev, ...supportedList]));
        setHasMore(data?.pageInfo?.hasNextPage || false);
        setPage((prev) => (resetResults ? 2 : prev + 1));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search anime");
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, page, query, buildSearchQuery]
  );

  // Initial load
  useEffect(() => {
    handleSearch(true, initialQ, {
      genres: initialGenre ? [initialGenre] : [],
      tags: initialTag ? [initialTag] : [],
      seasons: [],
      year: "",
      format: initialFormat,
      sort: initialSort,
      isAdult: initialAdult,
    });
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

  const handleRemoveGenre = (genre: string) => {
    const updated = {
      ...filters,
      genres: filters.genres?.filter((g) => g !== genre),
    };
    setFilters(updated);
    handleSearch(true, query, updated);
  };

  const handleRemoveTag = (tag: string) => {
    const updated = {
      ...filters,
      tags: filters.tags?.filter((t) => t !== tag),
    };
    setFilters(updated);
    handleSearch(true, query, updated);
  };

  const handleClear = () => {
    setQuery("");
    const defaultFilters: Filters = {
      genres: [],
      tags: [],
      seasons: [],
      year: "",
      format: "",
      sort: "TRENDING_DESC",
      isAdult: false,
    };
    setFilters(defaultFilters);
    setResults([]);
    setPage(1);
    setHasMore(true);
    router.push("/search");
    handleSearch(true, "", defaultFilters);
  };

  const hasActiveFilters = Boolean(
    query ||
    filters.genres?.length ||
    filters.tags?.length ||
    filters.seasons?.length ||
    filters.year ||
    filters.format ||
    filters.isAdult
  );

  return (
    <div className="container py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Streaming Anime Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Explore Anime
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Browse all categories, genres, formats, and mature 18+ titles with full streaming API support.
          </p>
        </div>

        {results.length > 0 && (
          <div className="text-xs text-muted-foreground bg-card/60 border border-white/5 px-3 py-1.5 rounded-lg w-fit">
            Showing <strong className="text-foreground">{results.length}</strong> watchable anime
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Left Filter Sidebar */}
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
                className="pr-8 bg-card/50"
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

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClear}
              className="w-full text-xs text-muted-foreground hover:text-destructive border-destructive/20"
            >
              Reset all filters
            </Button>
          )}
        </aside>

        {/* Right Results Grid */}
        <main className="min-w-0 space-y-4">
          {/* Active Filter Pills Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-lg bg-card/30 border border-white/5 text-xs">
              <span className="text-muted-foreground mr-1 font-medium text-[11px]">Active:</span>

              {filters.isAdult && (
                <Badge
                  variant="outline"
                  className="bg-pink-600/20 text-pink-300 border-pink-500/40 gap-1 pr-1.5 py-0.5"
                >
                  <Flame className="h-3 w-3 text-pink-400" />
                  <span>18+ Adult Included</span>
                  <button
                    type="button"
                    onClick={() => handleFilterChange({ ...filters, isAdult: false })}
                    className="ml-1 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.genres?.map((g) => (
                <Badge
                  key={g}
                  variant="outline"
                  className={`gap-1 pr-1.5 py-0.5 ${
                    g.toLowerCase() === "hentai"
                      ? "bg-pink-600 text-white border-pink-400 font-semibold"
                      : "bg-primary/20 text-primary border-primary/40"
                  }`}
                >
                  <span>{g}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGenre(g)}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {filters.tags?.map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className="bg-primary/20 text-primary border-primary/40 gap-1 pr-1.5 py-0.5"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {filters.format && filters.format !== "ALL" && (
                <Badge variant="outline" className="gap-1 pr-1.5 py-0.5 border-white/20">
                  <span>Format: {filters.format}</span>
                  <button
                    type="button"
                    onClick={() => handleFilterChange({ ...filters, format: "" })}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.year && (
                <Badge variant="outline" className="gap-1 pr-1.5 py-0.5 border-white/20">
                  <span>Year: {filters.year}</span>
                  <button
                    type="button"
                    onClick={() => handleFilterChange({ ...filters, year: "" })}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <button
                type="button"
                onClick={handleClear}
                className="ml-auto text-[11px] text-muted-foreground hover:text-destructive underline"
              >
                Clear all
              </button>
            </div>
          )}

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