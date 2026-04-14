// User and Role Types
export type UserRole = 'TRESORIER' | 'ADMIN_CLIENT' | 'ADMIN_BANQUE'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
<<<<<<< HEAD
  avatar?: string
  lastLogin?: Date
=======
  password?: string // Optionnel - mot de passe non chiffré (mock data uniquement)
  avatar?: string
  lastLogin?: Date
  createdAt?: Date
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
  isActive: boolean
}

// Supplier/Client Types
export interface Fournisseur {
  id: string
  raisonSociale: string
  ice: string
  identifiantFiscal: string
  rc: string
  adresse: string
  ville: string
  pays: string
  rib: string
<<<<<<< HEAD
  banqueDomiciliataire?: string
=======
  banqueDomiciliataire: string
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
  emailFacturation?: string
  telephone?: string
  delaiPaiement: number
  modePaiement: 'Virement' | 'Chèque' | 'Espèces' | 'Prélèvement'
  tauxTvaDefaut: number
  statut: 'Actif' | 'Inactif'
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  raisonSociale: string
  ice: string
  identifiantFiscal: string
<<<<<<< HEAD
  rc?: string
=======
  rc: string
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
  adresse: string
  ville: string
  pays: string
  rib: string
<<<<<<< HEAD
  banqueDomiciliataire?: string
=======
  banqueDomiciliataire: string
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
  emailFacturation?: string
  telephone?: string
  delaiPaiement: number
  modePaiement: 'Virement' | 'Chèque' | 'Espèces' | 'Prélèvement'
  tauxTvaDefaut: number
<<<<<<< HEAD
  segment?: 'TPE' | 'PME' | 'GE' | 'Public'
=======
  segment?: 'PME' | 'ETI' | 'GE' | 'Administration'
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
  statut: 'Actif' | 'Inactif'
  createdAt: Date
  updatedAt: Date
}

export interface EnterpriseClient {
  id: string
  companyName: string
  ice: string
  sector: string
  contactName: string
  contactEmail: string
  contactPhone: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'inactive' | 'trial'
  createdAt: string
  monthlyFee: number
  usersCount: number
}

// Invoice Types
export type InvoiceType = 'RECUE' | 'EMISE'
export type InvoiceSource = 'MANUELLE' | 'ERP' | 'OCR'
<<<<<<< HEAD
export type InvoiceStatus = 'EN_ATTENTE' | 'RAPPROCHE' | 'ECART_DETECTE' | 'NON_RAPPROCHE' | 'JUSTIFIE'
=======
export type InvoiceStatus =
  | 'EN_ATTENTE'
  | 'RAPPROCHE'
  | 'ECART_DETECTE'
  | 'NON_RAPPROCHE'
  | 'JUSTIFIE'
  | 'SUGGESTION_EN_ATTENTE'
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
export type PaymentStatus = 'Non payée' | 'Partielle' | 'Payée'

export interface InvoiceLine {
  id: string
  description: string
  compte: string // Accounting code
  compteLabel: string
  quantite: number
  prixUnitaireHT: number
  tauxTva: number
  montantHT: number
  montantTva: number
  montantTTC: number
}

export interface Invoice {
  id: string
  type: InvoiceType
  numero: string
  tiersId: string
  tiersNom: string
  tiersIce: string
  dateEmission: Date
  dateEcheance: Date
  source: InvoiceSource
  lignes: InvoiceLine[]
  montantHT: number
  montantTva: number
  montantTTC: number
  montantDu: number
  devise: 'MAD' | 'EUR' | 'USD' | 'GBP'
  statutPaiement: PaymentStatus
  modePaiementEffectif?: 'Virement' | 'Chèque' | 'Espèces'
  referencePaiement?: string
  description?: string
  pieceJointe?: string
  status: InvoiceStatus
  createdAt: Date
  updatedAt: Date
}

// Bank Movement Types
export interface MouvementBancaire {
  id: string
  reference: string
  dateValeur: Date
  montant: number
  libelle: string
  banque: string
  sens: 'CREDIT' | 'DEBIT'
}

// Reconciliation Types
export interface ReconciliationScore {
  montant: number
  date: number
  referenceFacture: number
  contrepartie: number
  total: number
}

<<<<<<< HEAD
=======
// RG-JUST-04: Historique des rejets avec motifs structurés
export interface RejectionDetail {
  id: string
  reason: 'MONTANT_DEDOUBLE' | 'DATE_INCOHERENT' | 'CONTREPARTIE_INEXACTE' | 'AUTRE'
  comment: string
  rejectedBy: string
  rejectionDate: Date
  invoiceReference: string
  submissionNumber: number
}

>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
export interface Reconciliation {
  id: string
  invoice: Invoice
  mouvement?: MouvementBancaire
  erpEntry?: {
    reference: string
    montant: number
    date: Date
  }
  score: ReconciliationScore
<<<<<<< HEAD
  status: 'RAPPROCHEE' | 'ECART_DETECTE' | 'NON_RAPPROCHEE'
=======
  status: 'RAPPROCHEE' | 'ECART_DETECTE' | 'NON_RAPPROCHEE' | 'SUGGESTION_EN_ATTENTE'
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
  justification?: string
  justificationDate?: Date
  validatedBy?: string
  validationDate?: Date
  rejectionComment?: string
<<<<<<< HEAD
=======
  rejectionDetail?: RejectionDetail
  // RG-RAPP-02: Lier une facture à UN SEUL mouvement bancaire (relation 1:1)
  mouvementBancaireId?: string
}

export type JustificationReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ValidationQueueItem {
  id: string
  invoiceId: string
  reconciliationId: string
  justification: string
  status: JustificationReviewStatus
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  rejectionComment?: string
  submissionCount: number
}

export interface JustificationHistoryEntry {
  id: string
  queueItemId: string
  invoiceId: string
  reconciliationId: string
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED'
  comment?: string
  actor: string
  createdAt: Date
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
}

// Report Types
export interface CPCEntry {
  tiers: string
  categorie: string
  compte: string
  montantHT: number
  tva: number
  montantTTC: number
}

export interface TVAEntry {
  taux: number
  baseHT: number
  montantTva: number
  nbFactures: number
}

// Chart of Accounts
export interface CompteComptable {
  code: string
  label: string
  type: 'CHARGE' | 'PRODUIT'
}

// Admin Configuration
export interface ReconciliationConfig {
  scoreMinAuto: number
  scoreMinSuggestion: number
  toleranceMontant: number
  toleranceDate: number
}

// Notification
export interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  read: boolean
  createdAt: Date
}
