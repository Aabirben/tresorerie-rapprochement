'use client'

import { useMemo, useState } from 'react'
import { Upload, FileUp, Loader2, Plus, Trash2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Invoice, InvoiceLine, InvoiceType } from '@/lib/types'
import { clients, comptesCharges, comptesProduits, fournisseurs } from '@/lib/mock-data'
import { formatAmount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface InvoiceFormV2Props {
  invoice?: Invoice | null
  invoiceType: InvoiceType
  mode: 'manual' | 'ocr'
  onSave: (invoice: Invoice) => void
  onCancel: () => void
}

type OcrStep = 1 | 2 | 3

const tvaRates = [0, 7, 10, 14, 20]

export function InvoiceFormV2({ invoice, invoiceType, mode, onSave, onCancel }: InvoiceFormV2Props) {
  const isOcrMode = mode === 'ocr'
  const [ocrStep, setOcrStep] = useState<OcrStep>(isOcrMode ? 1 : 3)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [ocrFile, setOcrFile] = useState<File | null>(null)
  const [ocrFields, setOcrFields] = useState<Set<string>>(new Set())

  const tiers = invoiceType === 'RECUE' ? fournisseurs : clients
  const comptes = invoiceType === 'RECUE' ? comptesCharges : comptesProduits

  const [formData, setFormData] = useState<Partial<Invoice>>({
    type: invoiceType,
    numero: invoice?.numero || '',
    tiersId: invoice?.tiersId || '',
    tiersNom: invoice?.tiersNom || '',
    tiersIce: invoice?.tiersIce || '',
    dateEmission: invoice?.dateEmission || new Date(),
    dateEcheance: invoice?.dateEcheance || new Date(),
    source: invoice?.source || (isOcrMode ? 'OCR' : 'MANUELLE'),
    lignes: invoice?.lignes || [],
    montantHT: invoice?.montantHT || 0,
    montantTva: invoice?.montantTva || 0,
    montantTTC: invoice?.montantTTC || 0,
    montantDu: invoice?.montantDu || 0,
    devise: invoice?.devise || 'MAD',
    statutPaiement: invoice?.statutPaiement || 'Non payée',
    description: invoice?.description || '',
    status: invoice?.status || 'NON_RAPPROCHE',
  })

  const [newLine, setNewLine] = useState<Partial<InvoiceLine>>({
    description: '',
    compte: '',
    compteLabel: '',
    quantite: 1,
    prixUnitaireHT: 0,
    tauxTva: 20,
  })

  const isOcrExtractionDone = ocrFields.size > 0
  const canEditInvoice = !isOcrMode || ocrStep === 3
  const canSaveInvoice = !isOcrMode || (ocrStep === 3 && !!ocrFile && isOcrExtractionDone && !isAnalyzing)
  const ocrStepLabels: Record<OcrStep, string> = {
    1: 'Importer',
    2: 'Extraction',
    3: 'Validation',
  }

  const getSaveLockReason = () => {
    if (!isOcrMode) return null
    if (!ocrFile) return 'Sélectionnez un fichier OCR pour activer la sauvegarde.'
    if (isAnalyzing) return 'Patientez pendant l’analyse OCR en cours.'
    if (ocrStep < 3) return 'Passez à l’étape 3 (Validation) pour sauvegarder.'
    if (!isOcrExtractionDone) return 'Lancez l’extraction OCR avant la sauvegarde.'
    return null
  }

  const computeEcheanceDate = (tiersId: string, emissionDate: Date): Date => {
    const selectedTiers = tiers.find((item) => item.id === tiersId)
    if (!selectedTiers) {
      return emissionDate
    }
    const dateEcheance = new Date(emissionDate)
    dateEcheance.setDate(dateEcheance.getDate() + selectedTiers.delaiPaiement)
    return dateEcheance
  }

  const lineTotals = (line: Partial<InvoiceLine>) => {
    const montantHT = (line.quantite || 0) * (line.prixUnitaireHT || 0)
    const montantTva = montantHT * ((line.tauxTva || 0) / 100)
    const montantTTC = montantHT + montantTva
    return { montantHT, montantTva, montantTTC }
  }

  const recalcTotals = (lines: InvoiceLine[]) => {
    const montantHT = lines.reduce((acc, line) => acc + line.montantHT, 0)
    const montantTva = lines.reduce((acc, line) => acc + line.montantTva, 0)
    const montantTTC = lines.reduce((acc, line) => acc + line.montantTTC, 0)
    return { montantHT, montantTva, montantTTC, montantDu: montantTTC }
  }

  const ocrSummary = useMemo(() => {
    if (!ocrFile) return null
    const baseNumber = ocrFile.name.replace(/\.[^.]+$/, '').slice(0, 12).toUpperCase()
    const numero = `OCR-${baseNumber || '2026-0001'}`
    const selectedTiers = tiers[0]
    const lineHT = invoiceType === 'RECUE' ? 32500 : 78000
    const lineTVA = lineHT * 0.2
    const lineTTC = lineHT + lineTVA

    return {
      numero,
      tiersId: selectedTiers?.id || '',
      tiersNom: selectedTiers?.raisonSociale || '',
      tiersIce: selectedTiers?.ice || '',
      dateEmission: new Date(),
      lignes: [
        {
          id: `ocr-${Date.now()}`,
          description: isOcrMode ? 'Ligne extraite OCR' : 'Ligne simulée',
          compte: comptes[0]?.code || '',
          compteLabel: comptes[0]?.label || '',
          quantite: 1,
          prixUnitaireHT: lineHT,
          tauxTva: 20,
          montantHT: lineHT,
          montantTva: lineTVA,
          montantTTC: lineTTC,
        },
      ] as InvoiceLine[],
    }
  }, [ocrFile, tiers, invoiceType, comptes, isOcrMode])

  const applyOcrExtraction = () => {
    if (!ocrSummary) return
    const totals = recalcTotals(ocrSummary.lignes)
    setFormData((prev) => ({
      ...prev,
      ...ocrSummary,
      ...totals,
      source: 'OCR',
    }))
    setOcrFields(new Set(['numero', 'tiersId', 'dateEmission', 'lignes', 'montants']))
  }

  const handleLaunchOcr = () => {
    if (!ocrFile) {
      toast.error('Veuillez sélectionner un fichier avant de lancer l’analyse OCR.')
      return
    }

    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      applyOcrExtraction()
      setOcrStep(2)
    }, 1500)
  }

  const handleFile = (file: File | null) => {
    if (!file) {
      setOcrFile(null)
      return
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    const fileName = file.name.toLowerCase()
    const hasAllowedExtension = ['.pdf', '.jpg', '.jpeg', '.png'].some((extension) => fileName.endsWith(extension))
    const hasAllowedMimeType = file.type ? allowedTypes.includes(file.type) : false

    if (!hasAllowedMimeType && !hasAllowedExtension) {
      setOcrFile(null)
      toast.error('Format invalide. Utilisez PDF, JPG ou PNG.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setOcrFile(null)
      toast.error('Fichier trop volumineux. Maximum 10 Mo.')
      return
    }

    setOcrFile(file)
    setOcrStep(1)
    setOcrFields(new Set())
  }

  const handleTiersChange = (tiersId: string) => {
    if (!canEditInvoice) {
      toast.error('Passez à l’étape 3 pour modifier les informations de la facture.')
      return
    }

    const selectedTiers = tiers.find((item) => item.id === tiersId)
    if (!selectedTiers) return

    const dateEmission = formData.dateEmission || new Date()
    const dateEcheance = computeEcheanceDate(tiersId, dateEmission)

    setFormData((prev) => ({
      ...prev,
      tiersId,
      tiersNom: selectedTiers.raisonSociale,
      tiersIce: selectedTiers.ice,
      dateEcheance,
    }))
  }

  const handleAddLine = () => {
    if (!canEditInvoice) {
      toast.error('Passez à l’étape 3 pour modifier les lignes.')
      return
    }
    if (!newLine.description || !newLine.compte || !newLine.compteLabel) {
      toast.error('Complétez la description et le compte de la ligne.')
      return
    }
    const totals = lineTotals(newLine)
    const line: InvoiceLine = {
      id: `line-${Date.now()}`,
      description: newLine.description,
      compte: newLine.compte,
      compteLabel: newLine.compteLabel,
      quantite: newLine.quantite || 1,
      prixUnitaireHT: newLine.prixUnitaireHT || 0,
      tauxTva: newLine.tauxTva || 20,
      ...totals,
    }

    const lines = [...(formData.lignes || []), line]
    setFormData((prev) => ({ ...prev, lignes: lines, ...recalcTotals(lines) }))
    setNewLine({ description: '', compte: '', compteLabel: '', quantite: 1, prixUnitaireHT: 0, tauxTva: 20 })
  }

  const handleRemoveLine = (index: number) => {
    if (!canEditInvoice) {
      toast.error('Passez à l’étape 3 pour modifier les lignes.')
      return
    }
    const lines = (formData.lignes || []).filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, lignes: lines, ...recalcTotals(lines) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isOcrMode) {
      if (!ocrFile) {
        toast.error('Import OCR requis: veuillez sélectionner un fichier.')
        return
      }
      if (ocrStep < 3) {
        toast.error('Terminez le workflow OCR en 3 étapes avant de sauvegarder.')
        return
      }
      if (!isOcrExtractionDone) {
        toast.error('Aucune donnée OCR extraite. Lancez d’abord l’analyse OCR.')
        return
      }
    }

    if (!formData.numero || !formData.tiersId) {
      toast.error('Numéro de facture et tiers sont obligatoires.')
      return
    }
    if (!formData.lignes || formData.lignes.length === 0) {
      toast.error('Ajoutez au moins une ligne de facture.')
      return
    }

    const safeDateEmission = formData.dateEmission || new Date()
    const safeDateEcheance = formData.dateEcheance || computeEcheanceDate(formData.tiersId, safeDateEmission)

    const payload: Invoice = {
      ...(formData as Invoice),
      id: invoice?.id || '',
      dateEmission: safeDateEmission,
      dateEcheance: safeDateEcheance,
      source: isOcrMode ? 'OCR' : (formData.source || 'MANUELLE'),
      status: invoice?.status || 'EN_ATTENTE',
      createdAt: invoice?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    onSave(payload)

    if (isOcrMode) {
      toast.success('Facture importée et enregistrée avec succès.')
    } else {
      toast.success('Facture créée avec succès.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2E5E]">
          {invoice ? 'Modifier la facture' : invoiceType === 'RECUE' ? 'Nouvelle Facture Reçue' : 'Nouvelle Facture Émise'}
        </h1>
        {isOcrMode && (
          <p className="mt-1 text-sm text-sky-700">Mode OCR assisté: import guidé + validation avant enregistrement.</p>
        )}
      </div>

      {isOcrMode && (
        <Card className="border-[#DDE3EF] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#1B2E5E]">Import OCR en 3 étapes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(ocrStepLabels) as unknown as OcrStep[]).map((stepNumber) => {
                const isDone = stepNumber < ocrStep
                const isCurrent = stepNumber === ocrStep
                return (
                  <div
                    key={stepNumber}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium',
                      isDone && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                      isCurrent && 'border-sky-200 bg-sky-50 text-sky-700',
                      !isDone && !isCurrent && 'border-[#DDE3EF] bg-white text-[#64748B]'
                    )}
                  >
                    {isDone ? <CheckCircle className="h-3.5 w-3.5" /> : <span>{stepNumber}</span>}
                    {ocrStepLabels[stepNumber]}
                  </div>
                )
              })}
            </div>

            {ocrStep === 1 && (
              <div className="space-y-3">
                <div
                  className="rounded-lg border-2 border-dashed border-[#DDE3EF] p-6 text-center"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    handleFile(event.dataTransfer.files?.[0] || null)
                  }}
                >
                  <Upload className="mx-auto h-8 w-8 text-[#64748B]" />
                  <p className="mt-2 text-sm text-[#1B2E5E]">Glissez-déposez un PDF/JPG/PNG ou sélectionnez un fichier</p>
                  <p className="text-xs text-[#64748B]">Taille maximale: 10 Mo</p>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-3"
                    onChange={(event) => handleFile(event.target.files?.[0] || null)}
                  />
                </div>

                {ocrFile && (
                  <p className="text-sm text-[#1B2E5E]">
                    Fichier: <span className="font-semibold">{ocrFile.name}</span> ({(ocrFile.size / 1024 / 1024).toFixed(2)} Mo)
                  </p>
                )}

                <Button onClick={handleLaunchOcr} className="bg-[#1B2E5E] text-white hover:bg-[#1B2E5E]/90" disabled={isAnalyzing || !ocrFile}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyse OCR en cours...
                    </>
                  ) : (
                    <>
                      <FileUp className="mr-2 h-4 w-4" />
                      Lancer l'analyse OCR
                    </>
                  )}
                </Button>
              </div>
            )}

            {ocrStep === 2 && (
              <div className="space-y-3 rounded-lg border border-[#DDE3EF] bg-[#F8FBFF] p-4">
                <p className="text-sm font-semibold text-[#1B2E5E]">Extraction terminée — pré-remplissage simulé</p>
                <ul className="text-sm text-[#64748B] space-y-1">
                  <li>N° facture: {formData.numero}</li>
                  <li>{invoiceType === 'RECUE' ? 'Fournisseur' : 'Client'}: {formData.tiersNom}</li>
                  <li>Date: {formData.dateEmission ? new Date(formData.dateEmission).toLocaleDateString('fr-FR') : '-'}</li>
                  <li>Total TTC: {formatAmount(formData.montantTTC || 0)}</li>
                </ul>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setOcrStep(3)} className="bg-[#1B2E5E] text-white hover:bg-[#1B2E5E]/90" disabled={!isOcrExtractionDone}>
                    Passer à la validation
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setOcrStep(1)}>
                    Changer de fichier
                  </Button>
                </div>
              </div>
            )}

            {ocrStep === 3 && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-[#64748B]">
                  Étape 3: vérifiez et modifiez les champs pré-remplis (fond bleu clair), puis sauvegardez la facture.
                </p>
                <Button type="button" variant="outline" onClick={() => setOcrStep(1)}>
                  Refaire l’import OCR
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="border-[#DDE3EF] bg-white shadow-sm">
          <CardContent className="space-y-6 p-6">
            {isOcrMode && !canEditInvoice && (
              <div className="rounded-md border border-[#DDE3EF] bg-[#F8FBFF] px-3 py-2 text-sm text-[#1B2E5E]">
                La modification est disponible à l’étape 3 (validation OCR).
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Numéro de facture *</Label>
                <Input
                  value={formData.numero || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, numero: e.target.value }))}
                  className={cn(ocrFields.has('numero') && 'bg-sky-50 border-sky-200')}
                  disabled={!canEditInvoice}
                />
              </div>

              <div className="space-y-2">
                <Label>{invoiceType === 'RECUE' ? 'Fournisseur' : 'Client'} *</Label>
                <Select value={formData.tiersId} onValueChange={handleTiersChange} disabled={!canEditInvoice}>
                  <SelectTrigger className={cn(ocrFields.has('tiersId') && 'bg-sky-50 border-sky-200')}>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiers.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.raisonSociale}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date de facturation *</Label>
                <Input
                  type="date"
                  value={formData.dateEmission ? new Date(formData.dateEmission).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const nextEmission = new Date(e.target.value)
                    setFormData((prev) => ({
                      ...prev,
                      dateEmission: nextEmission,
                      dateEcheance: prev.tiersId ? computeEcheanceDate(prev.tiersId, nextEmission) : nextEmission,
                    }))
                  }}
                  className={cn(ocrFields.has('dateEmission') && 'bg-sky-50 border-sky-200')}
                  disabled={!canEditInvoice}
                />
              </div>

              <div className="space-y-2">
                <Label>Date d&apos;échéance</Label>
                <Input
                  type="date"
                  value={formData.dateEcheance ? new Date(formData.dateEcheance).toISOString().split('T')[0] : ''}
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  disabled={!canEditInvoice}
                />
              </div>
            </div>

            <Card className="border-[#DDE3EF]">
              <CardHeader>
                <CardTitle className="text-base text-[#1B2E5E]">Lignes de facture</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F4F6FB]">
                      <TableHead>Description</TableHead>
                      <TableHead>Compte</TableHead>
                      <TableHead className="text-right">Qté</TableHead>
                      <TableHead className="text-right">PU HT</TableHead>
                      <TableHead className="text-right">TVA %</TableHead>
                      <TableHead className="text-right">HT</TableHead>
                      <TableHead className="text-right">TVA</TableHead>
                      <TableHead className="text-right">TTC</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(formData.lignes || []).map((line, index) => (
                      <TableRow key={line.id} className={cn(ocrFields.has('lignes') && 'bg-sky-50')}>
                        <TableCell>{line.description}</TableCell>
                        <TableCell className="text-sm text-[#64748B]">{line.compte} — {line.compteLabel}</TableCell>
                        <TableCell className="text-right">{line.quantite}</TableCell>
                        <TableCell className="text-right font-mono">{formatAmount(line.prixUnitaireHT)}</TableCell>
                        <TableCell className="text-right">{line.tauxTva}%</TableCell>
                        <TableCell className="text-right font-mono">{formatAmount(line.montantHT)}</TableCell>
                        <TableCell className="text-right font-mono">{formatAmount(line.montantTva)}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{formatAmount(line.montantTTC)}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLine(index)} disabled={!canEditInvoice}>
                            <Trash2 className="h-4 w-4 text-[#DC2626]" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableRow className="bg-[#F8FAFC]">
                      <TableCell>
                        <Input
                          placeholder="Description"
                          value={newLine.description || ''}
                          onChange={(e) => setNewLine((prev) => ({ ...prev, description: e.target.value }))}
                          disabled={!canEditInvoice}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={newLine.compte || 'none'}
                          onValueChange={(value) => {
                            const selected = comptes.find((compte) => compte.code === value)
                            setNewLine((prev) => ({ ...prev, compte: value, compteLabel: selected?.label || '' }))
                          }}
                          disabled={!canEditInvoice}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Compte" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" disabled>Sélectionner</SelectItem>
                            {comptes.map((compte) => (
                              <SelectItem key={compte.code} value={compte.code}>{compte.code} — {compte.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          value={newLine.quantite || 1}
                          onChange={(e) => setNewLine((prev) => ({ ...prev, quantite: Number(e.target.value) || 1 }))}
                          className="text-right"
                          disabled={!canEditInvoice}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={newLine.prixUnitaireHT || 0}
                          onChange={(e) => setNewLine((prev) => ({ ...prev, prixUnitaireHT: Number(e.target.value) || 0 }))}
                          className="text-right"
                          disabled={!canEditInvoice}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={(newLine.tauxTva || 20).toString()}
                          onValueChange={(value) => setNewLine((prev) => ({ ...prev, tauxTva: Number(value) }))}
                          disabled={!canEditInvoice}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tvaRates.map((rate) => (
                              <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatAmount(lineTotals(newLine).montantHT)}</TableCell>
                      <TableCell className="text-right font-mono">{formatAmount(lineTotals(newLine).montantTva)}</TableCell>
                      <TableCell className="text-right font-mono">{formatAmount(lineTotals(newLine).montantTTC)}</TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={handleAddLine} disabled={!canEditInvoice}>
                          <Plus className="h-4 w-4 text-[#3B6FD4]" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="ml-auto w-96 rounded-lg border border-[#DDE3EF] bg-[#F8FAFC] p-4">
              <div className="flex items-center justify-between text-sm"><span>Total HT</span><span className="font-mono">{formatAmount(formData.montantHT || 0)}</span></div>
              <div className="flex items-center justify-between text-sm mt-1"><span>Total TVA</span><span className="font-mono">{formatAmount(formData.montantTva || 0)}</span></div>
              <div className="flex items-center justify-between text-sm mt-2 border-t border-[#DDE3EF] pt-2"><span className="font-semibold">Total TTC</span><span className="font-mono font-semibold">{formatAmount(formData.montantTTC || 0)}</span></div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#DDE3EF] pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
              <Button type="submit" className="bg-[#1B2E5E] text-white hover:bg-[#1B2E5E]/90" disabled={!canSaveInvoice}>
                {isOcrMode ? 'Sauvegarder la facture' : 'Enregistrer'}
              </Button>
            </div>
            {isOcrMode && !canSaveInvoice && (
              <p className="text-xs text-[#64748B] text-right">{getSaveLockReason()}</p>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
