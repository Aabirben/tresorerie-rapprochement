// Fonction helper pour récupérer l'utilisateur courant
// À adapter selon votre architecture auth (AuthContext, localStorage, session, etc.)

export function getCurrentUserFromMock() {
  // En développement, simule la récupération de l'utilisateur
  // En production, adapter pour utiliser votre système d'auth réel
  
  if (typeof window === 'undefined') {
    // Side serveur: pas d'accès aux données utilisateur
    return null
  }

  // Chercher dans localStorage (si l'app le stocke)
  try {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    // localStorage non disponible
  }

  // Pour les tests: retourner l'utilisateur par défaut
  // IMPORTANT: À remplacer par votre système d'auth réel
  return {
    id: 'u1',
    nom: 'Karim Benchekroun',
    email: 'karim@techcorp.ma',
    role: 'TRESORIER',
    entreprise_id: 'e1',
  }
}

export const ALLOWED_RAPPROCHEMENT_ROLES = [
  'TRESORIER',
  'ADMIN_CLIENT',
  'BACKOFFICE_BANQUE',
  'ADMIN_BANQUE',
]

export function checkRapprochementAccess(userRole?: string): boolean {
  if (!userRole) return false
  return ALLOWED_RAPPROCHEMENT_ROLES.includes(userRole)
}
