import type { Metadata, Viewport } from "next"
import { DM_Sans, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import localFont from "next/font/local"

const gabriola = localFont({
  src: './fonts/Gabriola.woff2',
  display: 'swap'
})

const goudyOldStyle = localFont({
  src: './fonts/GoudyOldStyle.woff2',
  display: 'swap'
})


const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: "EVOKE — The Sovereign Traveller",
  description:
    "A calm, contained reflective experience. There is no urgency here.",
}

export const viewport: Viewport = {
  themeColor: "#f5f0eb",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <head>
        {/* Font preload for better load performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
