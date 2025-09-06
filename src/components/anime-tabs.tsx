import { useState, useRef } from 'react'
import { Media, Relation } from '@/types/anilistGraphQLTypes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"

type AnimeTabsProps = {
  anime: Media
}

export function AnimeTabs({ anime }: AnimeTabsProps) {
  const [activeTab, setActiveTab] = useState<'related' | 'recommendations'>(
    anime.relations?.edges?.some(relation => 
      relation?.node?.type === 'ANIME' && 
      ['PREQUEL', 'SEQUEL', 'SIDE_STORY', 'PARENT', 'ALTERNATIVE'].includes(relation.relationType)
    ) ? 'related' : 'recommendations'
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return
    
    const scrollAmount = direction === 'left' ? -800 : 800
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  const relatedAnime = anime.relations?.edges
  .filter(relation => {
    // console.log('Relation:', {
    //   hasRelation: !!relation,
    //   hasNode: !!relation?.node,
    //   type: relation?.node?.type,
    //   relationType: relation?.relationType,
    //   isValidType: relation?.node?.type === 'ANIME',
    //   isValidRelation: ['PREQUEL', 'SEQUEL', 'SIDE_STORY', 'PARENT', 'ALTERNATIVE', 'OTHER'].includes(relation?.relationType)
    // });
    
    return relation &&
      relation.node &&
      relation.node.type === 'ANIME' &&
      ['PREQUEL', 'SEQUEL', 'SIDE_STORY', 'PARENT', 'ALTERNATIVE', 'OTHER'].includes(relation.relationType);
  })
  .map(relation => ({
    ...relation.node,
    relationType: relation.relationType
  })) || [];

  
  // console.log('Raw recommendations:', {
  // hasNodes: !!anime.recommendations?.nodes,
  // nodesLength: anime.recommendations?.nodes?.length,
  // nodes: anime.recommendations?.nodes
  // });

  const recommendedAnime = anime.recommendations?.nodes
    ?.filter(node => {
      // console.log('Recommendation node:', {
      //   hasNode: !!node,
      //   hasMediaRec: !!node?.mediaRecommendation
      // });
      return node && node.mediaRecommendation;
    })
    .map(rec => rec.mediaRecommendation) || [];

  // console.log('Final counts:', {
  // relatedAnimeCount: relatedAnime.length,
  // recommendedAnimeCount: recommendedAnime.length
  // });
  

  return (
    <section className="w-full mx-auto relative group">
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {relatedAnime.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {activeTab === 'related' ? 'Related Anime' : 'Recommendations'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveTab('related')}>
                Related Anime
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('recommendations')}>
                Recommendations  
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <h2 className="text-2xl sm:text-3xl font-bold">Recommendations</h2>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll('left')}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll('right')}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="relative overflow-x-auto overflow-y-hidden"
      >
        <div className="flex gap-4">
          {activeTab === 'related' && relatedAnime.map((item) => (
            <Link 
              key={item.id} 
              href={`/anime/${item.id}`}
              className="flex-none w-[200px] transition-transform hover:scale-[1.02]"
            >
              <Card className="h-full overflow-hidden">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={item.coverImage?.large || ''}
                    alt={item.title?.english || item.title?.romaji || ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="font-semibold line-clamp-1">
                    {item.title?.english || item.title?.romaji}
                  </h2>
                  <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                    <span>{item.seasonYear}</span>
                    <span className="capitalize">{item.relationType?.toLowerCase().replace('_', ' ')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {activeTab === 'recommendations' && recommendedAnime.map((item) => (
            <Link 
              key={item.id} 
              href={`/anime/${item.id}`}
              className="flex-none w-[200px] transition-transform hover:scale-[1.02]"
            >
              <Card className="h-full overflow-hidden">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={item.coverImage?.large || ''}
                    alt={item.title?.english || item.title?.romaji || ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="font-semibold line-clamp-1">
                    {item.title?.english || item.title?.romaji}
                  </h2>
                  <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                    <span>{item.seasonYear}</span>
                    <span>{item.format}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}