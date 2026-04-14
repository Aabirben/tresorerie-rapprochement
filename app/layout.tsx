<<<<<<< HEAD
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { AppProvider } from '@/lib/app-context'
import { AuthProvider } from '@/lib/auth-context'
import { MainLayout } from '@/components/layout/main-layout'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Adria Treasury — Rapprochement Bancaire',
  description: 'Solution de rapprochement bancaire pour la trésorerie d\'entreprise au Maroc',
  generator: 'Adria Business and Technology',
}

export const viewport: Viewport = {
  themeColor: '#111E3F',
  width: 'device-width',
  initialScale: 1,
}
=======
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans'
});

export const metadata: Metadata = {
  title: 'Adria Trésorerie - Gestion de Trésorerie',
  description: 'Module de gestion de trésorerie Adria Business & Technology',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

import { AuthProvider } from '@/lib/auth-context'
import { AppProvider } from '@/lib/app-context'
import { MainLayout } from '@/components/layout/layout'
import { Toaster } from '@/components/ui/sonner'
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
<<<<<<< HEAD
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <AppProvider>
            <MainLayout>{children}</MainLayout>
          </AppProvider>
        </AuthProvider>
        <Toaster
          position="top-right"
          duration={4000}
          toastOptions={{
            className: 'max-w-[320px] border border-[#DDE3EF] bg-white text-[#1B2E5E] shadow-sm',
            classNames: {
              success: 'border-l-4 border-l-[#16A34A]',
              error: 'border-l-4 border-l-[#DC2626]',
              info: 'border-l-4 border-l-[#3B82F6]',
              warning: 'border-l-4 border-l-[#3B82F6]',
              title: 'text-sm font-medium',
              description: 'text-sm text-[#64748B]',
            },
          }}
        />
=======
    <html lang="fr" suppressHydrationWarning>
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <AuthProvider>
          <AppProvider>
            <MainLayout>{children}</MainLayout>
            <Toaster />
          </AppProvider>
        </AuthProvider>
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
        <Analytics />
      </body>
    </html>
  )
}
