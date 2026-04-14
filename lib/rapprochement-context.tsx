'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ValidationQueueItem, Notification } from '@/lib/rapprochement-types'

interface RapprochementContextType {
  validationQueue: ValidationQueueItem[]
  notifications: Notification[]
  submitJustification: (params: {
    invoiceId: string
    reconciliationId: string
    justification: string
  }) => { isResubmission: boolean }
  approveJustification: (queueItemId: string, actor: string) => void
  rejectJustification: (queueItemId: string, actor: string, comment: string) => void
}

const RapprochementContext = createContext<RapprochementContextType | undefined>(undefined)

export function RapprochementProvider({ children }: { children: ReactNode }) {
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

  const value = useMemo(
    () => ({
      validationQueue,
      notifications,
      submitJustification,
      approveJustification,
      rejectJustification,
    }),
    [validationQueue, notifications]
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
