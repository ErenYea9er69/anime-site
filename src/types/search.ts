export interface SearchFilters {
  query?: string;
  genres?: string[];
  seasons?: string[];
  year?: string;
  format?: string;
  sort?: string;
}

export interface SearchState extends SearchFilters {
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}