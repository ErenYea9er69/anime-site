export interface UserProfile {
  [x: string]: string | number;
  id: number;
  name: string;
  avatar?: {
    medium?: string;
  };
}

export interface AnimeListEntry {
  status: string;
  id: number | null;
  mediaId: number | null;
  progress: number | null;
  media: {
    genres: any;
    id: number;
    title: {
      english?: string;
      romaji?: string;
    };
    coverImage?: {
      large?: string;
    };
    episodes?: number;
    status?: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  lists: AnimeListEntry[];
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  lists?: AnimeListEntry[];
  error?: string;
}