'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ProactiveMatchingBannerProps {
  pendingCount: number
}

export function ProactiveMatchingBanner({ pendingCount }: ProactiveMatchingBannerProps) {
  if (pendingCount <= 0) {
    return null
  }

  return (
    <Card className="border border-sky-200 bg-sky-50 shadow-none">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2 text-sky-900">
          <Sparkles className="h-4 w-4" />
          <p className="text-sm font-medium">
            {pendingCount} transactions ont une suggestion de rapprochement en attente
          </p>
        </div>
        <Button asChild size="sm" className="bg-[#1B2E5E] text-white hover:bg-[#1B2E5E]/90">
          <Link href="/rapprochement?status=SUGGESTION_EN_ATTENTE">Voir les suggestions</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
