'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  TrendingUp, 
  FileText, 
  ArrowRight,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { reconciliations, invoices, mouvementsBancaires } from '@/lib/mock-data'
import { formatAmount, formatDate } from '@/src/shared/utils/format'

export default function ReconciliationDashboardPage() {
  const stats = useMemo(() => {
    const rapprochees = reconciliations.filter(r => r.status === 'RAPPROCHEE').length
    const ecarts = reconciliations.filter(r => r.status === 'ECART_DETECTE').length
    const nonRapprochees = reconciliations.filter(r => r.status === 'NON_RAPPROCHEE').length
    const suggestions = reconciliations.filter(r => r.status === 'SUGGESTION_EN_ATTENTE').length
    const total = reconciliations.length
    const tauxRapprochement = total > 0 ? Math.round((rapprochees / total) * 100) : 0

    const montantRapproche = reconciliations
      .filter(r => r.status === 'RAPPROCHEE')
      .reduce((sum, r) => sum + r.invoice.montantTTC, 0)

    const montantEnAttente = reconciliations
      .filter(r => r.status !== 'RAPPROCHEE')
      .reduce((sum, r) => sum + r.invoice.montantTTC, 0)

    return {
      rapprochees,
      ecarts,
      nonRapprochees,
      suggestions,
      total,
      tauxRapprochement,
      montantRapproche,
      montantEnAttente,
      facturesRecues: invoices.filter(i => i.type === 'RECUE').length,
      facturesEmises: invoices.filter(i => i.type === 'EMISE').length,
      mouvements: mouvementsBancaires.length,
    }
  }, [])

  const recentReconciliations = reconciliations.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Rapprochement</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vue d&apos;ensemble du rapprochement bancaire
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Rapprochées</p>
                <p className="mt-2 text-3xl font-bold text-green-600">{stats.rapprochees}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600/20" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatAmount(stats.montantRapproche)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Suggestions</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">{stats.suggestions}</p>
              </div>
              <Info className="h-8 w-8 text-blue-600/20" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">En attente de validation</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Écarts</p>
                <p className="mt-2 text-3xl font-bold text-amber-600">{stats.ecarts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600/20" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Nécessitent justification</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Non rapprochées</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{stats.nonRapprochees}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600/20" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatAmount(stats.montantEnAttente)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Taux de Rapprochement */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Taux de Rapprochement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold text-primary">{stats.tauxRapprochement}%</span>
                <span className="text-sm text-muted-foreground">
                  {stats.rapprochees} sur {stats.total} opérations
                </span>
              </div>
              <Progress value={stats.tauxRapprochement} className="h-3" />
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.facturesRecues}</p>
                  <p className="text-xs text-muted-foreground">Factures Reçues</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.facturesEmises}</p>
                  <p className="text-xs text-muted-foreground">Factures Émises</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.mouvements}</p>
                  <p className="text-xs text-muted-foreground">Mouvements</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/treasury/reconciliation/matching">
              <Button className="w-full justify-between" variant="outline">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Lancer Rapprochement
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/treasury/reconciliation/factures">
              <Button className="w-full justify-between" variant="outline">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Voir Factures
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/treasury/reconciliation/history">
              <Button className="w-full justify-between" variant="outline">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Historique
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reconciliations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Rapprochements Récents</CardTitle>
          <Link href="/treasury/reconciliation/matching">
            <Button variant="ghost" size="sm">
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReconciliations.map((reco) => (
              <div
                key={reco.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{
                      backgroundColor:
                        reco.score.total >= 85
                          ? '#16A34A'
                          : reco.score.total >= 60
                          ? '#D97706'
                          : '#DC2626',
                    }}
                  >
                    {reco.score.total}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{reco.invoice.numero}</p>
                    <p className="text-sm text-muted-foreground">{reco.invoice.tiersNom}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono font-medium text-foreground">
                      {formatAmount(reco.invoice.montantTTC)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(reco.invoice.dateEmission)}
                    </p>
                  </div>
                  <Badge
                    className={
                      reco.status === 'RAPPROCHEE'
                        ? 'bg-green-100 text-green-800'
                        : reco.status === 'SUGGESTION_EN_ATTENTE'
                        ? 'bg-blue-100 text-blue-800'
                        : reco.status === 'ECART_DETECTE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {reco.status === 'RAPPROCHEE'
                      ? 'Rapprochée'
                      : reco.status === 'SUGGESTION_EN_ATTENTE'
                      ? 'Suggestion'
                      : reco.status === 'ECART_DETECTE'
                      ? 'Écart'
                      : 'Non rapprochée'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
