import { useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { toast } from 'sonner'
import { getSuggestions } from '@/lib/matching-engine'
import type { Invoice, MouvementBancaire, Reconciliation } from '@/lib/rapprochement-types'

interface UseProactiveMatchingParams {
  factures: Invoice[]
  mouvements: MouvementBancaire[]
  reconciliations: Reconciliation[]
  setReconciliations: Dispatch<SetStateAction<Reconciliation[]>>
}

export function useProactiveMatching({
  factures,
  mouvements,
  reconciliations,
  setReconciliations,
}: UseProactiveMatchingParams) {
  useEffect(() => {
    if (factures.length === 0 || mouvements.length === 0 || reconciliations.length === 0) {
      return
    }

    const autoMatched: string[] = []

    const updatedReconciliations: Reconciliation[] = reconciliations.map((reco): Reconciliation => {
      if (!reco.mouvement) {
        return reco
      }

      if ((reco.status as any) === 'RAPPROCHEE') {
        return reco
      }

      const expectedType = reco.mouvement.sens === 'DEBIT' ? 'RECUE' : 'EMISE'
      const candidateFactures = factures.filter((facture) => facture.type === expectedType)
      const bestSuggestion = getSuggestions(reco.mouvement, candidateFactures as any)[0]

      if (!bestSuggestion) {
        if ((reco.status as any) !== 'NON_RAPPROCHEE') {
          return { ...reco, status: 'NON_RAPPROCHEE' as any }
        }
        return reco
      }

      if (bestSuggestion.score >= 85) {
        autoMatched.push(bestSuggestion.facture.numero)
        return {
          ...reco,
          invoice: {
            ...bestSuggestion.facture,
            status: 'RAPPROCHE',
            updatedAt: new Date(),
          },
          score: {
            montant: bestSuggestion.scoreDetail.montant,
            date: bestSuggestion.scoreDetail.date,
            referenceFacture: bestSuggestion.scoreDetail.reference,
            contrepartie: bestSuggestion.scoreDetail.contrepartie,
            total: bestSuggestion.score,
          },
          status: 'RAPPROCHEE',
          validationDate: new Date(),
        }
      }

      if (bestSuggestion.score >= 60 && bestSuggestion.score <= 84) {
        return {
          ...reco,
          score: {
            montant: bestSuggestion.scoreDetail.montant,
            date: bestSuggestion.scoreDetail.date,
            referenceFacture: bestSuggestion.scoreDetail.reference,
            contrepartie: bestSuggestion.scoreDetail.contrepartie,
            total: bestSuggestion.score,
          },
          status: 'SUGGESTION_EN_ATTENTE',
        }
      }

      if (reco.status !== 'NON_RAPPROCHEE') {
        return {
          ...reco,
          status: 'NON_RAPPROCHEE',
        }
      }

      return reco
    })

    const hasChanges = updatedReconciliations.some(
      (reco, index) =>
        (reco.status as any) !== (reconciliations[index].status as any) ||
        reco.score.total !== reconciliations[index].score.total ||
        reco.invoice.id !== reconciliations[index].invoice.id
    )

    if (!hasChanges) {
      return
    }

    setReconciliations(updatedReconciliations)

    autoMatched.forEach((numeroFacture) => {
      toast.success(`Rapprochement automatique effectué pour ${numeroFacture}`)
    })
  }, [factures, mouvements, reconciliations, setReconciliations])
}
