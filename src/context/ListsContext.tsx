"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import type { ListAnimeData, CurrentListAnime } from '@/types/anilistAPITypes';
import { syncLocalWatchlist } from "@/modules/anilist/anilistsAPI";
import { useAuth } from '@/hooks/useAuth';
interface ListsContextType {
  currentLists: CurrentListAnime;
  setCurrentLists: (lists: CurrentListAnime) => void;
  isListsLoading: boolean;
  setIsListsLoading: (loading: boolean) => void;
}

const ListsContext = createContext<ListsContextType | null>(null);

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const [currentLists, setCurrentLists] = useState<CurrentListAnime>([]);
  const [isListsLoading, setIsListsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const syncWatchlist = async () => {
      if (isAuthenticated) { // Only sync if authenticated
        try {
          const getWatchlist = () => ({ watchlist: [] });
          await syncLocalWatchlist(getWatchlist, (toast) => {
            console.log(toast); // Log the toast message
            // You may want to use a toast library to display the message
          });
          // Update the currentLists state after syncing
          const syncedLists = await getWatchlist();
          setCurrentLists(syncedLists.watchlist);
        } catch (error) {
          console.error("Error syncing watchlist:", error);
          // Handle error, e.g., display a toast notification
        }
      }
    };
    syncWatchlist(); // Call the function on mount or when authentication status changes
  }, [isAuthenticated]);

  return (
    <ListsContext.Provider value={{ currentLists, setCurrentLists, isListsLoading, setIsListsLoading }}>
      {children}
    </ListsContext.Provider>
  );
}

export const useLists = () => {
  const context = useContext(ListsContext);
  if (!context) throw new Error('useLists must be used within ListsProvider');
  return context;
};
