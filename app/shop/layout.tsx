import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse premium digital culture merchandise. Music, memes, gaming, anime, coding, devotional and more.',
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
