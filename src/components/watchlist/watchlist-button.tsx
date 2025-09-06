"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWatchlist } from "@/hooks/use-watchlist";
import { WatchStatus } from "@/types/watchlist";
import { Media } from "@/types/anilistGraphQLTypes";
import { useToast } from "@/hooks/use-toast";

interface WatchlistButtonProps {
  anime: Media;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const statusOptions: { value: WatchStatus; label: string }[] = [
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "plan_to_watch", label: "Plan to Watch" },
  { value: "on_hold", label: "On Hold" },
  { value: "dropped", label: "Dropped" },
];

export function WatchlistButton({ anime, variant = "default", size = "default" }: WatchlistButtonProps) {
  const { addToWatchlist, removeFromWatchlist, getStatus, isLoading } = useWatchlist();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const currentStatus = getStatus(anime.id!);

  const handleStatusChange = async (status: WatchStatus) => {
    try {
      if (currentStatus === status) {
        await removeFromWatchlist(anime.id!);
        toast({
          title: "Removed from watchlist",
          description: `${anime.title?.english || anime.title?.romaji} has been removed from your watchlist.`,
        });
      } else {
        await addToWatchlist({
          id: anime.id!,
          status,
          progress: 0,
          media: {
            id: anime.id!,
            title: anime.title,
            coverImage: anime.coverImage,
            episodes: anime.episodes,
            genres: anime.genres,
          },
          updatedAt: Date.now(),
        });
        toast({
          title: "Added to watchlist",
          description: `${anime.title?.english || anime.title?.romaji} has been added to your ${status.replace('_', ' ')}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          {currentStatus ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              {statusOptions.find(opt => opt.value === currentStatus)?.label}
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add to List
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
          >
            {currentStatus === option.value && (
              <Check className="mr-2 h-4 w-4" />
            )}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}