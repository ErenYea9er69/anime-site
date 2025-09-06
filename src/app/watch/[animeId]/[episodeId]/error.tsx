"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Something went wrong!</h1>
        <p className="text-muted-foreground">
          There was an error loading this episode.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    </div>
  );
}