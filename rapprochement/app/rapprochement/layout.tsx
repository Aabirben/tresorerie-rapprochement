'use client'

import { ReactNode } from 'react'
import { RapprochementProvider } from '@/lib/rapprochement-context'

export default function RapprochementLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <RapprochementProvider>
      {children}
    </RapprochementProvider>
  )
}
