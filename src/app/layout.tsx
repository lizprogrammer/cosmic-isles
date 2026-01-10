import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Cosmic Isles",
  description: "A Farcaster Mini App adventure",
  openGraph: {
    title: "Cosmic Isles",
    description: "A Farcaster Mini App adventure",
    images: ['/icon.png'], // This shows as preview image
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Cosmic Isles",
    description: "A Farcaster Mini App adventure",
    images: ['/icon.png'],
  },
  icons: {
    icon: '/icon.png', // Favicon (browser tab icon)
    apple: '/icon.png', // Apple touch icon
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
