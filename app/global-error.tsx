'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className="bg-black">
      <body className="font-sans antialiased bg-black text-white">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-[8rem] font-serif font-bold text-white/[0.03] leading-none mb-[-1rem]">
              500
            </div>
            <p className="text-white/30 text-sm font-mono tracking-[0.2em] uppercase mb-2">
              Critical Error
            </p>
            <p className="text-white/10 text-xs mb-10 max-w-sm mx-auto">
              Something went wrong on our end. Please try again.
            </p>
            <button
              onClick={reset}
              className="px-8 py-4 bg-white text-black text-sm font-medium tracking-wide hover:bg-white/90 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
