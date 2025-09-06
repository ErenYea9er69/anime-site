"use client";

import { GENRES, SEASONS, FORMATS, SORTS } from "@/constants/anilist";
import { SearchFilters as Filters } from "@/types/search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const handleGenreToggle = (genre: string) => {
    const newGenres = filters.genres?.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...(filters.genres || []), genre];
    onFilterChange({ ...filters, genres: newGenres });
  };

  const handleSeasonToggle = (season: string) => {
    const newSeasons = filters.seasons?.includes(season)
      ? filters.seasons.filter(s => s !== season)
      : [...(filters.seasons || []), season];
    onFilterChange({ ...filters, seasons: newSeasons });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Year</h3>
        <Input
          type="number"
          placeholder="Enter year..."
          value={filters.year}
          onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
          min={1960}
          max={new Date().getFullYear() + 1}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="font-medium">Format</h3>
        <Select
          value={filters.format || ""}
          onValueChange={(value) => onFilterChange({ ...filters, format: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any format" />
          </SelectTrigger>
          <SelectContent>
            {FORMATS.map((format) => (
              <SelectItem key={format.value} value={format.value}>
                {format.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="font-medium">Sort By</h3>
        <Select
          value={filters.sort || "TRENDING_DESC"}
          onValueChange={(value) => onFilterChange({ ...filters, sort: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((sort) => (
              <SelectItem key={sort.value} value={sort.value}>
                {sort.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="font-medium">Seasons</h3>
        <div className="flex flex-wrap gap-2">
          {SEASONS.slice(1).map((season) => (
            <Badge
              key={season.value}
              variant={filters.seasons?.includes(season.value) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleSeasonToggle(season.value)}
            >
              {season.label}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="font-medium">Genres</h3>
        <div className="flex flex-wrap gap-2">
          {GENRES.slice(1).map((genre) => (
            <Badge
              key={genre.value}
              variant={filters.genres?.includes(genre.value) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleGenreToggle(genre.value)}
            >
              {genre.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}