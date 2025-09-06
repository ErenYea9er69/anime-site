import { IVideo } from '@consumet/extensions';
import ProviderCache from './cache';
import Zoro from '@consumet/extensions/dist/providers/anime/zoro';
import axios from 'axios';
import { getCacheId, proxyRequest  } from '../utils';

const cache = new ProviderCache();
const consumet = new Zoro();
const apiUrl = 'https://apiconsumet-gamma.vercel.app';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type, query, episode } = req.query

  switch(type) {
    case 'search':
      const results = await consumet.search(query as string)
      return res.status(200).json(results)
    
    case 'info':
      const info = await consumet.fetchAnimeInfo(query as string)
      return res.status(200).json(info)
    
    case 'sources':
      const servers = ["vidstreaming", "vidcloud", "streamsb", "streamtape"];
      const sourcesPromises = servers.map(server => 
        proxyRequest(`${apiUrl}/anime/zoro/watch/${query}?server=${server}`)
      );
      const sourcesResponses = await Promise.all(sourcesPromises);
      const allSources = sourcesResponses.map(response => response.data);
      return res.status(200).json(allSources)
  }
}
export const getEpisodeUrl = async (
animeTitles: string[], index: number, episode: number, dubbed: boolean, p0: number,
): Promise<IVideo[] | null> => {
  console.log('HiAnime search params:', {
    titles: animeTitles,
    index,
    episode,
    dubbed
  });

  for (const animeSearch of animeTitles) {
    const result = await searchEpisodeUrl(
      animeSearch,
      index,
      episode,
      dubbed
    );
    if (result) {
      console.log('HiAnime found source:', result);
      return result;
    }
  }

  return null;
};

/**
 * Gets the episode url and isM3U8 flag
 *
 * @param {*} animeSearch
 * @param {*} episode anime episode to look for
 * @param {*} dubbed dubbed version or not
 * @returns IVideo sources if found, null otherwise
 */
async function searchEpisodeUrl(
  animeSearch: string,
  index: number,
  episode: number,
  dubbed: boolean,
): Promise<IVideo[] | null> {
  const cacheId = getCacheId(animeSearch, episode, dubbed);

  if(cache.search[cacheId] !== undefined)
    return cache.search[cacheId];

  const animeId = await getAnimeId(
    index,
    dubbed ? `${animeSearch} (Dub)` : animeSearch,
    dubbed,
  );

  if (animeId) {
    const animeEpisodeId = await getAnimeEpisodeId(animeId, episode);
    console.log('episodeId',animeEpisodeId)
    if (animeEpisodeId) {
      try {
        const servers = ["vidstreaming", "vidcloud", "streamsb", "streamtape"];
        const sourcesPromises = servers.map(server => 
          proxyRequest(`${apiUrl}/anime/zoro/watch/${animeEpisodeId}?server=${server}`)
        );
        const sourcesResponses = await Promise.all(sourcesPromises);
        const allSources = sourcesResponses.flatMap(response => {
          return response.data.sources.map((value: any) => {
            value.tracks = response.data.subtitles;
            value.skipEvents = {
              intro: response.data.intro,
              outro: response.data.outro
            };
            return value;
          });
        });
        return (cache.search[cacheId] = allSources ?? null);
      } catch (error) {
        console.error('Failed to fetch sources:', error);
        return null;
      }
    }
  }

  cache.search[cacheId] = null;
  console.log(`%c ${animeSearch}`, `color: #E5A639`);
  return null;
}

/**
 * Gets the anime id
 *
 * @param {*} animeSearch
 * @returns anime id if found, otherwise null
 */
export const getAnimeId = async (
  index: number,
  animeSearch: string,
  dubbed: boolean,
): Promise<string | null> => {
  if(cache.animeIds[animeSearch] !== undefined)
    return cache.animeIds[animeSearch];

  const data = await consumet.search(animeSearch);

  const filteredResults = data.results.filter((result) =>
    dubbed
      ? (result.title as string).includes('(Dub)')
      : !(result.title as string).includes('(Dub)'),
  );

  const normalizedSearch = animeSearch.toLowerCase();

  const result = (
    cache.animeIds[animeSearch] = filteredResults.filter(
      result =>
        (result.title.toString()).toLowerCase() === normalizedSearch ||
        (result.japaneseTitle.toString()).toLowerCase() === normalizedSearch
    )[index]?.id ?? null
  );

  return result;
};




/**
 * Gets the anime episode id
 *
 * @param {*} animeId
 * @param {*} episode
 * @returns anime episode id if found, otherwise null
 */
export const getAnimeEpisodeId = async (
  animeId: string,
  episode: number,
): Promise<string | null> => {
  if(cache.episodes[animeId] !== undefined) {
    const found = cache.episodes[animeId]?.find((ep) => ep.number == episode)

    if(found)
      return found.id;
  }

  const data = await consumet.fetchAnimeInfo(animeId);
  return (
    cache.episodes[animeId] = data?.episodes
  )?.find((ep) => ep.number == episode)?.id ?? null;
};