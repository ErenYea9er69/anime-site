const ANILIST_API = 'https://graphql.anilist.co';

export type Anime = {
  id: number;
  title: {
    romaji: string;
    english: string;
  };
  coverImage: {
    large: string;
    medium: string;
  };
  bannerImage: string;
  description: string;
  episodes: number;
  status: string;
  genres: string[];
  averageScore: number;
  popularity: number;
  season?: string;
  seasonYear?: number;
  format?: string;
  duration?: number;
  studios?: {
    nodes: {
      id: number;
      name: string;
    }[];
  };
};

const fetchAnimeData = async (query: string, variables = {}) => {
  try {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching anime data:', error);
    return null;
  }
};

export async function getTrendingAnime(): Promise<Anime[]> {
  const query = `
    query {
      Page(page: 1, perPage: 16) {
        media(type: ANIME, sort: TRENDING_DESC) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
            medium
          }
          bannerImage
          description
          episodes
          status
          genres
          averageScore
          popularity
        }
      }
    }
  `;

  const data = await fetchAnimeData(query);
  return data?.Page?.media || [];
}

export async function getPopularThisSeason(): Promise<Anime[]> {
  const query = `
    query {
      Page(page: 1, perPage: 12) {
        media(type: ANIME, sort: POPULARITY_DESC, season: FALL, seasonYear: 2024, status: RELEASING) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
            medium
          }
          bannerImage
          description
          episodes
          status
          genres
          averageScore
          popularity
          season
          seasonYear
        }
      }
    }
  `;

  const data = await fetchAnimeData(query);
  return data?.Page?.media || [];
}

export async function getUpcomingNextSeason(): Promise<Anime[]> {
  const query = `
    query {
      Page(page: 1, perPage: 12) {
        media(type: ANIME, sort: POPULARITY_DESC, season: WINTER, seasonYear: 2025, status: NOT_YET_RELEASED) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
            medium
          }
          bannerImage
          description
          episodes
          status
          genres
          averageScore
          popularity
          season
          seasonYear
        }
      }
    }
  `;

  const data = await fetchAnimeData(query);
  return data?.Page?.media || [];
}

export async function getTopRatedAnime(): Promise<Anime[]> {
  const query = `
    query {
      Page(page: 1, perPage: 12) {
        media(type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
            medium
          }
          bannerImage
          description
          episodes
          status
          genres
          averageScore
          popularity
        }
      }
    }
  `;

  const data = await fetchAnimeData(query);
  return data?.Page?.media || [];
}

export async function getAnimeById(id: number): Promise<Anime | null> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
          medium
        }
        bannerImage
        description
        episodes
        status
        genres
        averageScore
        popularity
        season
        seasonYear
        format
        duration
        streamingEpisodes {
          thumbnail
          title
          url
        }
        studios {
          nodes {
            id
            name
          }
        }
      }
    }
  `;

  const data = await fetchAnimeData(query, { id });
  return data?.Media || null;
}


export async function getAllAnimeIds(): Promise<number[]> {
  const [trending, popular, upcoming, topRated] = await Promise.all([
    getTrendingAnime(),
    getPopularThisSeason(),
    getUpcomingNextSeason(),
    getTopRatedAnime(),
  ]);

  const allAnime = [...trending, ...popular, ...upcoming, ...topRated];
  return Array.from(new Set(allAnime.map(anime => anime.id)));
}