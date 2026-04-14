# Guide d'Intégration STEP 7 — Routing & Navigation

## 🎯 Objectif

Intégrer la nouvelle route `/app/rapprochement/` dans la navigation existante de tresorerie-finale, remplaçant graduellement le tab-based rapprochement de la page principale par une route Next.js dédiée.

---

## 📋 Plan d'Implémentation

### Phase 1: Modification de `app/page.tsx`

**Fichier**: `app/page.tsx` (ligne 3110+)

**Action**: Remplacer le contenu du case 'rapprochement' par un composant wrapper qui:
1. Vérifie l'accès utilisateur (rôles: TRESORIER, ADMIN_CLIENT, BACKOFFICE_BANQUE, ADMIN_BANQUE)
2. Redirige vers `/app/rapprochement/page.tsx` ou affiche un lien
3. Maintient la compatibilité backward avec l'ancienne UI en inline

**Code à ajouter** (Snippet):
```tsx
case 'rapprochement':
  // Option A: Redirect to new route (moderne)
  if (typeof window !== 'undefined') {
    const allowedRoles = ['TRESORIER', 'ADMIN_CLIENT', 'BACKOFFICE_BANQUE', 'ADMIN_BANQUE']
    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
      return <AccessDeniedComponent />
    }
    // Redirect
    window.location.href = '/rapprochement'
    return null
  }
  
  // Option B: Keep inline but with role guard
  // (voir CORRECTIONS_IMPLEMENTED.md pour détails)
```

---

### Phase 2: Sidebar Menu Integration

**Fichier**: `app/page.tsx` (section sidebar)

**Action**: Ajouter/mettre à jour le menu item:

```tsx
{
  icon: BalanceScale, // ou icône similaire
  label: 'Rapprochement Bancaire',
  page: 'rapprochement',
  roles: ['TRESORIER', 'ADMIN_CLIENT', 'BACKOFFICE_BANQUE', 'ADMIN_BANQUE'],
  visible: isModuleActive('rapprochement') && allowedRoles.includes(currentUser?.role || '')
}
```

---

### Phase 3: Role Guard Implementation

**Fichier**: `app/rapprochement/page.tsx`

**Action**: Ajouter guard de rôle au début du composant:

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function RapprochementPage() {
  const router = useRouter()
  
  // À adapter selon votre architecture auth
  const currentUser = useContext(AuthContext)?.user // ou autre source
  const allowedRoles = ['TRESORIER', 'ADMIN_CLIENT', 'BACKOFFICE_BANQUE', 'ADMIN_BANQUE']
  
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return <AccessDenied onRetry={() => router.push('/dashboard')} />
  }
  
  // ... reste du composant
}
```

---

### Phase 4: Link Integration

**Fichier**: Tous les composants rapprochement

**Action**: Remplacer les liens internes:
- ~~`/dashboard?tab=rapprochement`~~ → `/rapprochement`
- Mettre à jour les boutons "Retour" vers `/rapprochement` au lieu du dashboard tab

---

## 🔄 Migration Backward Compatibility

### Option A: Full Switch (Recommandée)
- ✅ Remplacer complètement le tab par la nouvelle route
- ✅ Supprimer l'ancien code inline (après tests)
- ❌ Casse les favoris/bookmarks des utilisateurs

### Option B: Dual-Track (Progressive)
- ✅ Garder l'ancien tab fonctionnel
- ✅ Ajouter lien "Accéder à la nouvelle version" dans tab
- ✅ Les utilisateurs migrent progressivement
- ❌ Double maintenance temporaire

**Recommandation**: Option B pour 2-3 semaines, puis Option A

---

## 📍 Checklist de Vérification

### Routes
- [ ] `/rapprochement` → page principale (active invoices)
- [ ] `/rapprochement/historique` → page historique (finalized)

### Role Guards
- [ ] TRESORIER a accès ✅
- [ ] ADMIN_CLIENT a accès ✅
- [ ] BACKOFFICE_BANQUE a accès ✅
- [ ] ADMIN_BANQUE a accès ✅
- [ ] Autres rôles refusés ✅

### Navigation
- [ ] Sidebar menu item visible par rôle ✅
- [ ] Liens internes `/rapprochement` valides ✅
- [ ] Bouton retour fonctionne ✅
- [ ] Tab initial 'rapprochement' redirige (si Option B) ✅

### Data Flow
- [ ] Mock data charge correctement ✅
- [ ] Composants trouvent les imports ✅
- [ ] Context provider fonctionne ✅
- [ ] Compilation sans erreurs ✅

---

## 🚀 Étapes de Déploiement

### Étape 1: Préparation
1. [ ] Backup de `app/page.tsx`
2. [ ] Vérifier tous les imports dans composants rapprochement
3. [ ] Tester compilation locale

### Étape 2: Implémentation
1. [ ] Ajouter guard de rôle dans `/app/rapprochement/page.tsx`
2. [ ] Ajouter guard de rôle dans `/app/rapprochement/historique/page.tsx`
3. [ ] Mettre à jour sidebar pour inclure rapprochement
4. [ ] Tester navigation via sidebar

### Étape 3: Vérification
1. [ ] Login avec chaque rôle
2. [ ] Vérifier accès/refus appropriés
3. [ ] Tester tous les filtres et actions
4. [ ] Tester export (si implémenté)

### Étape 4: Rollback (si nécessaire)
- Script de restauration: `git checkout app/page.tsx`

---

## ⚠️ Notes Importantes

### Architecture Auth
- Adapter `useContext(AuthContext)` selon votre implémentation
- Vérifier le chemin du fichier context auth
- Tester avec les utilisateurs mock du fichier `app/page.tsx`

### Performance
- Lazy load composants volumineux si nécessaire
- Mock data: 8 invoices + 7 mouvements = léger (OK)
- Pas de problème de performance prévu

### Sécurité
- ✅ Gardes implémentées côté client
- ⚠️ Ajouter vérification côté serveur avant PROD
- ✅ Mock data: pas d'info sensible

---

## 📞 Support

Voir CORRECTIONS_IMPLEMENTED.md pour résolution des problèmes courants.

**Status**: ✅ Guide complet - Prêt pour implémentation en STEP 8
