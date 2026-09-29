export default function SearchLoading() {
  return (
    <div className="container py-8 space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-9 w-48 rounded bg-muted animate-pulse" />
        <div className="h-11 w-full max-w-xl rounded-lg bg-muted animate-pulse" />
      </div>

      {/* Filter pills skeleton */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-white/10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-muted animate-pulse" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="flex flex-col rounded-xl overflow-hidden bg-card/60 border border-white/5">
            <div className="aspect-[3/4] w-full bg-muted animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
