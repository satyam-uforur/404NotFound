export default function AccountLoading() {
  return (
    <div className="bg-background min-h-screen pt-20">
      <div className="px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto flex gap-8">
          <div className="w-56 flex-shrink-0 hidden md:block space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-full bg-muted animate-pulse" />
            ))}
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-4 w-24 bg-muted animate-pulse" />
            <div className="h-10 w-64 bg-muted animate-pulse" />
            <div className="mt-8 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 w-full bg-muted animate-pulse border border-border" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
