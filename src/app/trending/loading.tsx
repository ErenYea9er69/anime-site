export default function TrendingLoading() {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-9 w-56 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
      </div>

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
