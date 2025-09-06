import { getAccessToken, getViewerId, getViewerInfo, getViewerLists } from "@/modules/anilist/anilistsAPI";
import type { MediaListStatus } from "@/types/anilistGraphQLTypes";

export interface UserData {
  id: number;
  name: string;
  avatar?: {
    medium?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  userData?: UserData;
  lists?: Array<{
    id: number | null;
    mediaId: number | null;
    progress?: number | null;
    media: {
      id: number;
      title: {
        english?: string;
        romaji?: string;
      };
      coverImage?: {
        large?: string;
      };
    };
  }>;
}

export async function handleAuthentication(token: string): Promise<AuthResponse> {
  try {
    // Get access token
    const accessToken = await getAccessToken(token);
    if (!accessToken) {
      return { success: false, error: "Failed to obtain access token" };
    }

    // Store access token
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('access_token', accessToken);
    }
    
    // Get user ID
    const id = await getViewerId();
    if (!id) {
      return { success: false, error: "Failed to obtain user ID" };
    }

    // Store user ID
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('viewer_id', id.toString());
    }
    
    // Get user data
    const userData = await getViewerInfo(id);
    if (!userData) {
      return { success: false, error: "Failed to fetch user data" };
    }

    // Get user lists
    const lists = await getViewerLists(
      id, 
      'CURRENT' as MediaListStatus,
      'REPEATING' as MediaListStatus,
      'PAUSED' as MediaListStatus
    );

    // Store lists
    if (typeof window !== 'undefined' && lists) {
      const serializedLists = lists.map(item => ({
        id: item.id,
        mediaId: item.mediaId,
        progress: item.progress,
        media: {
          id: item.media.id,
          title: {
            english: item.media.title?.english,
            romaji: item.media.title?.romaji
          },
          coverImage: {
            large: item.media.coverImage?.large
          }
        }
      }));
      sessionStorage.setItem("anime_lists", JSON.stringify(serializedLists));
    }

    return {
      success: true,
      userData: {
        id: userData.id,
        name: userData.name,
        avatar: {
          medium: userData.avatar?.medium
        }
      },
      lists
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed"
    };
  }
}

export function clearAuthData(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem("access_token"); // May not be needed if token is in cookie
    sessionStorage.removeItem("viewer_id");
    sessionStorage.removeItem("user_data");
    sessionStorage.removeItem("anime_lists");
  }
}