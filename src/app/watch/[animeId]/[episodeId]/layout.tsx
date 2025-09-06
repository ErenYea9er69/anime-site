import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watch Episode | AniStream",
  description: "Watch your favorite anime episodes",
};

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">
      {children}
    </main>
  );
}