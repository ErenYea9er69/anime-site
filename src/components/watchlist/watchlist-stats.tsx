"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { WatchlistEntry } from "@/types/watchlist";

interface WatchlistStatsProps {
  entries: WatchlistEntry[];
}

export function WatchlistStats({ entries }: WatchlistStatsProps) {
  const totalAnime = entries.length;
  const totalEpisodes = entries.reduce((sum, entry) => sum + (entry.progress || 0), 0);
  const completedAnime = entries.filter(entry => entry.status === "completed").length;
  const watchingAnime = entries.filter(entry => entry.status === "watching").length;
  const onHoldAnime = entries.filter(entry => entry.status === "on_hold").length;
  const droppedAnime = entries.filter(entry => entry.status === "dropped").length;

  const stats = [
    {
      label: "Total Anime",
      value: totalAnime,
    },
    {
      label: "Episodes Watched",
      value: totalEpisodes,
    },
    {
      label: "Completion Rate",
      value: `${totalAnime ? ((completedAnime / totalAnime) * 100).toFixed(1) : 0}%`,
    },
  ];

  const statusBreakdown = [
    {
      status: "Watching",
      count: watchingAnime,
      color: "bg-blue-500",
    },
    {
      status: "Completed",
      count: completedAnime,
      color: "bg-green-500",
    },
    {
      status: "On Hold",
      count: onHoldAnime,
      color: "bg-yellow-500",
    },
    {
      status: "Dropped",
      count: droppedAnime,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{stat.label}</span>
                <span className="font-medium">{stat.value}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusBreakdown.map((item) => (
            <div key={item.status}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{item.status}</span>
                <span className="font-medium">{item.count}</span>
              </div>
              <Progress
                value={totalAnime ? (item.count / totalAnime) * 100 : 0}
                className={item.color}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}