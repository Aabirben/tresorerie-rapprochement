'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatAmount, formatDate } from '@/lib/format'
import type { Suggestion } from '@/lib/matching-engine'
import { cn } from '@/lib/utils'

interface SuggestionCardProps {
  suggestion: Suggestion
  onValidate: () => void
  onIgnore: () => void
}

const detailConfig = [
  { key: 'montant', label: 'Montant', max: 40 },
  { key: 'date', label: 'Date', max: 25 },
  { key: 'reference', label: 'Référence', max: 25 },
  { key: 'contrepartie', label: 'Contrepartie', max: 10 },
] as const

function getScoreBadgeClass(score: number): string {
  if (score >= 85) {
    return 'bg-[#16A34A] text-white'
  }
  if (score >= 60) {
    return 'bg-[#D97706] text-white'
  }
  return 'bg-[#DC2626] text-white'
}

export function SuggestionCard({ suggestion, onValidate, onIgnore }: SuggestionCardProps) {
  return (
    <Card className="border border-[#DDE3EF] bg-white shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[#1B2E5E]">{suggestion.facture.tiersNom}</p>
            <p className="text-sm text-[#64748B]">{suggestion.facture.numero}</p>
            <p className="text-xs text-[#64748B]">Date: {formatDate(suggestion.facture.dateEmission)}</p>
            <p className="mt-1 text-sm font-semibold text-[#1B2E5E]">
              {formatAmount(suggestion.facture.montantTTC)}
            </p>
          </div>
          <Badge className={cn('text-xs font-semibold', getScoreBadgeClass(suggestion.score))}>
            Score {suggestion.score}/100
          </Badge>
        </div>

        <div className="space-y-2">
          {detailConfig.map((item) => {
            const points = suggestion.scoreDetail[item.key]
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">{item.label}</span>
                  <span className="font-mono text-[#1B2E5E]">
                    {points}/{item.max}
                  </span>
                </div>
                <Progress value={(points / item.max) * 100} className="h-1" />
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" onClick={onValidate} className="bg-[#1B2E5E] text-white hover:bg-[#1B2E5E]/90">
            ✔ Valider
          </Button>
          <Button size="sm" variant="outline" onClick={onIgnore} className="border-[#DDE3EF] text-[#64748B]">
            ✗ Ignorer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
