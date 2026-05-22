import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClientLayout } from '@/components/ClientLayout'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-serif' })
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-mono' })

export const metadata: Metadata = {
  title: {
    default: '404NotFoundIN | Digital Culture Platform',
    template: '%s | 404NotFoundIN',
  },
  description: 'Premium digital culture platform. Music, memes, gaming, anime, code, devotion — everything that defines modern internet identity.',
  metadataBase: new URL('https://404notfoundin.vercel.app'),
  keywords: ['404notfound', 'culture', 'merchandise', 'internet', 'digital', 'premium', 'streetwear', 'anime', 'gaming', 'memes'],
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: '404NotFoundIN',
    description: 'Premium digital culture platform.',
    type: 'website',
    locale: 'en_US',
    siteName: '404NotFoundIN',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-black ${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-black text-white">
        <ClientLayout>{children}</ClientLayout>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
