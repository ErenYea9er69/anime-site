export interface CategoryItem {
  value: string;
  label: string;
  type: 'genre' | 'tag';
  isAdult?: boolean;
}

export const GENRES: Array<{ value: string; label: string; isAdult?: boolean }> = [
  { value: 'ALL', label: 'Any' },
  { value: 'Action', label: 'Action' },
  { value: 'Adventure', label: 'Adventure' },
  { value: 'Comedy', label: 'Comedy' },
  { value: 'Drama', label: 'Drama' },
  { value: 'Ecchi', label: 'Ecchi' },
  { value: 'Fantasy', label: 'Fantasy' },
  { value: 'Hentai', label: 'Hentai (18+)', isAdult: true },
  { value: 'Horror', label: 'Horror' },
  { value: 'Mahou Shoujo', label: 'Mahou Shoujo' },
  { value: 'Mecha', label: 'Mecha' },
  { value: 'Music', label: 'Music' },
  { value: 'Mystery', label: 'Mystery' },
  { value: 'Psychological', label: 'Psychological' },
  { value: 'Romance', label: 'Romance' },
  { value: 'Sci-Fi', label: 'Sci-Fi' },
  { value: 'Slice of Life', label: 'Slice of Life' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Supernatural', label: 'Supernatural' },
  { value: 'Thriller', label: 'Thriller' },
];

export const POPULAR_THEMES: Array<{ value: string; label: string; isAdult?: boolean }> = [
  { value: 'Isekai', label: 'Isekai' },
  { value: 'Shounen', label: 'Shounen' },
  { value: 'Seinen', label: 'Seinen' },
  { value: 'Shoujo', label: 'Shoujo' },
  { value: 'Josei', label: 'Josei' },
  { value: 'Super Power', label: 'Super Power' },
  { value: 'Martial Arts', label: 'Martial Arts' },
  { value: 'School', label: 'School' },
  { value: 'Military', label: 'Military' },
  { value: 'Demons', label: 'Demons' },
  { value: 'Vampire', label: 'Vampire' },
  { value: 'Historical', label: 'Historical' },
  { value: 'Space', label: 'Space' },
  { value: 'Cyberpunk', label: 'Cyberpunk' },
  { value: 'Post-Apocalyptic', label: 'Post-Apocalyptic' },
  { value: 'Survival', label: 'Survival' },
  { value: 'Female Harem', label: 'Harem' },
  { value: 'Yuri', label: 'Yuri' },
  { value: "Boys' Love", label: "Boys' Love" },
  { value: 'Gore', label: 'Gore' },
  { value: 'Parody', label: 'Parody' },
  { value: 'Work', label: 'Workplace' },
];

export const ALL_CATEGORIES: CategoryItem[] = [
  ...GENRES.filter((g) => g.value !== 'ALL').map((g) => ({
    value: g.value,
    label: g.label,
    type: 'genre' as const,
    isAdult: g.isAdult,
  })),
  ...POPULAR_THEMES.map((t) => ({
    value: t.value,
    label: t.label,
    type: 'tag' as const,
    isAdult: t.isAdult,
  })),
];

export const SEASONS = [
  { value: 'ALL', label: 'Any' },
  { value: 'WINTER', label: 'Winter' },
  { value: 'SPRING', label: 'Spring' },
  { value: 'SUMMER', label: 'Summer' },
  { value: 'FALL', label: 'Fall' },
];

export const FORMATS = [
  { value: 'ALL', label: 'Any Format' },
  { value: 'TV', label: 'TV Show' },
  { value: 'TV_SHORT', label: 'TV Short' },
  { value: 'MOVIE', label: 'Movie' },
  { value: 'SPECIAL', label: 'Special' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
];

export const SORTS = [
  { value: 'TRENDING_DESC', label: 'Trending' },
  { value: 'POPULARITY_DESC', label: 'Popularity' },
  { value: 'SCORE_DESC', label: 'Score' },
  { value: 'START_DATE_DESC', label: 'Release Date' },
];