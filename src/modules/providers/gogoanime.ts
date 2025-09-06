import { IVideo } from '@consumet/extensions';
import Gogoanime from '@consumet/extensions/dist/providers/anime/gogoanime';
import ProviderCache from './cache';
import { getCacheId, proxyRequest } from '../utils';
import { NextApiRequest, NextApiResponse } from 'next';

const cache = new ProviderCache();
const consumet = new Gogoanime();


export const getEpisodeUrl = async (
  animeTitles: string[],
  index: number,
  episode: number,
  dubbed: boolean,
  releaseDate: number,
): Promise<IVideo[] | null> => {
  console.log(
    `%c Episode ${episode}, looking for ${consumet.name} source...`,
    `color: #ffc119`,
  );

  for (const animeSearch of animeTitles) {
    const result = await searchEpisodeUrl(
      animeSearch,
      index,
      episode,
      dubbed,
      releaseDate,
    );
    if (result) {
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
  releaseDate: number,
): Promise<IVideo[] | null> {
  const cacheId = getCacheId(animeSearch, episode, dubbed);

  if(cache.search[cacheId] !== undefined)
    return cache.search[cacheId];

  try {
    const animeId = await getAnimeId(
      index,
      dubbed ? `${animeSearch} (Dub)` : animeSearch,
      dubbed,
      releaseDate,
    );

    if (animeId) {
      const animeEpisodeId = await getAnimeEpisodeId(animeId, episode);
      if (animeEpisodeId) {
        // Request all qualities
        const [gogocdn, streamsb, vidstreaming] = await Promise.all([
          proxyRequest(`https://apiconsumet-gamma.vercel.app/anime/gogoanime/watch/${animeEpisodeId}?server=gogocdn`),
          proxyRequest(`https://apiconsumet-gamma.vercel.app/anime/gogoanime/watch/${animeEpisodeId}?server=streamsb`),
          proxyRequest(`https://apiconsumet-gamma.vercel.app/anime/gogoanime/watch/${animeEpisodeId}?server=vidstreaming`)
        ]);

        const sources = [
          ...(gogocdn?.sources || []),
          ...(streamsb?.sources || []),
          ...(vidstreaming?.sources || [])
        ];

        console.log(`Found sources for ${animeSearch}:`, sources);
        return (cache.search[cacheId] = sources);
      }
    }
  } catch (error) {
    console.error("Error fetching episode:", error);
    return null;
  }

  return (cache.search[cacheId] = null);
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
  releaseDate: number,
): Promise<string | null> => {
  if(cache.animeIds[animeSearch] !== undefined)
    return cache.animeIds[animeSearch];

  const data = await proxyRequest(
    `https://apiconsumet-gamma.vercel.app/anime/gogoanime/${encodeURIComponent(animeSearch)}?page=1`
  );

  const filteredResults = data.results.filter((result: { title: string; }) =>
    dubbed
      ? (result.title as string).includes('(Dub)')
      : !(result.title as string).includes('(Dub)'),
  );

  const result = (
    cache.animeIds[animeSearch] = filteredResults.filter(
      (result: { releaseDate: string; title: string; }) => result.releaseDate == releaseDate.toString() ||
        result.title == animeSearch,
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

  const data = await proxyRequest(
    `https://apiconsumet-gamma.vercel.app/anime/gogoanime/info/${encodeURIComponent(animeId)}`
  );
  return (
    cache.episodes[animeId] = data?.episodes
  )?.find((ep: { number: number; }) => ep.number == episode)?.id ?? null;
};