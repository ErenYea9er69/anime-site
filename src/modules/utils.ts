import { Media } from "@/types/anilistGraphQLTypes";

export async function proxyRequest(url: string, method: string = 'GET', headers: object = {}) {
  const params = new URLSearchParams({
    url: url
  });
  
  const response = await fetch(`/api/proxy?${params}`, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
  
  return response.json();
}



export function getParsedAnimeTitles(media: Media): string[] {
  const titles: string[] = [];

  // Add all available titles
  if (media.title?.english) titles.push(media.title.english);
  if (media.title?.romaji) titles.push(media.title.romaji);
  if (media.title?.native) titles.push(media.title.native);
  
  // Add synonyms if available
  if (media.synonyms) {
    titles.push(...media.synonyms);
  }

  // Clean and normalize titles
  return titles
    .filter(Boolean) // Remove empty/null values
    .map(title => title.trim())
    .filter((title, index, self) => self.indexOf(title) === index); // Remove duplicates
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

export function getCacheId(
  animeSearch: string,
  episode: number,
  dubbed: boolean,
): string {
  return `${animeSearch}-${episode}-${dubbed ? 'dub' : 'sub'}`;
}

export function getAvailableEpisodes(media: Media): number | null {
  if (media.episodes != null) {
    return media.episodes;
  }
  
  if (media.nextAiringEpisode != null) {
    return media.nextAiringEpisode.episode - 1;
  }

  if (media.airingSchedule?.edges?.[0]?.node?.episode) {
    return media.airingSchedule.edges[0].node.episode;
  }

  return null;
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