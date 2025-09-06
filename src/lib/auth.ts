import { getAccessToken, getViewerId, getViewerInfo, getViewerLists } from "@/modules/anilist/anilistsAPI";
import type { AuthResponse, AnimeListEntry } from "@/types/auth";
import type { MediaListStatus } from "@/types/anilistGraphQLTypes";
import { clientData } from "@/modules/clientData";

export async function authenticateUser(token: string): Promise<AuthResponse> {
  try {
    const accessToken = await getAccessToken(token);
    if (!accessToken) {
      return { success: false, error: "Failed to obtain access token" };
    }

    sessionStorage.setItem("access_token", accessToken);

    const viewerId = await getViewerId();
    if (!viewerId) {
      return { success: false, error: "Failed to obtain user ID" };
    }

    const userData = await getViewerInfo(viewerId);
    if (!userData) {
      return { success: false, error: "Failed to fetch user data" };
    }

    // Store complete user data including avatar
    const userProfile = {
      id: userData.id,
      name: userData.name,
      avatar: {
        medium: userData.avatar?.medium
      }
    };
    
    sessionStorage.setItem("user_data", JSON.stringify(userProfile));
    sessionStorage.setItem("viewer_id", viewerId.toString());

    return {
      success: true,
      user: userProfile,
      lists: []
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed"
    };
  }
}

export function clearAuthSession(): void {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("viewer_id");
  sessionStorage.removeItem("anime_lists");
}

export function loadPersistedAuth(): AuthResponse {
  try {
    const accessToken = sessionStorage.getItem("access_token");
    const viewerId = sessionStorage.getItem("viewer_id");
    const listsData = sessionStorage.getItem("anime_lists");

    if (!accessToken || !viewerId) {
      return { success: false };
    }

    const lists = listsData ? JSON.parse(listsData) : [];

    return {
      success: true,
      lists
    };
  } catch (error) {
    console.error("Error loading persisted auth:", error);
    return { success: false, error: "Failed to load saved session" };
  }
}

export function getAuthUrl() {

  return `https://anilist.co/api/v2/oauth/authorize?client_id=${clientData.clientId}&redirect_uri=${clientData.redirectUri}&response_type=code`;
}