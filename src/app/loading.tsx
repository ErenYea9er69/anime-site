export default function HomeLoading() {
  return (
    <div className="relative min-h-screen">
      {/* Hero skeleton */}
      <div className="w-full h-[62vh] min-h-[460px] max-h-[680px] sm:h-[72vh] bg-muted animate-pulse" />

      {/* Content skeletons */}
      <div className="relative z-10 container space-y-12 py-8">
        {Array.from({ length: 3 }).map((_, sectionIdx) => (
          <section key={sectionIdx} className="w-full relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <div className="h-6 w-40 rounded bg-muted animate-pulse" />
            </div>
            <div className="flex gap-3 sm:gap-4 overflow-hidden">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-none w-[160px] sm:w-[190px] md:w-[210px]">
                  <div className="flex flex-col rounded-xl overflow-hidden bg-card/60 border border-white/5">
                    <div className="aspect-[3/4] w-full bg-muted animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
