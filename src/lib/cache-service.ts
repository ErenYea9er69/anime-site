import { PrismaClient } from '@prisma/client'
import { IVideo, IAnimeEpisode } from '@consumet/extensions'

const prisma = new PrismaClient()

export class CacheService {
    private readonly API_ENDPOINT = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/cache`;


    async cacheImage(url: string, animeId: number, type: 'cover' | 'banner') {
        try {
            const response = await fetch(this.API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    url, 
                    animeId, 
                    type, 
                    action: 'cacheImage' 
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error caching image:', error);
            return null;
        }
    }

    async cacheAnimeImages(animeId: number, coverImage?: string, bannerImage?: string) {
        const response = await fetch(this.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                animeId, 
                coverImage, 
                bannerImage, 
                action: 'cacheAnimeImages' 
            })
        });
        return response.json();
    }

    async cacheEpisode(animeId: number, episode: number, sources: IVideo[]) {
        const response = await fetch(this.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                animeId, 
                episode, 
                sources, 
                action: 'cacheEpisode' 
            })
        });
        return response.json();
    }

    async getEpisodeCache(animeId: number, episode: number) {
        const response = await fetch(this.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                animeId, 
                episode, 
                action: 'getEpisodeCache' 
            })
        });
        return response.json();
    }
    async getImageCache(url: string) {
        try {
            const response = await fetch(this.API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    url, 
                    action: 'getImageCache' 
                })
            });
            
            if (!response.ok) {
                return { error: true };
            }
            
            return response.json();
        } catch (error) {
            console.error('Error getting image cache:', error);
            return { error: true };
        }
    }
}

export const cacheService = new CacheService();

