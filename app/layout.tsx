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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
