import type { UserRole } from '@/src/shared/types'

export interface RouteConfig {
  path: string
  label: string
  icon?: string
  roles: UserRole[]
  children?: RouteConfig[]
}

// Access control matrix
export const ROLE_ACCESS: Record<string, UserRole[]> = {
  // Treasury routes
  '/treasury/dashboard': ['TRESORIER', 'ADMIN_CLIENT'],
  '/treasury/accounts': ['TRESORIER', 'ADMIN_CLIENT'],
  '/treasury/flows': ['TRESORIER', 'ADMIN_CLIENT'],
  '/treasury/forecasts': ['TRESORIER', 'ADMIN_CLIENT'],
  '/treasury/multi-currency': ['TRESORIER'],
  '/treasury/erp-interface': ['TRESORIER', 'ADMIN_CLIENT'],
  '/treasury/alerts': ['TRESORIER', 'ADMIN_CLIENT'],
  '/treasury/reporting': ['TRESORIER', 'ADMIN_CLIENT', 'BACKOFFICE_BANQUE'],

  // Reconciliation routes (full access for TRESORIER)
  '/treasury/reconciliation/dashboard': ['TRESORIER'],
  '/treasury/reconciliation/fournisseurs': ['TRESORIER'],
  '/treasury/reconciliation/clients': ['TRESORIER'],
  '/treasury/reconciliation/factures': ['TRESORIER'],
  '/treasury/reconciliation/matching': ['TRESORIER'],
  '/treasury/reconciliation/history': ['TRESORIER'],
  '/treasury/reconciliation/reports': ['TRESORIER'],

  // Admin routes (for ADMIN_CLIENT)
  '/treasury/admin/dashboard': ['ADMIN_CLIENT'],
  '/treasury/admin/validation': ['ADMIN_CLIENT'],
  '/treasury/admin/configuration': ['ADMIN_CLIENT'],
  '/treasury/admin/users': ['ADMIN_CLIENT'],
  '/treasury/admin/settings': ['ADMIN_CLIENT'],

  // Backoffice routes
  '/treasury/backoffice/dashboard': ['BACKOFFICE_BANQUE'],

  // Bank admin routes
  '/treasury/bank-admin/dashboard': ['ADMIN_BANQUE'],
  '/treasury/bank-admin/enterprises': ['ADMIN_BANQUE'],
  '/treasury/bank-admin/cbs-config': ['ADMIN_BANQUE'],
  '/treasury/bank-admin/reporting': ['ADMIN_BANQUE'],
}

// Post-login redirect by role
export const REDIRECT_BY_ROLE: Record<UserRole, string> = {
  TRESORIER: '/treasury/dashboard',
  ADMIN_CLIENT: '/treasury/admin/dashboard',
  BACKOFFICE_BANQUE: '/treasury/backoffice/dashboard',
  ADMIN_BANQUE: '/treasury/bank-admin/dashboard',
}

// Menu configurations
export const TRESORIER_MENU: RouteConfig[] = [
  { path: '/treasury/dashboard', label: 'Tableau de Bord', icon: 'LayoutDashboard', roles: ['TRESORIER'] },
  { path: '/treasury/accounts', label: 'Suivi des Comptes', icon: 'Wallet', roles: ['TRESORIER'] },
  { path: '/treasury/flows', label: 'Flux Déclarés', icon: 'ArrowLeftRight', roles: ['TRESORIER'] },
  { path: '/treasury/forecasts', label: 'Prévision Trésorerie', icon: 'TrendingUp', roles: ['TRESORIER'] },
  { 
    path: '/treasury/reconciliation', 
    label: 'Rapprochement', 
    icon: 'Link2', 
    roles: ['TRESORIER'],
    children: [
      { path: '/treasury/reconciliation/dashboard', label: 'Dashboard', roles: ['TRESORIER'] },
      { path: '/treasury/reconciliation/fournisseurs', label: 'Fournisseurs', roles: ['TRESORIER'] },
      { path: '/treasury/reconciliation/clients', label: 'Clients', roles: ['TRESORIER'] },
      { path: '/treasury/reconciliation/factures', label: 'Factures', roles: ['TRESORIER'] },
      { path: '/treasury/reconciliation/matching', label: 'Rapprochement', roles: ['TRESORIER'] },
      { path: '/treasury/reconciliation/history', label: 'Historique', roles: ['TRESORIER'] },
      { path: '/treasury/reconciliation/reports', label: 'Rapports', roles: ['TRESORIER'] },
    ]
  },
  { path: '/treasury/multi-currency', label: 'Multi-devises', icon: 'Coins', roles: ['TRESORIER'] },
  { path: '/treasury/erp-interface', label: 'Interface ERP/EBICS', icon: 'Database', roles: ['TRESORIER'] },
  { path: '/treasury/alerts', label: 'Alertes', icon: 'Bell', roles: ['TRESORIER'] },
  { path: '/treasury/reporting', label: 'Reporting', icon: 'BarChart3', roles: ['TRESORIER'] },
]

export const ADMIN_CLIENT_MENU: RouteConfig[] = [
  { path: '/treasury/admin/dashboard', label: 'Tableau de Bord', icon: 'LayoutDashboard', roles: ['ADMIN_CLIENT'] },
  { path: '/treasury/accounts', label: 'Suivi des Comptes', icon: 'Wallet', roles: ['ADMIN_CLIENT'] },
  { path: '/treasury/flows', label: 'Flux Déclarés', icon: 'ArrowLeftRight', roles: ['ADMIN_CLIENT'] },
  { 
    path: '/treasury/admin/reconciliation', 
    label: 'Rapprochement', 
    icon: 'Link2', 
    roles: ['ADMIN_CLIENT'],
    children: [
      { path: '/treasury/admin/validation', label: 'File de Validation', roles: ['ADMIN_CLIENT'] },
      { path: '/treasury/admin/configuration', label: 'Règles Rapprochement', roles: ['ADMIN_CLIENT'] },
      { path: '/treasury/admin/users', label: 'Gestion Utilisateurs', roles: ['ADMIN_CLIENT'] },
    ]
  },
  { path: '/treasury/erp-interface', label: 'Interface ERP/EBICS', icon: 'Database', roles: ['ADMIN_CLIENT'] },
  { path: '/treasury/alerts', label: 'Alertes', icon: 'Bell', roles: ['ADMIN_CLIENT'] },
  { path: '/treasury/reporting', label: 'Reporting', icon: 'BarChart3', roles: ['ADMIN_CLIENT'] },
  { path: '/treasury/admin/settings', label: 'Paramétrage', icon: 'Settings', roles: ['ADMIN_CLIENT'] },
]

export const ADMIN_BANQUE_MENU: RouteConfig[] = [
  { path: '/treasury/bank-admin/dashboard', label: 'Tableau de Bord', icon: 'LayoutDashboard', roles: ['ADMIN_BANQUE'] },
  { path: '/treasury/bank-admin/enterprises', label: 'Entreprises', icon: 'Building2', roles: ['ADMIN_BANQUE'] },
  { path: '/treasury/bank-admin/cbs-config', label: 'Paramétrage CBS', icon: 'Settings', roles: ['ADMIN_BANQUE'] },
  { path: '/treasury/bank-admin/reporting', label: 'Reporting', icon: 'BarChart3', roles: ['ADMIN_BANQUE'] },
]

export function canAccess(path: string, role: UserRole): boolean {
  // Check exact match first
  if (ROLE_ACCESS[path]) {
    return ROLE_ACCESS[path].includes(role)
  }
  
  // Check parent paths
  const pathParts = path.split('/')
  while (pathParts.length > 0) {
    const parentPath = pathParts.join('/')
    if (ROLE_ACCESS[parentPath]) {
      return ROLE_ACCESS[parentPath].includes(role)
    }
    pathParts.pop()
  }
  
  return false
}

export function getMenuForRole(role: UserRole): RouteConfig[] {
  switch (role) {
    case 'TRESORIER':
      return TRESORIER_MENU
    case 'ADMIN_CLIENT':
      return ADMIN_CLIENT_MENU
    case 'ADMIN_BANQUE':
      return ADMIN_BANQUE_MENU
    case 'BACKOFFICE_BANQUE':
      return [] // TODO: Add backoffice menu
    default:
      return []
  }
}
