export default function CartLoading() {
  return (
    <div className="bg-background min-h-screen pt-20">
      <div className="px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-[1000px] mx-auto">
          <div className="h-4 w-16 bg-muted animate-pulse mb-4" />
          <div className="h-12 w-32 bg-muted animate-pulse mb-12" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6 p-4 border-b border-border">
                <div className="w-20 h-20 bg-muted animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-muted animate-pulse" />
                  <div className="h-3 w-20 bg-muted animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
