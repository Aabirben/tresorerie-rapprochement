'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { reconciliations } from '@/lib/rapprochement-mock-data'
import { formatAmount } from '@/lib/rapprochement-format'

export function RapprochementQuickSummary() {
  const total = reconciliations.length
  const rapprochees = reconciliations.filter((r) => r.status === 'RAPPROCHEE').length
  const montantRapproche = reconciliations
    .filter((r) => r.status === 'RAPPROCHEE')
    .reduce((sum, r) => sum + r.invoice.montantTTC, 0)
  const tauxRapprochement = Math.round((rapprochees / total) * 100)

  return (
    <Card className="border-l-4 border-l-[#3B6FD4] border-[#DDE3EF] bg-linear-to-r from-[#3B6FD4]/5 to-transparent">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs uppercase font-medium text-[#64748B]">Taux de Rapprochement</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1B2E5E]">{tauxRapprochement}%</span>
            <span className="text-sm text-[#64748B]">({rapprochees}/{total})</span>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">Montant rapproché: {formatAmount(montantRapproche)}</p>
        </div>
        <Link href="/dashboard?tab=rapprochement">
          <Button className="bg-[#3B6FD4] text-white hover:bg-[#3B6FD4]/90 gap-2">
            Accéder
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
