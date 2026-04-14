// Format utilities for Treasury + Rapprochement modules

export const formatAmount = (amount: number, currency: string = 'MAD'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export const formatDateShort = (date: Date | string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

export const formatDateTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

// Score utilities
export const getScoreColor = (score: number): string => {
  if (score >= 85) return '#16A34A' // Green
  if (score >= 60) return '#D97706' // Orange
  return '#DC2626' // Red
}

export const getScoreBgClass = (score: number): string => {
  if (score >= 85) return 'bg-green-600'
  if (score >= 60) return 'bg-amber-600'
  return 'bg-red-600'
}

export const getScoreTextClass = (score: number): string => {
  if (score >= 85) return 'text-green-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

// Status utilities
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    RAPPROCHEE: '#16A34A',
    RAPPROCHE: '#16A34A',
    SUGGESTION_EN_ATTENTE: '#3B82F6',
    ECART_DETECTE: '#D97706',
    NON_RAPPROCHE: '#DC2626',
    NON_RAPPROCHEE: '#DC2626',
    JUSTIFIE: '#8B5CF6',
    EN_ATTENTE: '#6B7280',
    PENDING: '#3B82F6',
    APPROVED: '#16A34A',
    REJECTED: '#DC2626',
  }
  return colors[status] || '#64748B'
}

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    RAPPROCHEE: 'Rapprochée',
    RAPPROCHE: 'Rapproché',
    SUGGESTION_EN_ATTENTE: 'Suggestion en attente',
    ECART_DETECTE: 'Écart détecté',
    NON_RAPPROCHE: 'Non rapproché',
    NON_RAPPROCHEE: 'Non rapprochée',
    JUSTIFIE: 'Justifié',
    EN_ATTENTE: 'En attente',
    PENDING: 'En attente',
    APPROVED: 'Approuvé',
    REJECTED: 'Rejeté',
  }
  return labels[status] || status
}

export const getStatusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    RAPPROCHEE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    RAPPROCHE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    SUGGESTION_EN_ATTENTE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    ECART_DETECTE: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    NON_RAPPROCHE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    NON_RAPPROCHEE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    JUSTIFIE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    EN_ATTENTE: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    PENDING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Alert severity utilities
export const getAlertSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    low: '#3B82F6',
    medium: '#D97706',
    high: '#DC2626',
    critical: '#7C2D12',
  }
  return colors[severity] || '#64748B'
}

export const getAlertSeverityBadgeClass = (severity: string): string => {
  const classes: Record<string, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-red-200 text-red-900 font-bold',
  }
  return classes[severity] || 'bg-gray-100 text-gray-800'
}

// Source badge color
export const getSourceColor = (source: string): string => {
  const colors: Record<string, string> = {
    ERP: 'bg-violet-50 text-violet-700 border border-violet-200',
    OCR: 'bg-blue-50 text-blue-700 border border-blue-200',
    MANUELLE: 'bg-gray-100 text-gray-600 border border-gray-200',
  }
  return colors[source] || 'bg-gray-100 text-gray-600 border border-gray-200'
}

// Format ICE (Moroccan company identifier)
export const formatICE = (ice: string): string => {
  return ice.replace(/(\d{3})(\d{6})(\d{6})/, '$1 $2 $3')
}

// Format RIB (Moroccan bank account number)
export const formatRIB = (rib: string): string => {
  return rib.replace(/(.{4})/g, '$1 ').trim()
}
