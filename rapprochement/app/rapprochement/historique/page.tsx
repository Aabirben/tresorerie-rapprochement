'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, Search, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { reconciliations, fournisseurs, clients } from '@/lib/rapprochement-mock-data'
import type { Reconciliation } from '@/lib/rapprochement-types'
import { formatAmount, formatDate, getStatusColor } from '@/lib/rapprochement-format'
import Link from 'next/link'

export default function RapprochementHistoriquePage() {
  const [tiersFilter, setTiersFilter] = useState<'fournisseurs' | 'clients'>('fournisseurs')
  const [selectedTiers, setSelectedTiers] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Filter to show only RAPPROCHEE and JUSTIFIE records
  const finalizedRecos = useMemo(() => {
    return (reconciliations as any[]).filter((r) => (r.status as string) === 'RAPPROCHEE' || (r.status as string) === 'JUSTIFIE')
  }, [])

  const tiers = tiersFilter === 'fournisseurs' ? fournisseurs : clients

  const filteredRecos = finalizedRecos.filter((r) => {
    const matchesType = tiersFilter === 'fournisseurs' ? r.invoice.type === 'RECUE' : r.invoice.type === 'EMISE'
    const matchesTiers = selectedTiers === 'all' || r.invoice.tiersId === selectedTiers
    const matchesSearch =
      r.invoice.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.invoice.tiersNom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.mouvement?.reference.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    let matchesDateRange = true
    if (startDate) {
      const start = new Date(startDate)
      const facturDate = new Date(r.invoice.dateEmission)
      matchesDateRange = facturDate >= start
    }
    if (endDate) {
      const end = new Date(endDate)
      const facturDate = new Date(r.invoice.dateEmission)
      matchesDateRange = matchesDateRange && facturDate <= end
    }

    return matchesType && matchesTiers && matchesSearch && matchesDateRange
  })

  const stats = {
    total: filteredRecos.length,
    rapprochees: filteredRecos.filter((r) => (r.status as string) === 'RAPPROCHEE').length,
    justifiees: filteredRecos.filter((r) => (r.status as string) === 'JUSTIFIE').length,
    montantTotal: filteredRecos.reduce((sum, r) => sum + r.invoice.montantTTC, 0),
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard?tab=rapprochement">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-[#1B2E5E]">Historique des Rapprochements</h1>
          </div>
          <p className="text-sm text-[#64748B] ml-11">
            Tous les rapprochements validés et justifiés
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-[#DDE3EF] bg-white">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-[#64748B]">Total</p>
            <p className="mt-2 text-3xl font-bold text-[#1B2E5E]">{stats.total}</p>
            <p className="text-xs text-[#64748B] mt-1">rapprochements</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#16A34A] border-[#DDE3EF] bg-white">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-[#64748B]">Rapprochées</p>
            <p className="mt-2 text-3xl font-bold text-[#16A34A]">{stats.rapprochees}</p>
            <p className="text-xs text-[#64748B] mt-1">automatiques</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#3B82F6] border-[#DDE3EF] bg-white">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-[#64748B]">Justifiées</p>
            <p className="mt-2 text-3xl font-bold text-[#3B82F6]">{stats.justifiees}</p>
            <p className="text-xs text-[#64748B] mt-1">avec justification</p>
          </CardContent>
        </Card>

        <Card className="border-[#DDE3EF] bg-white">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-[#64748B]">Montant Total</p>
            <p className="mt-2 text-2xl font-bold text-[#1B2E5E]">{formatAmount(stats.montantTotal)}</p>
            <p className="text-xs text-[#64748B] mt-1">TTC</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-[#F8FAFC] border border-[#DDE3EF] rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {/* Tiers Type */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Type</label>
            <Select value={tiersFilter} onValueChange={(v) => {
              setTiersFilter(v as 'fournisseurs' | 'clients')
              setSelectedTiers('all')
            }}>
              <SelectTrigger className="border-[#DDE3EF]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fournisseurs">Fournisseurs</SelectItem>
                <SelectItem value="clients">Clients</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tiers Select */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Tiers</label>
            <Select value={selectedTiers} onValueChange={setSelectedTiers}>
              <SelectTrigger className="border-[#DDE3EF]">
                <SelectValue placeholder="Tous les tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les {tiersFilter}</SelectItem>
                {tiers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.raisonSociale}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Depuis</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-[#DDE3EF]"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Jusqu'au</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-[#DDE3EF]"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Rechercher</label>
            <Input
              placeholder="N° facture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-[#DDE3EF]"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <Card className="border-[#DDE3EF] bg-white">
        <CardHeader className="border-b border-[#DDE3EF] pb-4">
          <CardTitle className="text-[#1B2E5E]">
            {filteredRecos.length} rapprochement{filteredRecos.length !== 1 ? 's' : ''} trouvé{filteredRecos.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRecos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 gap-2 text-[#64748B]">
              <Search className="h-8 w-8" />
              <p>Aucun rapprochement trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F8FAFC]">
                  <TableRow className="border-b border-[#DDE3EF]">
                    <TableHead className="text-xs font-semibold text-[#64748B] h-12">N° Facture</TableHead>
                    <TableHead className="text-xs font-semibold text-[#64748B]">Tiers</TableHead>
                    <TableHead className="text-xs font-semibold text-[#64748B]">Date Facture</TableHead>
                    <TableHead className="text-xs font-semibold text-[#64748B] text-right">Montant</TableHead>
                    <TableHead className="text-xs font-semibold text-[#64748B]">Mouvement</TableHead>
                    <TableHead className="text-xs font-semibold text-[#64748B]">Date Valeur</TableHead>
                    <TableHead className="text-xs font-semibold text-[#64748B] text-center">Score</TableHead>
                    <TableHead className="text-xs font-semibold text-[#64748B]">Statut</TableHead>
                    <TableHead className="text-xs font-semibold text-[#64748B]">Date Validation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecos.map((reco, idx) => (
                    <TableRow key={reco.id} className="border-b border-[#EDE9FE] hover:bg-[#F8FAFC]">
                      <TableCell className="font-medium text-[#1B2E5E]">{reco.invoice.numero}</TableCell>
                      <TableCell className="text-sm text-[#64748B]">{reco.invoice.tiersNom}</TableCell>
                      <TableCell className="text-sm text-[#64748B]">{formatDate(reco.invoice.dateEmission)}</TableCell>
                      <TableCell className="text-sm text-right font-mono text-[#1B2E5E]">
                        {formatAmount(reco.invoice.montantTTC)}
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {reco.mouvement?.reference || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {reco.mouvement ? formatDate(reco.mouvement.dateValeur) : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: reco.score.total >= 85 ? '#16A34A' : '#3B82F6' }}
                        >
                          {reco.score.total}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: (reco.status as string) === 'RAPPROCHEE' ? '#16A34A' : '#3B82F6',
                            color: 'white',
                          }}
                        >
                          {(reco.status as string) === 'RAPPROCHEE' ? 'Rapprochée' : 'Justifiée'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {reco.validationDate ? formatDate(reco.validationDate) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="bg-[#F8FAFC] border border-[#DDE3EF] rounded-lg p-4">
        <p className="text-xs text-[#64748B] leading-relaxed">
          <strong>Note:</strong> Cette page affiche tous les rapprochements finalisés (automatiques avec score ≥85% ou justifiés manuellement).
          Pour accéder aux rapprochements en cours, retournez à la{' '}
          <Link href="/dashboard?tab=rapprochement" className="text-[#3B6FD4] underline hover:text-[#3B6FD4]/80">
            page principale
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
