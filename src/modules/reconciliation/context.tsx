'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ValidationQueueItem, Notification, Reconciliation, Invoice, MouvementBancaire } from '@/src/shared/types'
import { reconciliations as initialReconciliations, invoices, mouvementsBancaires } from '@/lib/mock-data'

interface RapprochementContextType {
  // Data
  reconciliations: Reconciliation[]
  invoices: Invoice[]
  mouvementsBancaires: MouvementBancaire[]
  validationQueue: ValidationQueueItem[]
  notifications: Notification[]
  
  // Stats
  pendingCount: number
  ecartCount: number
  rapprocheeCount: number
  
  // Actions
  submitJustification: (params: {
    invoiceId: string
    reconciliationId: string
    justification: string
  }) => { isResubmission: boolean }
  approveJustification: (queueItemId: string, actor: string) => void
  rejectJustification: (queueItemId: string, actor: string, comment: string) => void
  updateReconciliationStatus: (id: string, status: Reconciliation['status']) => void
  markNotificationRead: (id: string) => void
}

const RapprochementContext = createContext<RapprochementContextType | undefined>(undefined)

export function RapprochementProvider({ children }: { children: ReactNode }) {
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>(initialReconciliations)
  const [validationQueue, setValidationQueue] = useState<ValidationQueueItem[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif1',
      type: 'info',
      title: 'Bienvenue',
      message: 'Bienvenue dans le module Rapprochement Bancaire',
      isRead: false,
      createdAt: new Date(),
    },
  ])

  // Computed stats
  const pendingCount = useMemo(() => 
    reconciliations.filter(r => r.status === 'SUGGESTION_EN_ATTENTE').length,
    [reconciliations]
  )
  
  const ecartCount = useMemo(() => 
    reconciliations.filter(r => r.status === 'ECART_DETECTE').length,
    [reconciliations]
  )
  
  const rapprocheeCount = useMemo(() => 
    reconciliations.filter(r => r.status === 'RAPPROCHEE').length,
    [reconciliations]
  )

  const submitJustification = ({
    invoiceId,
    reconciliationId,
    justification,
  }: {
    invoiceId: string
    reconciliationId: string
    justification: string
  }): { isResubmission: boolean } => {
    const existing = validationQueue.find((item) => item.invoiceId === invoiceId)
    const isResubmission = existing?.status === 'REJECTED'

    const newItem: ValidationQueueItem = {
      id: `queue-${Date.now()}`,
      invoiceId,
      reconciliationId,
      justification,
      status: 'PENDING',
      submittedAt: new Date(),
      submissionCount: existing ? existing.submissionCount + 1 : 1,
    }

    setValidationQueue((prev) => [
      ...prev.filter((item) => item.invoiceId !== invoiceId),
      newItem,
    ])

    // Add notification
    setNotifications((prev) => [
      ...prev,
      {
        id: `notif-${Date.now()}`,
        type: 'success',
        title: 'Justification soumise',
        message: `Justification pour facture ${invoiceId} soumise à validation`,
        isRead: false,
        createdAt: new Date(),
      },
    ])

    return { isResubmission }
  }

  const approveJustification = (queueItemId: string, actor: string) => {
    setValidationQueue((prev) =>
      prev.map((item) =>
        item.id === queueItemId
          ? {
              ...item,
              status: 'APPROVED',
              reviewedAt: new Date(),
              reviewedBy: actor,
            }
          : item
      )
    )
    
    // Update reconciliation status
    const queueItem = validationQueue.find(item => item.id === queueItemId)
    if (queueItem) {
      updateReconciliationStatus(queueItem.reconciliationId, 'RAPPROCHEE')
    }
  }

  const rejectJustification = (queueItemId: string, actor: string, comment: string) => {
    setValidationQueue((prev) =>
      prev.map((item) =>
        item.id === queueItemId
          ? {
              ...item,
              status: 'REJECTED',
              reviewedAt: new Date(),
              reviewedBy: actor,
              rejectionComment: comment,
            }
          : item
      )
    )
  }

  const updateReconciliationStatus = (id: string, status: Reconciliation['status']) => {
    setReconciliations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    )
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
    )
  }

  const value = useMemo(
    () => ({
      reconciliations,
      invoices,
      mouvementsBancaires,
      validationQueue,
      notifications,
      pendingCount,
      ecartCount,
      rapprocheeCount,
      submitJustification,
      approveJustification,
      rejectJustification,
      updateReconciliationStatus,
      markNotificationRead,
    }),
    [reconciliations, validationQueue, notifications, pendingCount, ecartCount, rapprocheeCount]
  )

  return (
    <RapprochementContext.Provider value={value}>{children}</RapprochementContext.Provider>
  )
}

export function useRapprochement() {
  const context = useContext(RapprochementContext)
  if (context === undefined) {
    throw new Error('useRapprochement must be used within RapprochementProvider')
  }
  return context
}
