'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import type {
  JustificationHistoryEntry,
  Notification,
  ValidationQueueItem,
} from './types'
import { notifications as initialNotifications } from './mock-data'
import type { Invoice } from './types'
import { invoices as initialInvoices } from './mock-data'

const createId = () => `wf-${Math.random().toString(36).slice(2, 10)}`

const buildInitialValidationQueue = (invoices: Invoice[]): ValidationQueueItem[] => {
  const now = new Date()

  return invoices
    .filter((invoice) => invoice.status === 'JUSTIFIE')
    .map((invoice) => ({
      id: createId(),
      invoiceId: invoice.id,
      reconciliationId: `seed-${invoice.id}`,
      justification: invoice.description ?? 'Justification initiale importée.',
      status: 'PENDING',
      submittedAt: now,
      submissionCount: 1,
    }))
}

interface AppContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  invoices: Invoice[]
  setInvoices: Dispatch<SetStateAction<Invoice[]>>
  validationQueue: ValidationQueueItem[]
  justificationHistory: JustificationHistoryEntry[]
  submitJustification: (params: {
    invoiceId: string
    reconciliationId: string
    justification: string
  }) => { isResubmission: boolean }
  approveJustification: (queueItemId: string, actor: string) => void
  rejectJustification: (queueItemId: string, actor: string, comment: string) => void
  // RG-RAPP-03: Action pour annuler un rapprochement et remettre facture en NON_RAPPROCHÉ
  cancelReconciliation: (invoiceId: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [validationQueue, setValidationQueue] = useState<ValidationQueueItem[]>(
    buildInitialValidationQueue(initialInvoices)
  )
  const [justificationHistory, setJustificationHistory] = useState<JustificationHistoryEntry[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Initialize from localStorage on client side
  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved))
    }
  }, [])

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ))
  }

  // Persist to localStorage when sidebar state changes
  const handleSetSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed))
    }
  }

  const submitJustification = ({
    invoiceId,
    reconciliationId,
    justification,
  }: {
    invoiceId: string
    reconciliationId: string
    justification: string
  }): { isResubmission: boolean } => {
    const submittedAt = new Date()
    const sanitizedJustification = justification.trim()
    const existing = validationQueue.find((item) => item.invoiceId === invoiceId)
    const isResubmission = existing?.status === 'REJECTED'

    setInvoices((previous) =>
      previous.map((invoice) =>
        invoice.id === invoiceId
          ? {
              ...invoice,
              status: 'JUSTIFIE',
              description: sanitizedJustification,
              updatedAt: submittedAt,
            }
          : invoice
      )
    )

    setValidationQueue((previous) => {
      if (!existing) {
        return [
          {
            id: createId(),
            invoiceId,
            reconciliationId,
            justification: sanitizedJustification,
            status: 'PENDING',
            submittedAt,
            submissionCount: 1,
          },
          ...previous,
        ]
      }

      return previous.map((item) =>
        item.invoiceId === invoiceId
          ? {
              ...item,
              reconciliationId,
              justification: sanitizedJustification,
              status: 'PENDING',
              submittedAt,
              reviewedAt: undefined,
              reviewedBy: undefined,
              rejectionComment: undefined,
              submissionCount: isResubmission ? item.submissionCount + 1 : item.submissionCount,
            }
          : item
      )
    })

    setJustificationHistory((previous) => {
      const queueItemId = existing?.id ?? createId()

      return [
        {
          id: createId(),
          queueItemId,
          invoiceId,
          reconciliationId,
          action: isResubmission ? 'RESUBMITTED' : 'SUBMITTED',
          comment: sanitizedJustification,
          actor: 'Trésorier',
          createdAt: submittedAt,
        },
        ...previous,
      ]
    })

    return { isResubmission }
  }

  const approveJustification = (queueItemId: string, actor: string) => {
    const reviewedAt = new Date()
    const target = validationQueue.find((item) => item.id === queueItemId)
    if (!target) {
      return
    }

    setValidationQueue((previous) =>
      previous.map((item) =>
        item.id === queueItemId
          ? {
              ...item,
              status: 'APPROVED',
              reviewedAt,
              reviewedBy: actor,
              rejectionComment: undefined,
            }
          : item
      )
    )

    setInvoices((previous) =>
      previous.map((invoice) =>
        invoice.id === target.invoiceId
          ? {
              ...invoice,
              status: 'JUSTIFIE',
              updatedAt: reviewedAt,
            }
          : invoice
      )
    )

    setJustificationHistory((previous) => [
      {
        id: createId(),
        queueItemId,
        invoiceId: target.invoiceId,
        reconciliationId: target.reconciliationId,
        action: 'APPROVED',
        actor,
        createdAt: reviewedAt,
      },
      ...previous,
    ])
  }

  const rejectJustification = (queueItemId: string, actor: string, comment: string) => {
    const reviewedAt = new Date()
    const target = validationQueue.find((item) => item.id === queueItemId)
    if (!target) {
      return
    }

    setValidationQueue((previous) =>
      previous.map((item) =>
        item.id === queueItemId
          ? {
              ...item,
              status: 'REJECTED',
              reviewedAt,
              reviewedBy: actor,
              rejectionComment: comment.trim(),
            }
          : item
      )
    )

    setInvoices((previous) =>
      previous.map((invoice) =>
        invoice.id === target.invoiceId
          ? {
              ...invoice,
              status: 'ECART_DETECTE',
              updatedAt: reviewedAt,
            }
          : invoice
      )
    )

    setJustificationHistory((previous) => [
      {
        id: createId(),
        queueItemId,
        invoiceId: target.invoiceId,
        reconciliationId: target.reconciliationId,
        action: 'REJECTED',
        comment: comment.trim(),
        actor,
        createdAt: reviewedAt,
      },
      ...previous,
    ])
  }

  // RG-RAPP-03: Annuler un rapprochement (dissocier facture + mouvement, remettre en NON_RAPPROCHÉ)
  const cancelReconciliation = (invoiceId: string) => {
    setInvoices((previous) =>
      previous.map((invoice) =>
        invoice.id === invoiceId
          ? {
              ...invoice,
              status: 'NON_RAPPROCHE',
              updatedAt: new Date(),
            }
          : invoice
      )
    )
  }

  return (
    <AppContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        sidebarCollapsed,
        setSidebarCollapsed: handleSetSidebarCollapsed,
        invoices,
        setInvoices,
        validationQueue,
        justificationHistory,
        submitJustification,
        approveJustification,
        rejectJustification,
        cancelReconciliation,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
