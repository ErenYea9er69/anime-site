import { Media } from "@/types/anilistGraphQLTypes";
import { AnimeCard } from "@/components/anime-card";

interface AnimeGridProps {
  anime: Media[];
}

export function AnimeGrid({ anime }: AnimeGridProps) {
  // Filter out duplicates based on ID
  const uniqueAnime = (anime || []).reduce((acc: Media[], current) => {
    if (!current?.id) return acc;
    const exists = acc.find(item => item.id === current.id);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  if (!uniqueAnime.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <p className="text-base">No anime titles found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
      {uniqueAnime.map((item, index) => (
        <AnimeCard 
          key={item.id} 
          anime={item} 
          priority={index < 6}
        />
      ))}
    </div>
  );
}