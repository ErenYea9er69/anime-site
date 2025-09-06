export type WatchStatus = "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";

export interface WatchlistEntry {
  id: number;
  status: WatchStatus;
  progress: number;
  score?: number;
  media: {
    id: number;
    title: {
      english?: string;
      romaji?: string;
    };
    coverImage?: {
      large?: string;
    };
    episodes?: number;
    genres?: string[];
  };
  updatedAt: number;
}