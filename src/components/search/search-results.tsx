"use client";

import { useEffect, useRef } from "react";
import { AnimeGrid } from "@/components/anime-grid";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Media } from "@/types/anilistGraphQLTypes";
import { Button } from "@/components/ui/button";

interface SearchResultsProps {
  results: Media[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function SearchResults({ 
  results, 
  isLoading, 
  error, 
  hasMore,
  onLoadMore 
}: SearchResultsProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={onLoadMore}>Try Again</Button>
      </div>
    );
  }

  if (!results.length && !isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] text-center">
        <p className="text-muted-foreground">No results found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AnimeGrid anime={results} />
      
      <div ref={observerTarget} className="h-8 flex items-center justify-center">
        {isLoading && <LoadingSpinner />}
      </div>
    </div>
  );
}