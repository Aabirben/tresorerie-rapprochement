'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, CheckCircle, AlertTriangle, XCircle, Info, Search, ChevronDown, ChevronUp, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { reconciliations, additionalReconciliations, fournisseurs, clients, invoices, mouvementsBancaires } from '@/lib/mock-data'
import { formatAmount, formatDate, getScoreColor, getScoreBgClass } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getSuggestions, getSuggestionInsight } from '@/lib/matching-engine'
import { SuggestionCard } from '@/components/rapprochement/suggestion-card'
import { useProactiveMatching } from '@/hooks/use-proactive-matching'
import { useApp } from '@/lib/app-context'
import type { Reconciliation, ValidationQueueItem } from '@/lib/rapprochement-types'

const allReconciliations = [...reconciliations, ...additionalReconciliations]

export default function RapprochementPage() {
  const [recos, setRecos] = useState<Reconciliation[]>(allReconciliations)
  const [tiersFilter, setTiersFilter] = useState<'fournisseurs' | 'clients'>('fournisseurs')
  const [selectedTiers, setSelectedTiers] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['r2', 'r5']))
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState<'principal' | 'historique'>('principal')
  const [ignoredSuggestions, setIgnoredSuggestions] = useState<Set<string>>(new Set())
  
  // Get validation functions from AppContext
  const { submitJustification } = useApp()

  // F-RAPP-04: Activate proactive matching on page load and when data changes
  useProactiveMatching({
    factures: invoices,
    mouvements: mouvementsBancaires,
    reconciliations: recos,
    setReconciliations: setRecos,
  })

  const tiers = tiersFilter === 'fournisseurs' ? fournisseurs : clients

  const filteredRecos = recos.filter((r) => {
    // RG-RAPP-HIST: Exclude reconciliations that are already RAPPROCHEE
    // These reconciliations should only appear in the Historique de Rapprochement page
    if (r.status === ('RAPPROCHEE' as any)) {
      return false
    }
    
    const matchesType = tiersFilter === 'fournisseurs' 
      ? r.invoice.type === 'RECUE' 
      : r.invoice.type === 'EMISE'
    const matchesTiers = selectedTiers === 'all' || r.invoice.tiersId === selectedTiers
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesSearch =
      r.invoice.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.invoice.tiersNom.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesTiers && matchesStatus && matchesSearch
  })

  const stats = {
    rapprochees: filteredRecos.filter((r) => r.status === ('RAPPROCHEE' as any)).length,
    ecarts: filteredRecos.filter((r) => r.status === ('ECART_DETECTE' as any)).length,
    nonRapprochees: filteredRecos.filter((r) => r.status === ('NON_RAPPROCHEE' as any)).length,
    suggestionsEnAttente: filteredRecos.filter((r) => r.status === ('SUGGESTION_EN_ATTENTE' as any)).length,
  }

  const handleLancerRapprochement = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      toast.success('Rapprochement terminé avec succès')
    }, 2000)
  }

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // RG-JUST-03: Handle justification submission
  const handleSubmitJustification = (recoId: string, justification: string) => {
    if (!justification.trim()) {
      toast.error('Veuillez saisir une justification')
      return
    }
    
    const reco = recos.find((r) => r.id === recoId)
    if (!reco) return

    // Call AppContext function to submit for validation
    const result = submitJustification({
      invoiceId: reco.invoice.id,
      reconciliationId: recoId,
      justification,
    })

    // Update reconciliation status locally
    setRecos((prev) =>
      prev.map((r) =>
        r.id === recoId
          ? {
              ...r,
              justification,
              justificationDate: new Date(),
              status: result.isResubmission ? 'SUGGESTION_EN_ATTENTE' : 'SUGGESTION_EN_ATTENTE',
            }
          : r
      )
    )

    toast.success(result.isResubmission 
      ? '✓ Justification resoumise à validation' 
      : '✓ Justification soumise à validation')
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2E5E]">Rapprochement Bancaire</h1>
        <p className="text-sm text-[#64748B]">
          Réconciliation Factures / ERP / Mouvements Bancaires
        </p>
      </div>

      {/* Info Banner */}
      <Card className="border-l-4 border-l-[#3B6FD4] bg-[#3B6FD4]/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 text-[#3B6FD4]" />
          <p className="text-sm text-[#1B2E5E]">
            <strong>Mode de rapprochement :</strong> Si le numéro de facture est disponible côté
            banque → rapprochement direct par numéro. Sinon → rapprochement par
            fournisseur/client + montant + date.
          </p>
        </CardContent>
      </Card>

      {/* Tabs: Principal / Historique */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'principal' | 'historique')}>
        <TabsList className="bg-white border border-[#DDE3EF]">
          <TabsTrigger value="principal">
            <CheckCircle className="mr-2 h-4 w-4" />
            Rapprochements Actifs
          </TabsTrigger>
          <TabsTrigger value="historique">
            <ArrowRight className="mr-2 h-4 w-4" />
            Historique (Rapprochés)
          </TabsTrigger>
        </TabsList>

        {/* TAB: PRINCIPAL - Active Reconciliations */}
        {activeTab === 'principal' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button
                className="bg-[#1B2E5E] text-white hover:bg-[#1B2E5E]/90"
                onClick={handleLancerRapprochement}
                disabled={isRunning}
              >
                <Play className="mr-2 h-4 w-4" />
                {isRunning ? 'Rapprochement en cours...' : 'Lancer le Rapprochement'}
              </Button>

              {/* Stats Pills */}
              <div className="flex items-center gap-3">
                <Badge className="bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20">
                  <Info className="mr-1 h-3 w-3" />
                  {stats.suggestionsEnAttente} Suggestions
                </Badge>
                <Badge className="bg-[#D97706]/10 text-[#D97706] hover:bg-[#D97706]/20">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {stats.ecarts} Écarts
                </Badge>
                <Badge className="bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20">
                  <XCircle className="mr-1 h-3 w-3" />
                  {stats.nonRapprochees} Non rapprochées
                </Badge>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Tiers Type Toggle */}
              <Tabs
                value={tiersFilter}
                onValueChange={(v) => {
                  setTiersFilter(v as 'fournisseurs' | 'clients')
                  setSelectedTiers('all')
                }}
              >
                <TabsList className="bg-white border border-[#DDE3EF]">
                  <TabsTrigger value="fournisseurs">Fournisseurs</TabsTrigger>
                  <TabsTrigger value="clients">Clients</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Tiers Select */}
              <Select value={selectedTiers} onValueChange={setSelectedTiers}>
                <SelectTrigger className="w-64 border-[#DDE3EF]">
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

              {/* Date Range (simplified for demo) */}
              <div className="flex items-center gap-2">
                <Input type="date" className="w-36 border-[#DDE3EF]" placeholder="De" />
                <span className="text-[#64748B]">à</span>
                <Input type="date" className="w-36 border-[#DDE3EF]" placeholder="À" />
              </div>

              {/* Status Filter Tabs */}
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="bg-white border border-[#DDE3EF]">
                  <TabsTrigger value="all">Tous</TabsTrigger>
                  <TabsTrigger value="SUGGESTION_EN_ATTENTE">💡 Suggestions</TabsTrigger>
                  <TabsTrigger value="ECART_DETECTE">Écarts détectés</TabsTrigger>
                  <TabsTrigger value="NON_RAPPROCHEE">Non rapprochées</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Reconciliation Cards */}
            <div className="space-y-4">
              {filteredRecos.length === 0 ? (
                <Card className="border-[#DDE3EF] bg-white p-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-[#64748B]">
                    <Search className="h-8 w-8" />
                    <p>Aucun rapprochement trouvé</p>
                  </div>
                </Card>
              ) : (
                filteredRecos.map((reco) => (
                  <ReconciliationCard
                    key={reco.id}
                    reconciliation={reco}
                    isExpanded={expandedIds.has(reco.id)}
                    onToggleExpand={() => handleToggleExpand(reco.id)}
                    onSubmitJustification={handleSubmitJustification}
                    ignoredSuggestions={ignoredSuggestions}
                    onValidateSuggestion={(recoId, factureId) => {
                      const reco = recos.find((r) => r.id === recoId)
                      if (!reco || !reco.mouvement) return
                      const suggestion = getSuggestions(reco.mouvement, invoices).find(
                        (s) => s.facture.id === factureId
                      )
                      if (!suggestion) return
                      setRecos((prev) =>
                        prev.map((r) =>
                          r.id === recoId
                            ? {
                                ...r,
                                invoice: { ...suggestion.facture, status: 'RAPPROCHE' },
                                score: {
                                  montant: suggestion.scoreDetail.montant,
                                  date: suggestion.scoreDetail.date,
                                  referenceFacture: suggestion.scoreDetail.reference,
                                  contrepartie: suggestion.scoreDetail.contrepartie,
                                  total: suggestion.score,
                                },
                                status: 'RAPPROCHEE',
                                validationDate: new Date(),
                              }
                            : r
                        )
                      )
                      toast.success(`✓ Rapprochement effectué via suggestion`)
                    }}
                    onIgnoreSuggestion={(recoId, factureId) => {
                      setIgnoredSuggestions((prev) => {
                        const newSet = new Set(prev)
                        newSet.add(`${recoId}-${factureId}`)
                        return newSet
                      })
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: HISTORIQUE - Reconciled Invoices */}
        {activeTab === 'historique' && (
          <div className="space-y-6">
            <Card className="border-[#DDE3EF] bg-white shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-[#64748B]">
                  📊 <strong>Historique de rapprochement</strong> - Factures complètement rapprochées (statut RAPPROCHE)
                </p>
              </CardContent>
            </Card>
            
            {/* Link to dedicated historique page */}
            <div className="text-center">
              <Button 
                asChild
                variant="outline"
                className="gap-2"
              >
                <Link href="/rapprochement-module/rapprochement/historique">Voir l'historique</Link>
              </Button>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  )
}

interface ReconciliationCardProps {
  reconciliation: Reconciliation
  isExpanded: boolean
  onToggleExpand: () => void
  onSubmitJustification: (id: string, justification: string) => void
  ignoredSuggestions: Set<string>
  onValidateSuggestion: (recoId: string, suggestionFactureId: string) => void
  onIgnoreSuggestion: (recoId: string, suggestionFactureId: string) => void
}

function ReconciliationCard({
  reconciliation: reco,
  isExpanded,
  onToggleExpand,
  onSubmitJustification,
  ignoredSuggestions,
  onValidateSuggestion,
  onIgnoreSuggestion,
}: ReconciliationCardProps) {
  const [justification, setJustification] = useState(reco.justification || '')
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(
    reco.status === 'SUGGESTION_EN_ATTENTE' || reco.status === 'NON_RAPPROCHEE'
  )

  // F-RAPP-03: Get suggestions for this reconciliation
  // Get ALL alternative factures that could match this mouvement (excluding current invoice)
  const otherFactures = invoices.filter((f) => f.id !== reco.invoice.id)
  const suggestions = reco.mouvement 
    ? getSuggestions(reco.mouvement, otherFactures).filter(
        (sugg) => !ignoredSuggestions.has(`${reco.id}-${sugg.facture.id}`)
      )
    : []
  const insight = suggestions.length > 0 ? getSuggestionInsight(suggestions[0]) : null

  const statusConfig = {
    RAPPROCHEE: {
      color: '#16A34A',
      borderColor: 'border-l-[#16A34A]',
      label: 'RAPPROCHÉE',
      icon: CheckCircle,
    },
    ECART_DETECTE: {
      color: '#D97706',
      borderColor: 'border-l-[#D97706]',
      label: 'ÉCART DÉTECTÉ',
      icon: AlertTriangle,
    },
    NON_RAPPROCHEE: {
      color: '#DC2626',
      borderColor: 'border-l-[#DC2626]',
      label: 'NON RAPPROCHÉE',
      icon: XCircle,
    },
    SUGGESTION_EN_ATTENTE: {
      color: '#3B82F6',
      borderColor: 'border-l-[#3B82F6]',
      label: 'SUGGESTION EN ATTENTE',
      icon: Info,
    },
  }

  const status = statusConfig[reco.status]
  const StatusIcon = status.icon

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      <Card className={cn('border-l-4 border-[#DDE3EF] bg-white shadow-sm', status.borderColor)}>
        <CardContent className="p-0">
          {/* Main Row */}
          <div className="flex items-stretch">
            {/* Left Panel - Invoice */}
            <div className="flex-1 border-r border-[#DDE3EF] p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[#3B6FD4]">
                  FACTURE
                </span>
                <Badge
                  className={cn(
                    reco.invoice.source === 'ERP' && 'bg-[#7C3AED] text-white',
                    reco.invoice.source === 'OCR' && 'bg-[#3B6FD4] text-white',
                    reco.invoice.source === 'MANUELLE' && 'bg-[#64748B] text-white'
                  )}
                >
                  {reco.invoice.source}
                </Badge>
              </div>
              <p className="text-lg font-bold text-[#1B2E5E]">{reco.invoice.numero}</p>
              <p className="text-sm text-[#64748B]">{reco.invoice.tiersNom}</p>
              <p className="text-sm text-[#64748B]">{formatDate(reco.invoice.dateEmission)}</p>
              <p className="mt-2 text-xl font-bold text-[#1B2E5E]">
                {formatAmount(reco.invoice.montantTTC)}
              </p>
            </div>

            {/* Center Panel - Score */}
            <div className="flex w-40 flex-col items-center justify-center gap-2 bg-[#F4F6FB] p-4">
              <div
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white',
                  getScoreBgClass(reco.score.total)
                )}
              >
                {reco.score.total}
              </div>
              <ArrowRight className="h-5 w-5 text-[#64748B]" />
              <Badge
                className="gap-1"
                style={{ backgroundColor: status.color, color: 'white' }}
              >
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>

            {/* Right Panel - Bank Movement */}
            <div className="flex-1 p-4">
              <div className="mb-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[#64748B]">
                  MOUVEMENT BANCAIRE
                </span>
              </div>
              {reco.mouvement ? (
                <>
                  <p className="text-lg font-bold text-[#1B2E5E]">{reco.mouvement.reference}</p>
                  <p className="text-sm text-[#64748B]">{formatDate(reco.mouvement.dateValeur)}</p>
                  <p className="mt-2 text-xl font-bold text-[#1B2E5E]">
                    {formatAmount(reco.mouvement.montant)}
                  </p>
                  <p className="text-sm text-[#64748B]">{reco.mouvement.banque}</p>
                </>
              ) : (
                <div className="flex h-full flex-col items-start justify-center">
                  <p className="text-sm text-[#DC2626]">
                    Aucun mouvement bancaire correspondant trouvé
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626]/10"
                  >
                    Investiguer
                  </Button>
                </div>
              )}
            </div>

          {/* Expand Toggle - For ECART_DETECTE and NON_RAPPROCHEE */}
            {(reco.status === 'ECART_DETECTE' || reco.status === 'NON_RAPPROCHEE') && (
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="m-2 h-8 w-8 self-center text-[#64748B]"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            )}
          </div>

          {/* Expanded Content for Écart and Non Rapprochée */}
          {(reco.status === 'ECART_DETECTE' || reco.status === 'NON_RAPPROCHEE') && (
            <CollapsibleContent>
              <div className="border-t border-[#DDE3EF] bg-[#F4F6FB]/50 p-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Left Column: Score Breakdown (ECART_DETECTE only) + Suggestions (both) */}
                  <div>
                    {reco.status === 'ECART_DETECTE' && (
                      <>
                        <h4 className="mb-3 font-semibold text-[#1B2E5E]">Détail du score</h4>
                        <div className="space-y-3 mb-6">
                          {[
                            { label: 'Montant', points: reco.score.montant, max: 40 },
                            { label: 'Date', points: reco.score.date, max: 25 },
                            { label: 'Référence facture', points: reco.score.referenceFacture, max: 25 },
                            { label: 'Contrepartie', points: reco.score.contrepartie, max: 10 },
                          ].map((item) => (
                            <div key={item.label} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[#64748B]">{item.label}</span>
                                <span className="font-mono text-[#1B2E5E]">
                                  {item.points} / {item.max}
                                </span>
                              </div>
                              <Progress
                                value={(item.points / item.max) * 100}
                                className="h-2"
                                style={
                                  {
                                    '--progress-background': getScoreColor(
                                      (item.points / item.max) * 100
                                    ),
                                  } as React.CSSProperties
                                }
                              />
                            </div>
                          ))}
                          <div className="mt-2 flex items-center justify-between border-t border-[#DDE3EF] pt-2">
                            <span className="font-semibold text-[#1B2E5E]">TOTAL</span>
                            <span
                              className="text-lg font-bold"
                              style={{ color: getScoreColor(reco.score.total) }}
                            >
                              {reco.score.total} / 100
                            </span>
                          </div>
                        </div>

                        {/* ERP Entry */}
                        {reco.erpEntry && (
                          <div className="mt-4 rounded-lg border border-[#DDE3EF] bg-white p-3">
                            <h5 className="mb-2 text-xs font-medium uppercase tracking-wider text-[#7C3AED]">
                              Écriture ERP
                            </h5>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-[#64748B]">Référence:</span>
                                <p className="font-mono text-[#1B2E5E]">{reco.erpEntry.reference}</p>
                              </div>
                              <div>
                                <span className="text-[#64748B]">Montant:</span>
                                <p className="font-mono text-[#1B2E5E]">
                                  {formatAmount(reco.erpEntry.montant)}
                                </p>
                              </div>
                              <div>
                                <span className="text-[#64748B]">Date:</span>
                                <p className="text-[#1B2E5E]">{formatDate(reco.erpEntry.date)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* F-RAPP-03: Matching Proposés / Suggestions Intelligentes */}
                    <div>
                      <Collapsible open={suggestionsExpanded} onOpenChange={setSuggestionsExpanded}>
                        <div className="mb-3 flex items-center justify-between">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="gap-2 p-0 text-left font-semibold text-[#1B2E5E] hover:bg-transparent">
                              <Sparkles className="h-4 w-4 text-[#3B6FD4]" />
                              <span>
                                {reco.status === 'ECART_DETECTE' ? 'Matching proposés' : 'Suggestions intelligentes'} ({suggestions.length})
                              </span>
                              {suggestionsExpanded ? (
                                <ChevronUp className="ml-auto h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-auto h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>

                        <CollapsibleContent className="space-y-4">
                          {suggestions.length === 0 ? (
                            <p className="text-sm text-[#64748B]">
                              Aucune suggestion disponible. Vous pouvez rapprocher manuellement ou saisir une justification.
                            </p>
                          ) : (
                            <>
                              {/* Assistant de décision - Best Suggestion */}
                              {insight && (
                                <Card className="border border-[#3B6FD4] bg-[#3B6FD4]/5">
                                  <CardContent className="space-y-3 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <h5 className="font-semibold text-[#1B2E5E]">
                                          Meilleure suggestion: {suggestions[0].facture.numero} ({suggestions[0].score}/100)
                                        </h5>
                                        <Badge className="mt-2 gap-1">
                                          Confiance {insight.confidence}
                                        </Badge>
                                        <p className="mt-2 text-sm italic text-[#64748B]">
                                          💡 {insight.recommendation}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Strengths & Weaknesses */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="font-medium text-[#16A34A]">✓ Points forts:</p>
                                        <ul className="mt-1 space-y-1 text-[#64748B]">
                                          {insight.strengths.map((str, idx) => (
                                            <li key={idx}>• {str}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <p className="font-medium text-[#DC2626]">⚠ Points de vigilance:</p>
                                        <ul className="mt-1 space-y-1 text-[#64748B]">
                                          {insight.weaknesses.map((weak, idx) => (
                                            <li key={idx}>• {weak}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Suggestion Cards */}
                              <div className="space-y-3">
                                {suggestions.slice(0, 3).map((suggestion, idx) => (
                                  <SuggestionCard
                                    key={idx}
                                    suggestion={suggestion}
                                    onValidate={() => onValidateSuggestion(reco.id, suggestion.facture.id)}
                                    onIgnore={() => onIgnoreSuggestion(reco.id, suggestion.facture.id)}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>

                  {/* Right Column: Justification */}
                  <div>
                    <h4 className="mb-3 font-semibold text-[#1B2E5E]">
                      {reco.status === 'ECART_DETECTE' 
                        ? 'Justification du trésorier' 
                        : 'Justification / Rapprochement manuel'}
                    </h4>
                    <Textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      placeholder={reco.status === 'ECART_DETECTE'
                        ? "Expliquez l'écart constaté..."
                        : "Saisissez une justification ou une explication pour cette facture non rapprochée..."}
                      className="min-h-32 border-[#DDE3EF]"
                    />
                    {reco.justificationDate && (
                      <p className="mt-2 text-xs text-[#64748B]">
                        Dernière mise à jour: {formatDate(reco.justificationDate)}
                      </p>
                    )}
                    <Button
                      className="mt-3 bg-[#1B2E5E] text-white hover:bg-[#1B2E5E]/90"
                      onClick={() => onSubmitJustification(reco.id, justification)}
                      disabled={!justification.trim()}
                    >
                      Soumettre la justification
                    </Button>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          )}
        </CardContent>
      </Card>
    </Collapsible>
  )
}
