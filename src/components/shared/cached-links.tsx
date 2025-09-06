import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getUniversalEpisodeUrl } from '@/modules/providers/api'
import { ListAnimeData } from '@/types/anilistAPITypes'

interface CachedLinkProps {
  listAnimeData: ListAnimeData
  episode: number
  children: React.ReactNode
}

export function CachedLink({ listAnimeData, episode, children }: CachedLinkProps) {
  // This will cache the episode URL data
  const { data: episodeUrl } = useQuery({
    queryKey: ['episode', listAnimeData.media?.id, episode],
    queryFn: () => getUniversalEpisodeUrl(listAnimeData, episode),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30 // Keep in cache for 30 minutes
  })

  return (
    <Link 
      href={`/watch/${listAnimeData.media?.id}/${episode}`}
      prefetch={true}
    >
      {children}
    </Link>
  )
}