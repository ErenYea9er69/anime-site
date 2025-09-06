"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Checkbox } from "@radix-ui/react-checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { 
  TableIcon, 
  Badge, 
  Settings, 
  Clock, 
  Star, 
  PlayCircle,
  CheckCircle2,
  Filter
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CurrentMediaTypes } from "@/app/page";

type MyListProps = {
  media: CurrentMediaTypes[];
  sessions: any;
  user: any;
  time: any;
  userSettings: any;
};

export default function MyListClient({
  media,
  sessions,
  user,
  time,
  userSettings,
}: MyListProps) {
  const [listFilter, setListFilter] = useState("all");
  const [visible, setVisible] = useState(false);
  const [useCustomList, setUseCustomList] = useState(true);
  const [view, setView] = useState<"grid" | "list">("list");

  useEffect(() => {
    if (userSettings) {
      localStorage.setItem("customList", userSettings.CustomLists);
      setUseCustomList(userSettings.CustomLists);
    }
  }, [userSettings]);

  const handleCheckboxChange = async () => {
    setUseCustomList(!useCustomList);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customList: !useCustomList,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update settings");
      }

      localStorage.setItem("customList", String(!useCustomList));
      toast.success("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
      setUseCustomList(useCustomList);
    }
  };

  const filterMedia = (status: string) => {
    if (status === "all") {
      return media;
    }
    return media.filter((m: any) => m.name === status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <Head>
        <title>{user.name}&apos;s Profile - Tsune</title>
      </Head>
      <div className="relative">
        {user.bannerImage && (
          <div className="absolute inset-0 h-[300px] w-full">
            <Image
              src={user.bannerImage}
              alt={`${user.name}&apos;s profile banner`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/60 to-background" />
          </div>
        )}

        <div className="container relative pt-32 pb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="relative group">
              <Avatar className="h-32 w-32 ring-4 ring-background/50 bg-background/50 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                <AvatarImage src={user.avatar.large} alt={`${user.name}&apos;s avatar`} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                View Profile
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                    {user.name}
                  </h1>
                  {sessions?.user?.name === user.name && (
                    <Button variant="outline" size="sm" asChild className="h-8">
                      <Link href="https://anilist.co/settings" className="opacity-70 hover:opacity-100 transition-opacity">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Joined <UnixTimeConverter unixTime={user.createdAt} />
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-secondary/30 backdrop-blur-sm rounded-lg p-3 transition-colors hover:bg-secondary/40">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Time Watched</span>
                  </div>
                  <p className="text-lg font-semibold">{time}</p>
                </div>
                <div className="bg-secondary/30 backdrop-blur-sm rounded-lg p-3 transition-colors hover:bg-secondary/40">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-medium">Mean Score</span>
                  </div>
                  <p className="text-lg font-semibold">{user.statistics.anime.meanScore}</p>
                </div>
                <div className="bg-secondary/30 backdrop-blur-sm rounded-lg p-3 transition-colors hover:bg-secondary/40">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <PlayCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Episodes</span>
                  </div>
                  <p className="text-lg font-semibold">{user.statistics.anime.episodesWatched}</p>
                </div>
                <div className="bg-secondary/30 backdrop-blur-sm rounded-lg p-3 transition-colors hover:bg-secondary/40">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  <p className="text-lg font-semibold">{user.statistics.anime.count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-[25%] relative">
              <div className="sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">Lists</h2>
                  <span className="text-sm text-muted-foreground">
                    {media.reduce((acc, list) => acc + list.entries.length, 0)} Total
                  </span>
                </div>
                <div className="bg-secondary/30 backdrop-blur-sm rounded-lg overflow-hidden">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => setListFilter("all")}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        "all" === listFilter 
                          ? "bg-primary/20 text-primary" 
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">All Lists</span>
                        <span className="text-sm text-muted-foreground">
                          {media.reduce((acc, list) => acc + list.entries.length, 0)}
                        </span>
                      </div>
                    </button>
                    {media.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => setListFilter(item.name)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          item.name === listFilter 
                            ? "bg-primary/20 text-primary" 
                            : "hover:bg-secondary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.entries.length}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-[75%] space-y-6 my-5 lg:my-0">
              {filterMedia(listFilter).map((item, index) => (
                <div
                  key={index}
                  id={item.status?.toLowerCase()}
                  className="bg-secondary/30 backdrop-blur-sm rounded-lg overflow-hidden"
                >
                  <div className="p-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xl bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                        {item.name}
                      </h3>
                      <Badge variant="secondary" className="px-2 py-0.5">
                        {item.entries.length} {item.entries.length === 1 ? 'Entry' : 'Entries'}
                      </Badge>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border/50">
                        <tr>
                          <th className="text-xs font-semibold text-muted-foreground text-left py-3 px-4">
                            Title
                          </th>
                          <th className="text-xs font-semibold text-muted-foreground py-3 px-4 w-24">
                            Score
                          </th>
                          <th className="text-xs font-semibold text-muted-foreground py-3 px-4 w-24">
                            Progress
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {item.entries.map((entry) => (
                          <tr
                            key={entry.mediaId}
                            className="group hover:bg-secondary/50 transition-colors"
                          >
                            <td className="py-2 px-4">
                              <div className="flex items-center gap-3 relative">
                                {entry.media.status === "RELEASING" ? (
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                ) : entry.media.status === "NOT_YET_RELEASED" ? (
                                  <div className="w-2 h-2 rounded-full bg-red-500" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-muted" />
                                )}
                                <div className="relative">
                                  <Image
                                    src={entry.media.coverImage.large}
                                    alt="Cover Image"
                                    width={500}
                                    height={500}
                                    className="w-10 h-14 object-cover rounded-md transition-transform group-hover:scale-105"
                                  />
                                  <div className="absolute right-full top-0 -translate-x-2 invisible group-hover:visible z-50">
                                    <div className="relative bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-xl transform transition-all duration-200 scale-95 group-hover:scale-100">
                                      <div className="relative w-32 aspect-[2/3]">
                                        <Image
                                          src={entry.media.coverImage.large}
                                          alt={String(entry.media.id)}
                                          fill
                                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                          className="object-cover rounded-md"
                                          quality={90}
                                        />
                                        <div className="absolute inset-0 rounded-md bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                                        <div className="absolute bottom-3 left-3 right-3">
                                          <p className="text-xs font-medium line-clamp-2 text-white">
                                            {entry.media.title.romaji}
                                          </p>
                                          {entry.media.status === "RELEASING" && (
                                            <span className="inline-flex items-center mt-1 text-[10px] text-primary">
                                              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1 animate-pulse" />
                                              Currently Airing
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <Link
                                  href={`/anime/${entry.media.id}`}
                                  className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                                  title={entry.media.title.romaji}
                                >
                                  {entry.media.title.romaji}
                                </Link>
                              </div>
                            </td>
                            <td className="py-2 px-4 text-center">
                              {entry.score === 0 ? (
                                <span className="text-muted-foreground text-sm">—</span>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="h-3 w-3 text-primary" />
                                  <span className="text-sm">{entry.score}</span>
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-4 text-center">
                              <span className="text-sm">
                                {entry.progress === entry.media.episodes
                                  ? entry.progress
                                  : entry.media.episodes === null
                                  ? entry.progress
                                  : `${entry.progress}/${entry.media.episodes}`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnixTimeConverter({ unixTime }: { unixTime: number }) {
  const date = new Date(unixTime * 1000);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formattedDate;
}
