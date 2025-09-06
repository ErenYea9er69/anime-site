"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import GetMedia from "@/lib/anilist/getMedia";
import { CurrentMediaTypes } from "@/app/page";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function MangaClient() {
  const { data: sessions }: any = useSession();
  const userSession = sessions?.user;

  // Get manga lists from AniList
  const { 
    manga: currentManga,
    manga: planToRead 
  }: { 
    manga: CurrentMediaTypes[] 
  } = GetMedia(sessions, {
    stats: "CURRENT,PLANNING"
  });

  // State for manga lists
  const [currentlyReading, setCurrentlyReading] = useState<any[] | null>(null);
  const [planToReadList, setPlanToReadList] = useState<any[] | null>(null);

  // Process manga data
  useEffect(() => {
    if (!userSession?.name) return;

    const getCurrentReading = currentManga?.find((item) => item.status === "CURRENT") || null;
    const currentReadingList = getCurrentReading?.entries
      .map(({ media }) => media)
      .filter((media) => media);

    const getPlanToRead = planToRead?.find((item) => item.status === "PLANNING") || null;
    const planToReadList = getPlanToRead?.entries
      .map(({ media }) => media)
      .filter((media) => media);

    if (currentReadingList) {
      setCurrentlyReading(currentReadingList);
    }
    if (planToReadList) {
      setPlanToReadList(planToReadList);
    }
  }, [userSession?.name, currentManga, planToRead]);

  if (!currentlyReading?.length && !planToReadList?.length) return null;

   return (
    <section className="w-full mx-auto relative group">
      {currentlyReading?.length > 0 && (
        <>
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Currently Reading</h2>
          </div>
          <div className="relative overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4">
              {currentlyReading.map((manga) => (
                <Link 
                  key={manga.id} 
                  href={`/manga/${manga.id}`}
                  className="flex-none w-[200px] transition-transform hover:scale-[1.02]"
                >
                  <Card className="h-full overflow-hidden">
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={manga.coverImage.large}
                        alt={`Cover image for ${manga.title.userPreferred || manga.title.english || manga.title.romaji}`}
                        fill
                        className="object-cover z-10"
                        sizes="(max-width: 768px) 200px, 240px"
                        quality={85}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h2 className="font-karla font-bold text-lg line-clamp-2">
                        {manga.title.userPreferred || manga.title.english || manga.title.romaji}
                      </h2>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {planToReadList?.length > 0 && (
        <>
          <div className="mt-12 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Plan to Read</h2>
          </div>
          <div className="relative overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4">
              {planToReadList.map((manga) => (
                <Link 
                  key={manga.id} 
                  href={`/manga/${manga.id}`}
                  className="flex-none w-[200px] transition-transform hover:scale-[1.02]"
                >
                  <Card className="h-full overflow-hidden">
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={manga.coverImage.large}
                        alt={`Cover image for ${manga.title.userPreferred || manga.title.english || manga.title.romaji}`}
                        fill
                        className="object-cover z-10"
                        sizes="(max-width: 768px) 200px, 240px"
                        quality={85}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h2 className="font-karla font-bold text-lg line-clamp-2">
                        {manga.title.userPreferred || manga.title.english || manga.title.romaji}
                      </h2>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}