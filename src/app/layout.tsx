import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Cosmic Isles",
  description: "Begin your adventure",
  metadataBase: new URL('https://cosmic-isles.vercel.app'),

  // Miniapp manifest — Next.js will generate ONE <link rel="manifest"> from this
  manifest: 'https://api.farcaster.xyz/miniapps/hosted-manifest/019baa46-22b9-d5c5-be37-a3f72b063671',

  // No fc:frame tags here — homepage must NOT be a frame
  openGraph: {
    title: "Cosmic Isles",
    description: "Begin your adventure",
    url: 'https://cosmic-isles.vercel.app',   // homepage, not /game
    siteName: 'Cosmic Isles',
    images: [
      {
        url: 'https://cosmic-isles.vercel.app/splash.png',
        alt: 'Cosmic Isles',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: "Cosmic Isles",
    description: "Begin your adventure",
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
