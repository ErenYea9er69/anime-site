"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { ListAnimeData } from '@/types/anilistAPITypes';
import { getAnimeInfo } from '@/modules/anilist/anilistsAPI';
import {
  getAnimeHistory,
  getHistoryEntries,
  getLastWatchedEpisode,
  setAnimeHistory,
} from '../modules/history';

interface HistoryContextType {
  historyAnime: ListAnimeData[];
  recommendedAnime: ListAnimeData[];
  updateHistory: () => Promise<void>;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [historyAnime, setHistoryAnime] = useState<ListAnimeData[]>([]);
  const [recommendedAnime, setRecommendedAnime] = useState<ListAnimeData[]>([]);

  const updateRecommended = async (history: ListAnimeData[]) => {
    const animeData = history[Math.floor(Math.random() * (history.length - 1))];
    
    if (!animeData.media.recommendations) {
      animeData.media = await getAnimeInfo(animeData.media.id);
      const entry = getAnimeHistory(animeData.media.id as number);
      if (entry) {
        entry.data = animeData;
        setAnimeHistory(entry);
      }
    }

    const recommendedList = animeData.media.recommendations?.nodes.map(value => ({
      id: null,
      mediaId: null,
      progress: null,
      media: value.mediaRecommendation,
    } as ListAnimeData)) || [];

    recommendedList.push(animeData);
    setRecommendedAnime(recommendedList);
  };
  const sortNewest = (a: ListAnimeData, b: ListAnimeData) => {
    (getLastWatchedEpisode(
      (b.media.id ??
        (b.media.mediaListEntry && b.media.mediaListEntry.id)) as number,
    )?.timestamp ?? 0) -
    (getLastWatchedEpisode(
      (a.media.id ??
        (a.media.mediaListEntry && a.media.mediaListEntry.id)) as number,
    )?.timestamp ?? 0);
  }

  const updateHistory = async () => {
    const entries = getHistoryEntries();
    const historyAvailable = Object.values(entries).length > 0;
  
    if (historyAvailable) {
      const result = Object.values(entries)
        .map(value => value.data)
        .sort((a, b) => {
          const aTimestamp = getLastWatchedEpisode(
            (a.media.id ?? (a.media.mediaListEntry && a.media.mediaListEntry.id)) as number
          )?.timestamp ?? 0;
          const bTimestamp = getLastWatchedEpisode(
            (b.media.id ?? (b.media.mediaListEntry && b.media.mediaListEntry.id)) as number
          )?.timestamp ?? 0;
          return bTimestamp - aTimestamp;
        });
  
      setHistoryAnime(result);
    }
  };  

  useEffect(() => {
    updateHistory();
  }, []);

  return (
    <HistoryContext.Provider value={{ historyAnime, recommendedAnime, updateHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) throw new Error('useHistory must be used within HistoryProvider');
  return context;
};
