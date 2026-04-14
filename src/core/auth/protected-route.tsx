'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { canAccess, REDIRECT_BY_ROLE } from '@/src/core/router/routes'
import type { UserRole } from '@/src/shared/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }

    // Check role-based access
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to role-appropriate dashboard
      router.replace(REDIRECT_BY_ROLE[user.role] || '/treasury/dashboard')
      return
    }

    // Check route-level access
    if (!canAccess(pathname, user.role)) {
      router.replace(REDIRECT_BY_ROLE[user.role] || '/treasury/dashboard')
    }
  }, [isAuthenticated, isLoading, user, pathname, router, allowedRoles])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  // Role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null
  }

  // Route access denied
  if (!canAccess(pathname, user.role)) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
