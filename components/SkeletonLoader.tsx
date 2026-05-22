export function ProductCardSkeleton() {
  return (
    <div className="border border-border animate-pulse">
      <div className="aspect-[3/4] bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-muted w-16" />
        <div className="h-4 bg-muted w-3/4" />
        <div className="h-4 bg-muted w-20" />
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="bg-background min-h-screen pt-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-muted animate-pulse" />
            <div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square bg-muted animate-pulse" />)}</div>
          </div>
          <div className="space-y-6">
            <div className="h-3 bg-muted w-20 animate-pulse" />
            <div className="h-12 bg-muted w-3/4 animate-pulse" />
            <div className="h-8 bg-muted w-32 animate-pulse" />
            <div className="h-4 bg-muted animate-pulse" />
            <div className="h-4 bg-muted w-2/3 animate-pulse" />
            <div className="flex gap-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="w-11 h-11 bg-muted animate-pulse" />)}</div>
            <div className="h-14 bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function OrderListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-5 border-b border-border animate-pulse">
          <div className="space-y-2"><div className="h-4 bg-muted w-24" /><div className="h-3 bg-muted w-16" /></div>
          <div className="space-y-2"><div className="h-4 bg-muted w-16" /><div className="h-3 bg-muted w-20" /></div>
        </div>
      ))}
    </div>
  )
}

export function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 py-6 border-b border-border animate-pulse">
          <div className="w-20 h-20 bg-muted" />
          <div className="flex-1 space-y-2"><div className="h-4 bg-muted w-48" /><div className="h-3 bg-muted w-20" /></div>
          <div className="h-4 bg-muted w-16" />
        </div>
      ))}
    </div>
  )
}
