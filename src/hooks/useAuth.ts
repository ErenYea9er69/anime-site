import { authenticateUser, clearAuthSession, loadPersistedAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { AuthState, UserProfile, AnimeListEntry } from "@/types/auth";
import { useRouter } from 'next/navigation';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  lists: [],
  isLoading: true,
  error: null
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter(); // Add the router hook


  useEffect(() => {
    const loadAuth = async () => {
      // Check both access token and user data
      const accessToken = sessionStorage.getItem("access_token");
      const userData = sessionStorage.getItem("user_data");
      const listsData = sessionStorage.getItem("anime_lists");

      if (accessToken && userData) {
        setState({
          isAuthenticated: true,
          user: JSON.parse(userData),
          lists: listsData ? JSON.parse(listsData) : [],
          isLoading: false,
          error: null
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadAuth();
  }, []);

  const login = async (token: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authenticateUser(token);
      
      if (response.success && response.user && response.lists) {
        setState({
          isAuthenticated: true,
          user: response.user,
          lists: response.lists,
          isLoading: false,
          error: null
        });
        
        router.refresh(); // Refresh the current page after successful login
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || "Authentication failed"
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "An unexpected error occurred"
      }));
      return false;
    }
  };

  const logout = () => {
    clearAuthSession();
    setState({
      isAuthenticated: false,
      user: null,
      lists: [],
      isLoading: false,
      error: null
    });
  };

  const updateLists = (newLists: AnimeListEntry[]) => {
    setState(prev => ({
      ...prev,
      lists: newLists
    }));
    sessionStorage.setItem("anime_lists", JSON.stringify(newLists));
  };

  return {
    ...state,
    login,
    logout,
    updateLists
  };
}