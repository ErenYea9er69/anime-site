import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Media } from "@/types/anilistGraphQLTypes";

export function AnimeGrid({ anime }: { anime: Media[] }) {
  // Filter out duplicates based on ID
  const uniqueAnime = anime.reduce((acc: Media[], current) => {
    const exists = acc.find(item => item.id === current.id);
    if (!exists && current.id) {
      acc.push(current);
    }
    return acc;
  }, []);
  return (
    <div className="flex gap-4">
      {uniqueAnime.map((item) => (
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
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {item.description?.replace(/<[^>]*>/g, "")}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}    </div>
  );
}