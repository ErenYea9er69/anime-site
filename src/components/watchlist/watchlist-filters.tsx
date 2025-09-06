"use client";

import { Button } from "@/components/ui/button";
import { WatchStatus } from "@/types/watchlist";

interface WatchlistFiltersProps {
  currentStatus: WatchStatus;
  onStatusChange: (status: WatchStatus) => void;
}

const statusOptions: { value: WatchStatus; label: string }[] = [
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "dropped", label: "Dropped" },
  { value: "plan_to_watch", label: "Plan to Watch" },
];

export function WatchlistFilters({
  currentStatus,
  onStatusChange,
}: WatchlistFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statusOptions.map((status) => (
        <Button
          key={status.value}
          variant={currentStatus === status.value ? "default" : "outline"}
          onClick={() => onStatusChange(status.value)}
        >
          {status.label}
        </Button>
      ))}
    </div>
  );
}