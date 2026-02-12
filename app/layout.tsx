import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Progression Labs — AI Consultancy & Technology Partner',
  description: 'Progression Labs is an AI consultancy and technology partner delivering business transformation through production-ready artificial intelligence systems, strategic advisory, and managed AI platforms.',
  robots: 'index, follow',
  openGraph: {
    title: 'Progression Labs — AI Consultancy & Technology Partner',
    description: 'AI systems that work in production — not just in demos.',
    type: 'website',
    url: 'https://progressionlabs.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-black.png" type="image/png" />
      </head>
      <body className={inter.className}>
        {/* SVG Filters for grain effect */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
          <filter id="grain-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={4} stitchTiles="stitch" seed={1} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </svg>

        {/* Fixed grain overlay */}
        <div className="grain-overlay" aria-hidden="true" />

        {/* Mouse-reactive gradient glow */}
        <div className="glow-overlay" aria-hidden="true" />

        {children}
      </body>
    </html>
  )
}
