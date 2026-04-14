import type { Invoice, MouvementBancaire } from '@/src/shared/types'

export type Suggestion = {
  facture: Invoice
  score: number
  scoreDetail: {
    montant: number
    date: number
    reference: number
    contrepartie: number
  }
}

export type SuggestionInsight = {
  confidence: 'Élevée' | 'Moyenne' | 'Faible'
  recommendation: string
  strengths: string[]
  weaknesses: string[]
}

const MAX_MONTANT = 40
const MAX_DATE = 25
const MAX_REFERENCE = 25
const MAX_CONTREPARTIE = 10
const DAY_IN_MS = 24 * 60 * 60 * 1000

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function roundInt(value: number): number {
  return Math.round(value)
}

function normalize(input: string | undefined): string {
  if (!input) return ''
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
}

function extractTokens(input: string, minLength = 3): Set<string> {
  const tokens = new Set<string>()
  if (!input) return tokens

  input.split(' ').forEach((token) => {
    if (token.length >= minLength) {
      tokens.add(token)
    }
  })

  return tokens
}

function overlapRatio(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0

  let commonCount = 0
  a.forEach((token) => {
    if (b.has(token)) {
      commonCount += 1
    }
  })

  return commonCount / Math.max(a.size, b.size)
}

function calculateMontantScore(facture: Invoice, mouvement: MouvementBancaire): number {
  const factureMontant = Math.abs(facture.montantTTC)
  const mouvementMontant = Math.abs(mouvement.montant)

  if (factureMontant === 0 && mouvementMontant === 0) return MAX_MONTANT
  if (factureMontant === 0 || mouvementMontant === 0) return 0

  const relativeDifference =
    Math.abs(factureMontant - mouvementMontant) / Math.max(factureMontant, mouvementMontant)

  const linearScore = (1 - relativeDifference) * MAX_MONTANT
  return roundInt(clamp(linearScore, 0, MAX_MONTANT))
}

function calculateDateScore(facture: Invoice, mouvement: MouvementBancaire): number {
  const factureDate = new Date(facture.dateEmission).getTime()
  const mouvementDate = new Date(mouvement.dateValeur).getTime()

  if (!Number.isFinite(factureDate) || !Number.isFinite(mouvementDate)) return 0

  const differenceInDays = Math.abs(factureDate - mouvementDate) / DAY_IN_MS

  if (differenceInDays <= 1) return MAX_DATE
  if (differenceInDays <= 3) return 20
  if (differenceInDays <= 7) return 15
  if (differenceInDays <= 15) return 8
  if (differenceInDays <= 30) return 3

  return 0
}

function calculateReferenceScore(facture: Invoice, mouvement: MouvementBancaire): number {
  const factureNumero = normalize(facture.numero)
  const referenceBlob = normalize(`${mouvement.reference} ${mouvement.libelle}`)

  if (!factureNumero || !referenceBlob) return 0

  if (referenceBlob.includes(factureNumero)) {
    return MAX_REFERENCE
  }

  const factureTokens = extractTokens(factureNumero, 4)
  const referenceTokens = extractTokens(referenceBlob, 4)
  const ratio = overlapRatio(factureTokens, referenceTokens)

  return roundInt(clamp(ratio * MAX_REFERENCE, 0, MAX_REFERENCE))
}

function calculateContrepartieScore(facture: Invoice, mouvement: MouvementBancaire): number {
  const tiersNormalized = normalize(facture.tiersNom)
  const mouvementBlob = normalize(`${mouvement.libelle} ${mouvement.reference}`)

  if (!tiersNormalized || !mouvementBlob) return 0

  if (mouvementBlob.includes(tiersNormalized)) {
    return MAX_CONTREPARTIE
  }

  const tiersTokens = extractTokens(tiersNormalized, 4)
  const mouvementTokens = extractTokens(mouvementBlob, 4)
  const ratio = overlapRatio(tiersTokens, mouvementTokens)

  return roundInt(clamp(ratio * MAX_CONTREPARTIE, 0, MAX_CONTREPARTIE))
}

export function calculateScoreDetail(
  facture: Invoice,
  mouvement: MouvementBancaire
): Suggestion['scoreDetail'] {
  return {
    montant: calculateMontantScore(facture, mouvement),
    date: calculateDateScore(facture, mouvement),
    reference: calculateReferenceScore(facture, mouvement),
    contrepartie: calculateContrepartieScore(facture, mouvement),
  }
}

export function calculateScore(facture: Invoice, mouvement: MouvementBancaire): number {
  const detail = calculateScoreDetail(facture, mouvement)
  return detail.montant + detail.date + detail.reference + detail.contrepartie
}

export function getSuggestions(mouvement: MouvementBancaire, factures: Invoice[]): Suggestion[] {
  return factures
    .map((facture) => {
      const scoreDetail = calculateScoreDetail(facture, mouvement)
      const score = scoreDetail.montant + scoreDetail.date + scoreDetail.reference + scoreDetail.contrepartie

      return {
        facture,
        score,
        scoreDetail,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

export function getSuggestionInsight(suggestion: Suggestion): SuggestionInsight {
  const strengths: string[] = []
  const weaknesses: string[] = []

  if (suggestion.scoreDetail.montant >= 30) {
    strengths.push('Montant très proche')
  } else if (suggestion.scoreDetail.montant <= 15) {
    weaknesses.push('Écart montant significatif')
  }

  if (suggestion.scoreDetail.date >= 20) {
    strengths.push('Date cohérente')
  } else if (suggestion.scoreDetail.date <= 8) {
    weaknesses.push('Date éloignée')
  }

  if (suggestion.scoreDetail.reference >= 18) {
    strengths.push('Référence facture détectée')
  } else if (suggestion.scoreDetail.reference <= 8) {
    weaknesses.push('Référence faible ou absente')
  }

  if (suggestion.scoreDetail.contrepartie >= 7) {
    strengths.push('Contrepartie reconnue')
  } else if (suggestion.scoreDetail.contrepartie <= 3) {
    weaknesses.push('Contrepartie non reconnue')
  }

  if (suggestion.score >= 85) {
    return {
      confidence: 'Élevée',
      recommendation: 'Validation recommandée immédiatement',
      strengths,
      weaknesses,
    }
  }

  if (suggestion.score >= 60) {
    return {
      confidence: 'Moyenne',
      recommendation: 'Revue rapide recommandée avant validation',
      strengths,
      weaknesses,
    }
  }

  return {
    confidence: 'Faible',
    recommendation: 'Justification manuelle recommandée',
    strengths,
    weaknesses,
  }
}
