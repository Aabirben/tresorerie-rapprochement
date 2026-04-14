'use client'

import { useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatAmount, formatDate } from '@/lib/format'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { invoices } from '@/lib/mock-data'

/**
 * RG-RAPP-HIST: Historique de Rapprochement
 * This page displays reconciliation history - invoices that have been reconciled (RAPPROCHE) or justified (JUSTIFIE).
 * These invoices are excluded from the main reconciliation page and only appear here.
 */
export default function HistoriquePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/rapprochement-module/login')
    }
  }, [user, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
      </div>
    )
  }

  // If user is not authenticated, don't render content
  if (!user) {
    return null
  }

  // RG-RAPP-HIST: Filter invoices with RAPPROCHE or JUSTIFIE status only
  const historiqueFactures = useMemo(
    () =>
      invoices.filter((inv) => (inv.status as any) === 'RAPPROCHE' || (inv.status as any) === 'JUSTIFIE'),
    []
  )

  const stats = {
    total: historiqueFactures.length,
    rapproches: historiqueFactures.filter((inv) => (inv.status as any) === 'RAPPROCHE').length,
    justifies: historiqueFactures.filter((inv) => (inv.status as any) === 'JUSTIFIE').length,
    montantTotal: historiqueFactures.reduce((sum, inv) => sum + inv.montantTTC, 0),
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2E5E]">Historique de Rapprochement</h1>
          <p className="text-sm text-[#64748B]">
            Factures rapprochées et justifiées — Vue d'archive des rapprochements complétés
          </p>
        </div>
        <Button variant="outline" className="border-[#DDE3EF] text-[#1B2E5E]" asChild>
          <Link href="/rapprochement-module/rapprochement">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au rapprochement
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-[#DDE3EF] bg-white shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Total Factures</p>
            <p className="mt-3 text-3xl font-bold text-[#1B2E5E]">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#16A34A] bg-white shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Rapprochées</p>
            <p className="mt-3 text-3xl font-bold text-[#16A34A]">{stats.rapproches}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#3B6FD4] bg-white shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Justifiées</p>
            <p className="mt-3 text-3xl font-bold text-[#3B6FD4]">{stats.justifies}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#1B2E5E] bg-white shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Montant Total</p>
            <p className="mt-3 text-2xl font-bold text-[#1B2E5E]">
              {formatAmount(stats.montantTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Historique Table */}
      <Card className="border-[#DDE3EF] bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-[#1B2E5E]">Liste Complète de l'Historique</CardTitle>
          <p className="text-xs text-[#64748B]">Total: {historiqueFactures.length} factures</p>
        </CardHeader>
        <CardContent className="p-0">
          {historiqueFactures.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-[#64748B]">
              <p>Aucune facture rapprochée ou justifiée pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F4F6FB] border-[#DDE3EF]">
                    <TableHead className="text-[#1B2E5E] font-semibold">Référence</TableHead>
                    <TableHead className="text-[#1B2E5E] font-semibold">Tiers</TableHead>
                    <TableHead className="text-[#1B2E5E] font-semibold">Type</TableHead>
                    <TableHead className="text-right text-[#1B2E5E] font-semibold">Montant</TableHead>
                    <TableHead className="text-[#1B2E5E] font-semibold">Date Facture</TableHead>
                    <TableHead className="text-[#1B2E5E] font-semibold">Date Rapprochement</TableHead>
                    <TableHead className="text-[#1B2E5E] font-semibold">Mouvement Bancaire</TableHead>
                    <TableHead className="text-[#1B2E5E] font-semibold">Méthode</TableHead>
                    <TableHead className="text-[#1B2E5E] font-semibold">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historiqueFactures.map((invoice) => (
                    <TableRow key={invoice.id} className="border-[#DDE3EF] hover:bg-[#F4F6FB]/40">
                      {/* Référence */}
                      <TableCell className="font-mono font-semibold text-[#1B2E5E]">
                        {invoice.numero}
                      </TableCell>

                      {/* Tiers */}
                      <TableCell className="text-[#64748B]">{invoice.tiersNom}</TableCell>

                      {/* Type */}
                      <TableCell>
                        <Badge
                          className={
                            invoice.type === 'RECUE'
                              ? 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20'
                              : 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20'
                          }
                        >
                          {invoice.type === 'RECUE' ? 'Reçue' : 'Émise'}
                        </Badge>
                      </TableCell>

                      {/* Montant */}
                      <TableCell className="text-right font-mono font-semibold text-[#1B2E5E]">
                        {formatAmount(invoice.montantTTC)}
                      </TableCell>

                      {/* Date Facture */}
                      <TableCell className="text-[#64748B]">
                        {formatDate(invoice.dateEmission)}
                      </TableCell>

                      {/* Date Rapprochement */}
                      <TableCell className="text-[#64748B]">
                        {invoice.updatedAt ? formatDate(invoice.updatedAt) : '—'}
                      </TableCell>

                      {/* Mouvement Bancaire */}
                      <TableCell className="font-mono text-sm text-[#64748B]">
                        {invoice.referencePaiement || '—'}
                      </TableCell>

                      {/* Méthode (Source) */}
                      <TableCell>
                        <Badge
                          className={
                            invoice.source === 'MANUELLE'
                              ? 'bg-gray-100 text-gray-700 border border-gray-300'
                              : invoice.source === 'OCR'
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-purple-100 text-purple-700 border border-purple-300'
                          }
                        >
                          {invoice.source === 'MANUELLE' ? 'Manuel' : invoice.source === 'OCR' ? 'OCR' : 'ERP'}
                        </Badge>
                      </TableCell>

                      {/* Statut */}
                      <TableCell>
                        <Badge
                          className={
                            invoice.status === 'RAPPROCHE'
                              ? 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20'
                              : 'bg-[#3B6FD4]/10 text-[#3B6FD4] border border-[#3B6FD4]/20'
                          }
                        >
                          {invoice.status === 'RAPPROCHE' ? 'Rapprochée' : 'Justifiée'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
