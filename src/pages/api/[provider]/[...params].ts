import { NextApiRequest, NextApiResponse } from 'next';
import Gogoanime from '@consumet/extensions/dist/providers/anime/gogoanime';

const consumet = new Gogoanime();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider, params } = req.query;
  
  if (provider === 'gogoanime' && Array.isArray(params)) {
    try {
      switch(params[0]) {
        case 'search':
          const results = await consumet.search(params[1]);
          return res.status(200).json(results);
        
        case 'info':
          const info = await consumet.fetchAnimeInfo(params[1]);
          return res.status(200).json(info);
        
        case 'watch':
          const sources = await consumet.fetchEpisodeSources(params[1]);
          return res.status(200).json(sources);
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch data' });
    }
  }

  return res.status(404).json({ error: 'Provider not found' });
}