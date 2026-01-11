import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Cosmic Isles",
  description: "A Farcaster Mini App adventure",
  metadataBase: new URL('https://cosmic-isles.vercel.app'),
  manifest: 'https://api.farcaster.xyz/miniapps/hosted-manifest/019baa46-22b9-d5c5-be37-a3f72b063671',
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://cosmic-isles.vercel.app/splash.png",
    "fc:frame:button:1": "Play Game",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://cosmic-isles.vercel.app/game",
  },
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
      <head>
        <link 
          rel="manifest" 
          href="https://api.farcaster.xyz/miniapps/hosted-manifest/019baa46-22b9-d5c5-be37-a3f72b063671"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
