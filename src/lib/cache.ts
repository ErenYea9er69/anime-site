import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { IAnimeEpisode, IVideo } from '@consumet/extensions';
import { cacheService } from './cache-service';

export default class ProviderCache {
    search: { [key: string]:  IVideo[] | null};
    animeIds: { [key: string]: string | null};
    episodes: { [key: string]: IAnimeEpisode[] | undefined };
  
    constructor() {
        // Initialize all cache objects
        this.search = Object.create(null);
        this.animeIds = Object.create(null);
        this.episodes = Object.create(null);
    }
  }

// Create singleton instance
const globalCache = new ProviderCache();


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    const { action } = req.body;
  
    switch (action) {
      case 'cacheImage':
        return handleCacheImage(req, res);
      case 'cacheAnimeImages':
        return handleCacheAnimeImages(req, res);
      case 'cacheEpisode':
        return handleCacheEpisode(req, res);
      case 'getEpisodeCache':
        return handleGetEpisodeCache(req, res);
      case 'getImageCache':
        return handleGetImageCache(req, res);
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

  };
  const handleCacheImage = async (url: string, animeId: number, type: 'cover' | 'banner') => {
    try {
      const response = await cacheService.getImageCache(url);
      if (!response || response.error) {
        const cacheResponse = await cacheService.cacheImage(url, animeId, type);
        if (cacheResponse) {
          console.log(`Successfully cached image for anime ${animeId}`);
        }
      }
    } catch (error) {
      console.log('Image cache handling:', error);
    }
  };
  

async function handleCacheAnimeImages(req: NextApiRequest, res: NextApiResponse) {
  const { animeId, coverImage, bannerImage } = req.body;
  try {
    const promises = [];
    if (coverImage) {
      promises.push(prisma.imageCache.upsert({
        where: { url: coverImage },
        update: { updatedAt: new Date() },
        create: { url: coverImage, animeId, type: 'cover' }
      }));
    }
    if (bannerImage) {
      promises.push(prisma.imageCache.upsert({
        where: { url: bannerImage },
        update: { updatedAt: new Date() },
        create: { url: bannerImage, animeId, type: 'banner' }
      }));
    }
    const results = await Promise.all(promises);
    return res.status(200).json(results);
  } catch (error) {
    console.error('Cache anime images error:', error);
    return res.status(500).json({ message: 'Failed to cache anime images' });
  }
}

async function handleCacheEpisode(req: NextApiRequest, res: NextApiResponse) {
  const { animeId, episode, sources } = req.body;
  try {
    const cached = await prisma.episodeCache.upsert({
      where: { 
        animeId_episode: { animeId, episode }
      },
      update: { 
        sources,
        updatedAt: new Date()
      },
      create: {
        animeId,
        episode,
        sources,
        quality: sources.map((s: IVideo) => s.quality)
      }
    });
    return res.status(200).json(cached);
  } catch (error) {
    console.error('Cache episode error:', error);
    return res.status(500).json({ message: 'Failed to cache episode' });
  }
}

async function handleGetEpisodeCache(req: NextApiRequest, res: NextApiResponse) {
  const { animeId, episode } = req.body;
  try {
    const cached = await prisma.episodeCache.findUnique({
      where: {
        animeId_episode: { animeId, episode }
      }
    });
    return res.status(200).json(cached);
  } catch (error) {
    console.error('Get episode cache error:', error);
    return res.status(500).json({ message: 'Failed to get episode cache' });
  }
}

async function handleGetImageCache(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.body;
  try {
    const cached = await prisma.imageCache.findUnique({
      where: { url }
    });
    return res.status(200).json(cached);
  } catch (error) {
    console.error('Get image cache error:', error);
    return res.status(500).json({ message: 'Failed to get image cache' });
  }
}
