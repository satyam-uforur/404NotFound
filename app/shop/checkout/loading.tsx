export default function CheckoutLoading() {
  return (
    <div className="bg-background min-h-screen pt-20">
      <div className="px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-[600px] mx-auto">
          <div className="h-4 w-20 bg-muted animate-pulse mb-4" />
          <div className="h-12 w-40 bg-muted animate-pulse mb-12" />
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 w-full bg-muted animate-pulse border-b border-border" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
