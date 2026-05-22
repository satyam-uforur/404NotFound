import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '404NotFoundIN',
    short_name: '404',
    description: 'Premium digital culture platform. Music, memes, gaming, anime, code, devotion.',
    start_url: '/shop',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
