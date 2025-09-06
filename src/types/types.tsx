export type EpisodeInfo = {
    image?: string;
    title?: {
      en?: string
    }
    summary?: string
    airdate?: string
    length?: string | number
    episodeNumber?: number
    episode?: string
  };
  
  interface EpisodeHistoryEntry {
    timestamp: number;
    time: number;
    data: {
      progress: number;
    }
  }
  
  export type EpisodeHistoryEntries = {
    [key: number]: EpisodeHistoryEntry;
  }
  
  
  export type ClientData = {
    clientId: number;
    redirectUri: string;
    clientSecret: string;
  };