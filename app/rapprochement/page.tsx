'use client'

<<<<<<< HEAD
import { useState } from 'react'
import { Play, CheckCircle, AlertTriangle, XCircle, Info, Search, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
=======
import { useState, useMemo } from 'react'
import { Play, CheckCircle, AlertTriangle, XCircle, Info, Search, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
<<<<<<< HEAD
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
=======
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
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
<<<<<<< HEAD
import { reconciliations, additionalReconciliations, fournisseurs, clients } from '@/lib/mock-data'
import type { Reconciliation } from '@/lib/types'
import { formatAmount, formatDate, getScoreColor, getScoreBgClass } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const allReconciliations = [...reconciliations, ...additionalReconciliations]

export default function RapprochementPage() {
  const [recos, setRecos] = useState<Reconciliation[]>(allReconciliations)
=======
import { reconciliations as initialReconciliations, fournisseurs, clients, invoices, mouvementsBancaires } from '@/lib/rapprochement-mock-data'
import type { Reconciliation } from '@/lib/rapprochement-types'
import { formatAmount, formatDate, getScoreBgClass, getStatusColor } from '@/lib/rapprochement-format'
import { getSuggestions, getSuggestionInsight } from '@/lib/matching-engine'
import { SuggestionCard } from '@/components/rapprochement/suggestion-card'
import { useProactiveMatching } from '@/hooks/use-proactive-matching'
import { useRapprochement } from '@/lib/rapprochement-context'
import Link from 'next/link'

export default function RapprochementPage() {
  const [recos, setRecos] = useState<Reconciliation[]>(initialReconciliations)
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
  const [tiersFilter, setTiersFilter] = useState<'fournisseurs' | 'clients'>('fournisseurs')
  const [selectedTiers, setSelectedTiers] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
<<<<<<< HEAD
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['r2', 'r5']))
  const [isRunning, setIsRunning] = useState(false)
=======
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [isRunning, setIsRunning] = useState(false)
  const [ignoredSuggestions, setIgnoredSuggestions] = useState<Set<string>>(new Set())
  const { submitJustification } = useRapprochement()

  // Auto-matching on load
  useProactiveMatching({
    factures: invoices,
    mouvements: mouvementsBancaires,
    reconciliations: recos,
    setReconciliations: setRecos,
  })
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47

  const tiers = tiersFilter === 'fournisseurs' ? fournisseurs : clients

  const filteredRecos = recos.filter((r) => {
<<<<<<< HEAD
    const matchesType = tiersFilter === 'fournisseurs' 
      ? r.invoice.type === 'RECUE' 
      : r.invoice.type === 'EMISE'
=======
    const matchesType = tiersFilter === 'fournisseurs' ? r.invoice.type === 'RECUE' : r.invoice.type === 'EMISE'
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
    const matchesTiers = selectedTiers === 'all' || r.invoice.tiersId === selectedTiers
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesSearch =
      r.invoice.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.invoice.tiersNom.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesTiers && matchesStatus && matchesSearch
  })

  const stats = {
<<<<<<< HEAD
    rapprochees: filteredRecos.filter((r) => r.status === 'RAPPROCHEE').length,
    ecarts: filteredRecos.filter((r) => r.status === 'ECART_DETECTE').length,
    nonRapprochees: filteredRecos.filter((r) => r.status === 'NON_RAPPROCHEE').length,
=======
    rapprochees: filteredRecos.filter((r) => (r.status as string) === 'RAPPROCHEE').length,
    ecarts: filteredRecos.filter((r) => (r.status as string) === 'ECART_DETECTE').length,
    nonRapprochees: filteredRecos.filter((r) => (r.status as string) === 'NON_RAPPROCHEE').length,
    suggestionsEnAttente: filteredRecos.filter((r) => (r.status as string) === 'SUGGESTION_EN_ATTENTE').length,
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
  }

  const handleLancerRapprochement = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
<<<<<<< HEAD
      toast.success('Rapprochement terminé avec succès')
=======
      alert('Rapprochement terminé')
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
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

<<<<<<< HEAD
  const handleSubmitJustification = (id: string, justification: string) => {
    setRecos((prev) =>
      prev.map((r) =>
        r.id === id
=======
  const handleSubmitJustification = (recoId: string, justification: string) => {
    if (!justification.trim()) {
      alert('Veuillez saisir une justification')
      return
    }

    const reco = recos.find((r) => r.id === recoId)
    if (!reco) return

    const result = submitJustification({
      invoiceId: reco.invoice.id,
      reconciliationId: recoId,
      justification,
    })

    setRecos((prev) =>
      prev.map((r) =>
        r.id === recoId
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
          ? {
              ...r,
              justification,
              justificationDate: new Date(),
<<<<<<< HEAD
              status: 'ECART_DETECTE' as const,
=======
              status: 'SUGGESTION_EN_ATTENTE',
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
            }
          : r
      )
    )
<<<<<<< HEAD
    toast.success('Justification soumise pour validation')
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2E5E]">Rapprochement Bancaire</h1>
        <p className="text-sm text-[#64748B]">
=======

    alert(result.isResubmission ? '✓ Justification resoumise à validation' : '✓ Justification soumise à validation')
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1B2E5E]">Rapprochement Bancaire</h1>
        <p className="text-sm text-[#64748B] mt-2">
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
          Réconciliation Factures / ERP / Mouvements Bancaires
        </p>
      </div>

      {/* Info Banner */}
      <Card className="border-l-4 border-l-[#3B6FD4] bg-[#3B6FD4]/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 text-[#3B6FD4]" />
          <p className="text-sm text-[#1B2E5E]">
<<<<<<< HEAD
            <strong>Mode de rapprochement :</strong> Si le numéro de facture est disponible côté
            banque → rapprochement direct par numéro. Sinon → rapprochement par
            fournisseur/client + montant + date.
=======
            <strong>Guide de rapprochement:</strong> Le système valide automatiquement les matches avec score ≥85%, propose les scores 60-84% et marque les autres en attente de justification manuelle.
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
          </p>
        </CardContent>
      </Card>

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
          <Badge className="bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            {stats.rapprochees} Rapprochées
          </Badge>
<<<<<<< HEAD
=======
          <Badge className="bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20">
            <Info className="mr-1 h-3 w-3" />
            {stats.suggestionsEnAttente} Suggestions
          </Badge>
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
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
<<<<<<< HEAD
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
            <TabsTrigger value="RAPPROCHEE">Rapprochées</TabsTrigger>
            <TabsTrigger value="ECART_DETECTE">Écarts détectés</TabsTrigger>
            <TabsTrigger value="NON_RAPPROCHEE">Non rapprochées</TabsTrigger>
          </TabsList>
        </Tabs>
=======
      <div className="flex flex-wrap items-center gap-4 bg-[#F8FAFC] border border-[#DDE3EF] rounded-lg p-4">
        {/* Tiers Type */}
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Type</label>
          <Select value={tiersFilter} onValueChange={(v) => {
            setTiersFilter(v as 'fournisseurs' | 'clients')
            setSelectedTiers('all')
          }}>
            <SelectTrigger className="w-40 border-[#DDE3EF]">
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
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Statut</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-56 border-[#DDE3EF]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="RAPPROCHEE">Rapprochées</SelectItem>
              <SelectItem value="SUGGESTION_EN_ATTENTE">Suggestions</SelectItem>
              <SelectItem value="ECART_DETECTE">Écarts détectés</SelectItem>
              <SelectItem value="NON_RAPPROCHEE">Non rapprochées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-[#64748B] mb-1">Rechercher</label>
          <Input
            placeholder="Numéro facture ou tiers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-[#DDE3EF]"
          />
        </div>
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
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
<<<<<<< HEAD
=======
              ignoredSuggestions={ignoredSuggestions}
              onValidateSuggestion={(recoId, factureId) => {
                const reco = recos.find((r) => r.id === recoId)
                if (!reco || !reco.mouvement) return
                const suggestion = getSuggestions(reco.mouvement, invoices as any).find((s) => s.facture.id === factureId)
                if (!suggestion) return
                setRecos((prev) =>
                  prev.map((r) =>
                    r.id === recoId
                      ? {
                          ...r,
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
                alert(`✓ Rapprochement effectué via suggestion`)
              }}
              onIgnoreSuggestion={(recoId, factureId) => {
                setIgnoredSuggestions((prev) => {
                  const newSet = new Set(prev)
                  newSet.add(`${recoId}-${factureId}`)
                  return newSet
                })
              }}
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
            />
          ))
        )}
      </div>
    </div>
  )
}

interface ReconciliationCardProps {
  reconciliation: Reconciliation
  isExpanded: boolean
  onToggleExpand: () => void
  onSubmitJustification: (id: string, justification: string) => void
<<<<<<< HEAD
=======
  ignoredSuggestions: Set<string>
  onValidateSuggestion: (recoId: string, suggestionFactureId: string) => void
  onIgnoreSuggestion: (recoId: string, suggestionFactureId: string) => void
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
}

function ReconciliationCard({
  reconciliation: reco,
  isExpanded,
  onToggleExpand,
  onSubmitJustification,
<<<<<<< HEAD
}: ReconciliationCardProps) {
  const [justification, setJustification] = useState(reco.justification || '')

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
  }

  const status = statusConfig[reco.status]
=======
  ignoredSuggestions,
  onValidateSuggestion,
  onIgnoreSuggestion,
}: ReconciliationCardProps) {
  const [justification, setJustification] = useState(reco.justification || '')
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(
    reco.status === 'SUGGESTION_EN_ATTENTE' || reco.status === 'NON_RAPPROCHEE'
  )

  const otherFactures = invoices.filter((f) => f.id !== reco.invoice.id)
  const suggestions = reco.mouvement
    ? getSuggestions(reco.mouvement, otherFactures as any).filter(
        (sugg: any) => !ignoredSuggestions.has(`${reco.id}-${sugg.facture.id}`)
      )
    : []
  const insight = suggestions.length > 0 ? getSuggestionInsight(suggestions[0]) : null

  const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    RAPPROCHEE: { color: '#16A34A', label: 'RAPPROCHÉE', icon: CheckCircle },
    ECART_DETECTE: { color: '#D97706', label: 'ÉCART DÉTECTÉ', icon: AlertTriangle },
    NON_RAPPROCHEE: { color: '#DC2626', label: 'NON RAPPROCHÉE', icon: XCircle },
    SUGGESTION_EN_ATTENTE: { color: '#3B82F6', label: 'SUGGESTION EN ATTENTE', icon: Info },
  }

  const status = statusConfig[reco.status] || statusConfig.NON_RAPPROCHEE
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
  const StatusIcon = status.icon

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
<<<<<<< HEAD
      <Card className={cn('border-l-4 border-[#DDE3EF] bg-white shadow-sm', status.borderColor)}>
=======
      <Card className="border-l-4 border-[#DDE3EF] bg-white shadow-sm" style={{ borderLeftColor: status.color }}>
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
        <CardContent className="p-0">
          {/* Main Row */}
          <div className="flex items-stretch">
            {/* Left Panel - Invoice */}
            <div className="flex-1 border-r border-[#DDE3EF] p-4">
              <div className="mb-2 flex items-center gap-2">
<<<<<<< HEAD
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
=======
                <span className="text-xs font-medium uppercase tracking-wider text-[#3B6FD4]">FACTURE</span>
                <Badge className="bg-[#7C3AED] text-white text-xs">{reco.invoice.source}</Badge>
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
              </div>
              <p className="text-lg font-bold text-[#1B2E5E]">{reco.invoice.numero}</p>
              <p className="text-sm text-[#64748B]">{reco.invoice.tiersNom}</p>
              <p className="text-sm text-[#64748B]">{formatDate(reco.invoice.dateEmission)}</p>
<<<<<<< HEAD
              <p className="mt-2 text-xl font-bold text-[#1B2E5E]">
                {formatAmount(reco.invoice.montantTTC)}
              </p>
=======
              <p className="mt-2 text-xl font-bold text-[#1B2E5E]">{formatAmount(reco.invoice.montantTTC)}</p>
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
            </div>

            {/* Center Panel - Score */}
            <div className="flex w-40 flex-col items-center justify-center gap-2 bg-[#F4F6FB] p-4">
              <div
<<<<<<< HEAD
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
=======
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
                style={{ backgroundColor: status.color }}
              >
                {reco.score.total}
              </div>
              <Badge style={{ backgroundColor: status.color, color: 'white' }} className="gap-1">
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>

            {/* Right Panel - Bank Movement */}
            <div className="flex-1 p-4">
              <div className="mb-2">
<<<<<<< HEAD
                <span className="text-xs font-medium uppercase tracking-wider text-[#64748B]">
                  MOUVEMENT BANCAIRE
                </span>
=======
                <span className="text-xs font-medium uppercase tracking-wider text-[#64748B]">MOUVEMENT BANCAIRE</span>
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
              </div>
              {reco.mouvement ? (
                <>
                  <p className="text-lg font-bold text-[#1B2E5E]">{reco.mouvement.reference}</p>
                  <p className="text-sm text-[#64748B]">{formatDate(reco.mouvement.dateValeur)}</p>
<<<<<<< HEAD
                  <p className="mt-2 text-xl font-bold text-[#1B2E5E]">
                    {formatAmount(reco.mouvement.montant)}
                  </p>
=======
                  <p className="mt-2 text-xl font-bold text-[#1B2E5E]">{formatAmount(Math.abs(reco.mouvement.montant))}</p>
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
                  <p className="text-sm text-[#64748B]">{reco.mouvement.banque}</p>
                </>
              ) : (
                <div className="flex h-full flex-col items-start justify-center">
<<<<<<< HEAD
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
=======
                  <p className="text-sm text-[#DC2626]">Aucun mouvement bancaire correspondant</p>
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
                </div>
              )}
            </div>

            {/* Expand Toggle */}
<<<<<<< HEAD
            {reco.status === 'ECART_DETECTE' && (
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
=======
            {(reco.status === 'ECART_DETECTE' || reco.status === 'NON_RAPPROCHEE' || reco.status === 'SUGGESTION_EN_ATTENTE') && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="m-2 h-8 w-8 self-center text-[#64748B]">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
                </Button>
              </CollapsibleTrigger>
            )}
          </div>

<<<<<<< HEAD
          {/* Expanded Content for Écart */}
          {reco.status === 'ECART_DETECTE' && (
            <CollapsibleContent>
              <div className="border-t border-[#DDE3EF] bg-[#F4F6FB]/50 p-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Score Breakdown */}
                  <div>
                    <h4 className="mb-3 font-semibold text-[#1B2E5E]">Détail du score</h4>
                    <div className="space-y-3">
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
                  </div>

                  {/* Justification */}
                  <div>
                    <h4 className="mb-3 font-semibold text-[#1B2E5E]">Justification du trésorier</h4>
                    <Textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      placeholder="Expliquez l'écart constaté..."
=======
          {/* Expanded Content */}
          {(reco.status === 'ECART_DETECTE' || reco.status === 'NON_RAPPROCHEE' || reco.status === 'SUGGESTION_EN_ATTENTE') && (
            <CollapsibleContent>
              <div className="border-t border-[#DDE3EF] bg-[#F4F6FB]/50 p-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Left: Score Details + Suggestions */}
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
                              <div className="h-2 bg-[#E2E8F0] rounded" style={{
                                background: `linear-gradient(to right, #16A34A 0%, #16A34A ${(item.points / item.max) * 100}%, #E2E8F0 ${(item.points / item.max) * 100}%, #E2E8F0 100%)`
                              }} />
                            </div>
                          ))}
                          <div className="mt-2 flex items-center justify-between border-t border-[#DDE3EF] pt-2">
                            <span className="font-semibold text-[#1B2E5E]">TOTAL</span>
                            <span className="text-lg font-bold" style={{ color: status.color }}>
                              {reco.score.total} / 100
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Suggestions */}
                    <div>
                      <h4 className="mb-3 font-semibold text-[#1B2E5E]">
                        {reco.status === 'ECART_DETECTE' ? 'Matching proposés' : 'Suggestions intelligentes'} ({suggestions.length})
                      </h4>
                      {suggestions.length === 0 ? (
                        <p className="text-sm text-[#64748B]">Aucune suggestion disponible</p>
                      ) : (
                        <>
                          {insight && (
                            <Card className="border border-[#3B6FD4] bg-[#3B6FD4]/5 mb-4">
                              <CardContent className="space-y-3 p-4">
                                <div>
                                  <h5 className="font-semibold text-[#1B2E5E]">
                                    Meilleure suggestion: {suggestions[0].facture.numero} ({suggestions[0].score}/100)
                                  </h5>
                                  <Badge className="mt-2">Confiance {insight.confidence}</Badge>
                                  <p className="mt-2 text-sm italic text-[#64748B]">💡 {insight.recommendation}</p>
                                </div>
                              </CardContent>
                            </Card>
                          )}
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
                    </div>
                  </div>

                  {/* Right: Justification */}
                  <div>
                    <h4 className="mb-3 font-semibold text-[#1B2E5E]">Justification</h4>
                    <Textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      placeholder="Saisissez une justification ou une explication..."
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
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
