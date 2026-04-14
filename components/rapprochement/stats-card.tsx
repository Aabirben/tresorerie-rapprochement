'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'
import { reconciliations } from '@/lib/rapprochement-mock-data'

export function RapprochementStatsCard() {
  const stats = {
    rapprochees: reconciliations.filter((r) => r.status === 'RAPPROCHEE').length,
    ecarts: reconciliations.filter((r) => r.status === 'ECART_DETECTE').length,
    nonRapprochees: reconciliations.filter((r) => r.status === 'NON_RAPPROCHEE').length,
    suggestionsEnAttente: reconciliations.filter((r) => r.status === 'SUGGESTION_EN_ATTENTE').length,
  }

  return (
    <Card className="border-[#DDE3EF] bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#1B2E5E] text-sm font-semibold">État du Rapprochement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#16A34A]" />
              <span className="text-sm text-[#64748B]">Rapprochées</span>
            </div>
            <Badge className="bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/20">
              {stats.rapprochees}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[#3B82F6]" />
              <span className="text-sm text-[#64748B]">Suggestions</span>
            </div>
            <Badge className="bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20">
              {stats.suggestionsEnAttente}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#D97706]" />
              <span className="text-sm text-[#64748B]">Écarts</span>
            </div>
            <Badge className="bg-[#D97706]/10 text-[#D97706] hover:bg-[#D97706]/20">
              {stats.ecarts}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-[#DC2626]" />
              <span className="text-sm text-[#64748B]">Non rapprochées</span>
            </div>
            <Badge className="bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20">
              {stats.nonRapprochees}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
