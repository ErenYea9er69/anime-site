"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { updateAnimeProgress } from "@/modules/anilist/anilistsAPI";

interface WatchProgress {
  animeId: number;
  episodeNumber: number;
  timestamp: number;
  progress: number;
  duration: number;
  title: string;
  coverImage: string;
  totalEpisodes?: number;
}

export function useWatchProgress() {
  const { isAuthenticated, lists, updateLists } = useAuth();
  const [localProgress, setLocalProgress] = useLocalStorage<Record<string, WatchProgress>>("watch-progress", {});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && lists) {
      // Convert AniList progress to local format
      const progress: Record<string, WatchProgress> = {};
      lists.forEach(item => {
        if (item.progress) {
          progress[item.media.id] = {
            animeId: item.media.id,
            episodeNumber: item.progress,
            timestamp: Date.now(),
            progress: 100,
            duration: 24 * 60,
            title: item.media.title?.english || item.media.title?.romaji || '',
            coverImage: item.media.coverImage?.large || '',
            totalEpisodes: item.media.episodes
          };
        }
      });
      setLocalProgress(progress);
    }
    setIsLoading(false);
  }, [isAuthenticated, lists]);

  const updateProgress = async (
    animeId: number,
    episodeNumber: number,
    progress: number,
    duration: number,
    title: string,
    coverImage: string,
    totalEpisodes?: number
  ) => {
    // Update local storage
    const key = animeId.toString();
    setLocalProgress(prev => ({
      ...prev,
      [key]: {
        animeId,
        episodeNumber,
        timestamp: Date.now(),
        progress,
        duration,
        title,
        coverImage,
        totalEpisodes
      }
    }));

    // Update AniList if authenticated
    if (isAuthenticated) {
      await updateAnimeProgress(animeId, episodeNumber);
      
      // Update local state
      const updatedLists = lists?.map(item =>
        item.media.id === animeId ? { ...item, progress: episodeNumber } : item
      ) || [];
      updateLists(updatedLists);
    }
  };

  const getProgress = (animeId: number): number | null => {
    if (isAuthenticated) {
      const entry = lists?.find(item => item.media.id === animeId);
      return entry?.progress || null;
    } else {
      return localProgress[animeId]?.episodeNumber || null;
    }
  };

  return {
    updateProgress,
    getProgress,
    isLoading,
  };
}