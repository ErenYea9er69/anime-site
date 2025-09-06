"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { EPISODES_INFO_URL } from "@/constants/utils";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Episode {
  title: {
    en: string;
  };
  image: string;
  runtime: number;
}

interface EpisodeMapping {
  episodes: {
    [key: string]: Episode;
  };
}

interface EpisodeListProps {
  episodes: number;
  animeId: number;
  coverImage: string;
  bannerImage?: string;
}

const EPISODES_PER_PAGE = 24;
const MAX_VISIBLE_PAGES = 5;

export function EpisodeList({ episodes, animeId, coverImage, bannerImage }: EpisodeListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [episodeData, setEpisodeData] = useState<EpisodeMapping | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate pagination values
  const totalPages = Math.ceil(episodes / EPISODES_PER_PAGE);
  const startEpisode = (currentPage - 1) * EPISODES_PER_PAGE + 1;
  const endEpisode = Math.min(currentPage * EPISODES_PER_PAGE, episodes);

  // Generate visible page numbers
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
    let end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < MAX_VISIBLE_PAGES) {
      start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  // Get episodes for current page
  const currentEpisodes = useMemo(() => {
    return Array.from(
      { length: endEpisode - startEpisode + 1 },
      (_, i) => startEpisode + i
    );
  }, [startEpisode, endEpisode]);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      if (!animeId) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${EPISODES_INFO_URL}${animeId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch episode data');
        }
        
        const data = await response.json();
        setEpisodeData(data);
      } catch (error) {
        console.error("Error fetching episode data:", error);
        setError("Failed to load episode information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpisodeData();
  }, [animeId]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state with skeleton UI
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Episodes</h2>
          <div className="w-[120px] h-10 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: EPISODES_PER_PAGE }).map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-video bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Episodes</h2>
          <p className="text-sm text-muted-foreground">
            Showing episodes {startEpisode}-{endEpisode} of {episodes}
          </p>
        </div>

        {totalPages > 1 && (
          <Select
            value={currentPage.toString()}
            onValueChange={(value) => handlePageChange(parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Page" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <SelectItem key={page} value={page.toString()}>
                  Page {page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {currentEpisodes.map((episodeNumber) => {
          const episodeInfo = episodeData?.episodes?.[episodeNumber.toString()];
          const imageSource = episodeInfo?.image || bannerImage || coverImage;

          return (
            <Link 
              key={episodeNumber} 
              href={`/watch/${animeId}/${episodeNumber}`}
              className="transition-transform hover:scale-[1.02]"
            >
              <Card className="overflow-hidden h-full">
                <div className="group relative flex flex-col h-full">
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={imageSource}
                      alt={`Episode ${episodeNumber}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      priority={episodeNumber <= 4}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <PlayCircle className="h-12 w-12 text-white" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-4 flex-1">
                    <div>
                      <div className="font-medium">Episode {episodeNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {episodeInfo?.title?.en || `${episodeInfo?.runtime || 24}m`}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination className="justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>
            
            {currentPage > MAX_VISIBLE_PAGES && (
              <>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(1);
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4">...</span>
                </PaginationItem>
              </>
            )}
            
            {visiblePages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            {currentPage < totalPages - MAX_VISIBLE_PAGES + 1 && (
              <>
                <PaginationItem>
                  <span className="px-4">...</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(totalPages);
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                aria-disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}