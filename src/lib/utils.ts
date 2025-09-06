import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatDate(date: string | number): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}

export interface AuthResponse {
  success: boolean;
  user?: any;
  lists?: any;
}

export function loadPersistedAuth(): AuthResponse {
  try {
    const accessToken = sessionStorage.getItem('access_token');
    const viewerId = sessionStorage.getItem('viewer_id');
    const userData = sessionStorage.getItem('user_data');
    const listsData = sessionStorage.getItem('anime_lists');

    if (!accessToken || !viewerId || !userData || !listsData) {
      return { success: false };
    }

    return {
      success: true,
      user: JSON.parse(userData),
      lists: JSON.parse(listsData)
    };
  } catch (error) {
    console.error("Error loading persisted auth:", error);
    return { success: false };
  }
}