import './globals.css'

export const metadata = {
  title: "Cosmic Isles",
  description: "A Farcaster Mini App adventure"
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
