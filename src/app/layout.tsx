import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Cosmic Isles",
  description: "A Farcaster Mini App adventure",
  metadataBase: new URL('https://cosmic-isles.vercel.app'),
  openGraph: {
    title: "Cosmic Isles",
    description: "A Farcaster Mini App adventure",
    url: 'https://cosmic-isles.vercel.app/game',
    siteName: 'Cosmic Isles',
    images: [
      {
        url: 'https://cosmic-isles.vercel.app/splash.png',
        alt: 'Cosmic Isles Game',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Cosmic Isles",
    description: "A Farcaster Mini App adventure",
    images: ['https://cosmic-isles.vercel.app/splash.png'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
