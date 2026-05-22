export default function ProductsLoading() {
  return (
    <div className="bg-background min-h-screen pt-20">
      <div className="px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="h-4 w-24 bg-muted animate-pulse mb-4" />
          <div className="h-12 md:h-16 w-48 bg-muted animate-pulse mb-10" />
          <div className="flex gap-2 mb-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-20 bg-muted animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-border">
                <div className="aspect-[3/4] bg-muted animate-pulse" />
                <div className="p-5 space-y-2">
                  <div className="h-3 w-16 bg-muted animate-pulse" />
                  <div className="h-4 w-28 bg-muted animate-pulse" />
                  <div className="h-3 w-14 bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
