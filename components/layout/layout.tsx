'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AppSidebar } from './sidebar'
import { AppHeader } from './header'
import { AppBreadcrumb } from './breadcrumb'
import { Toaster } from '@/components/ui/sonner'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const contentRef = useRef<HTMLDivElement>(null)
  const isAdmin = user?.role === 'ADMIN_CLIENT' || user?.role === 'ADMIN_BANQUE'

  // Suppression de la logique de redirection forcée. À adapter selon les besoins de sécurité.

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  // Don't show layout on login page (root or rapprochement)
  if (pathname === '/' || pathname === '/login' || pathname === '/rapprochement-module/login') {
    return <>{children}</>
  }

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F6FB]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3B6FD4] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F4F6FB]">
      <AppSidebar />
      <AppHeader />
      <main className="ml-60 min-h-screen pt-16">
        <div ref={contentRef} className="h-[calc(100vh-64px)] overflow-y-auto px-8 py-6">
          <div className="mb-4">
            <AppBreadcrumb />
          </div>
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
