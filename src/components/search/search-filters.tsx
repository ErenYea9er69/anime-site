"use client";

import { useState, useMemo } from "react";
import { GENRES, POPULAR_THEMES, SEASONS, FORMATS, SORTS } from "@/constants/anilist";
import { SearchFilters as Filters } from "@/types/search";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Flame, Sparkles, Filter, Search, Tag } from "lucide-react";
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
  const [categorySearch, setCategorySearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "genres" | "themes">("all");

  const handleGenreToggle = (genre: string) => {
    const isSelected = filters.genres?.includes(genre);
    const newGenres = isSelected
      ? filters.genres?.filter((g) => g !== genre)
      : [...(filters.genres || []), genre];

    const isHentai = genre.toLowerCase() === "hentai";
    const newIsAdult = isHentai && !isSelected ? true : filters.isAdult;

    onFilterChange({
      ...filters,
      genres: newGenres,
      isAdult: newIsAdult,
    });
  };

  const handleTagToggle = (tag: string) => {
    const isSelected = filters.tags?.includes(tag);
    const newTags = isSelected
      ? filters.tags?.filter((t) => t !== tag)
      : [...(filters.tags || []), tag];

    onFilterChange({
      ...filters,
      tags: newTags,
    });
  };

  const handleSeasonToggle = (season: string) => {
    const newSeasons = filters.seasons?.includes(season)
      ? filters.seasons.filter((s) => s !== season)
      : [...(filters.seasons || []), season];
    onFilterChange({ ...filters, seasons: newSeasons });
  };

  const handleAdultToggle = () => {
    const nextAdult = !filters.isAdult;
    onFilterChange({ ...filters, isAdult: nextAdult });
  };

  // Filter genres and themes by search input
  const filteredGenres = useMemo(() => {
    return GENRES.slice(1).filter((g) =>
      g.label.toLowerCase().includes(categorySearch.toLowerCase().trim())
    );
  }, [categorySearch]);

  const filteredThemes = useMemo(() => {
    return POPULAR_THEMES.filter((t) =>
      t.label.toLowerCase().includes(categorySearch.toLowerCase().trim())
    );
  }, [categorySearch]);

  return (
    <div className="space-y-4 text-sm">
      {/* 18+ Adult Content Toggle */}
      <div
        onClick={handleAdultToggle}
        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
          filters.isAdult
            ? "border-pink-500/50 bg-pink-500/10 text-pink-300 shadow-sm shadow-pink-500/10"
            : "border-white/10 bg-white/2 hover:bg-white/5 text-muted-foreground hover:text-foreground"
        }`}
      >
        <div className="flex items-center gap-2">
          <Flame className={`h-4 w-4 ${filters.isAdult ? "text-pink-400" : "text-zinc-400"}`} />
          <div>
            <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              <span>18+ Adult Anime</span>
              <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-pink-600 text-white">
                18+
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              {filters.isAdult ? "Hentai & Adult content included" : "Filtered for general audiences"}
            </div>
          </div>
        </div>
        <div
          className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
            filters.isAdult ? "bg-pink-600 justify-end" : "bg-zinc-700 justify-start"
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
        </div>
      </div>

      <Separator />

      {/* Sort By */}
      <div className="space-y-2">
        <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>Sort By</span>
        </h3>
        <Select
          value={filters.sort || "TRENDING_DESC"}
          onValueChange={(value) => onFilterChange({ ...filters, sort: value })}
        >
          <SelectTrigger className="w-full h-9 bg-card/50">
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

      {/* Format */}
      <div className="space-y-2">
        <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
          Format
        </h3>
        <Select
          value={filters.format || "ALL"}
          onValueChange={(value) =>
            onFilterChange({ ...filters, format: value === "ALL" ? "" : value })
          }
        >
          <SelectTrigger className="w-full h-9 bg-card/50">
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

      {/* Year */}
      <div className="space-y-2">
        <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
          Release Year
        </h3>
        <Input
          type="number"
          placeholder="e.g. 2024"
          value={filters.year || ""}
          onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
          min={1970}
          max={new Date().getFullYear() + 1}
          className="h-9 bg-card/50"
        />
      </div>

      {/* Seasons */}
      <div className="space-y-2">
        <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
          Season
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {SEASONS.slice(1).map((season) => (
            <Badge
              key={season.value}
              variant={filters.seasons?.includes(season.value) ? "default" : "outline"}
              className="cursor-pointer text-xs transition-colors hover:border-primary/50"
              onClick={() => handleSeasonToggle(season.value)}
            >
              {season.label}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Categories & Genres Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-primary" />
            <span>Categories & Genres</span>
          </h3>
          {(filters.genres?.length || filters.tags?.length) ? (
            <span className="text-[11px] text-primary font-mono font-medium">
              {(filters.genres?.length || 0) + (filters.tags?.length || 0)} selected
            </span>
          ) : null}
        </div>

        {/* Category search input */}
        <div className="relative">
          <Input
            placeholder="Search categories (e.g. Hentai, Isekai)..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="h-8 text-xs pr-7 bg-card/50"
          />
          <Search className="h-3.5 w-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* Category Tabs: All / Genres / Themes */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
              activeTab === "all" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("genres")}
            className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
              activeTab === "genres" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Genres
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("themes")}
            className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
              activeTab === "themes" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Themes
          </button>
        </div>

        {/* Genres List */}
        {(activeTab === "all" || activeTab === "genres") && filteredGenres.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Official Genres
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredGenres.map((genre) => {
                const isSelected = filters.genres?.includes(genre.value);
                const isHentai = genre.value.toLowerCase() === "hentai";

                return (
                  <Badge
                    key={genre.value}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer text-xs transition-all ${
                      isHentai
                        ? isSelected
                          ? "bg-pink-600 text-white hover:bg-pink-500 shadow-sm shadow-pink-600/30 font-bold"
                          : "border-pink-500/40 text-pink-400 hover:bg-pink-500/10 hover:border-pink-500"
                        : isSelected
                        ? "bg-primary text-primary-foreground"
                        : "border-white/10 hover:border-primary/50"
                    }`}
                    onClick={() => handleGenreToggle(genre.value)}
                  >
                    {isHentai && <Flame className="h-3 w-3 mr-1 text-pink-300 inline" />}
                    {genre.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Themes & Popular Categories List */}
        {(activeTab === "all" || activeTab === "themes") && filteredThemes.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Popular Categories & Themes
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredThemes.map((theme) => {
                const isSelected = filters.tags?.includes(theme.value);
                return (
                  <Badge
                    key={theme.value}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer text-xs transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "border-white/10 hover:border-primary/50"
                    }`}
                    onClick={() => handleTagToggle(theme.value)}
                  >
                    {theme.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}