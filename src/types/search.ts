export interface SearchFilters {
  query?: string;
  genres?: string[];
  tags?: string[];
  seasons?: string[];
  year?: string;
  format?: string;
  sort?: string;
  isAdult?: boolean;
}

export interface SearchState extends SearchFilters {
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}