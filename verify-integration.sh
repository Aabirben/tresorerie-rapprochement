#!/bin/bash
# Script de Vérification Post-Intégration
# Usage: bash verify-integration.sh

echo "🔍 Vérification Intégration Rapprochement Bancaire"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
PASS=0
FAIL=0
WARN=0

# Fonction test
test_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1 (NOT FOUND)"
        ((FAIL++))
    fi
}

test_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/ (directory)"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1/ (NOT FOUND)"
        ((FAIL++))
    fi
}

echo "📁 Vérification des Répertoires"
echo "-------------------------------"
test_dir "app/rapprochement"
test_dir "app/rapprochement/historique"
test_dir "components/rapprochement"
test_dir "hooks"
test_dir "lib"
test_dir "docs"
echo ""

echo "📄 Vérification des Fichiers Routes"
echo "-----------------------------------"
test_file "app/rapprochement/page.tsx"
test_file "app/rapprochement/historique/page.tsx"
test_file "app/rapprochement/layout.tsx"
echo ""

echo "🛠️ Vérification des Fichiers Support"
echo "------------------------------------"
test_file "lib/rapprochement-types.ts"
test_file "lib/matching-engine.ts"
test_file "lib/rapprochement-mock-data.ts"
test_file "lib/rapprochement-context.tsx"
test_file "lib/rapprochement-format.ts"
test_file "lib/rapprochement-export.ts"
test_file "lib/rapprochement-auth.ts"
echo ""

echo "🎨 Vérification des Composants"
echo "------------------------------"
test_file "components/rapprochement/suggestion-card.tsx"
test_file "components/rapprochement/stats-card.tsx"
test_file "components/rapprochement/quick-summary.tsx"
test_file "components/rapprochement/access-denied.tsx"
echo ""

echo "🎣 Vérification des Hooks"
echo "------------------------"
test_file "hooks/use-proactive-matching.ts"
echo ""

echo "📚 Vérification de la Documentation"
echo "-----------------------------------"
test_file "docs/ROLE_COVERAGE_AUDIT.md"
test_file "docs/STEP7_ROUTING_GUIDE.md"
test_file "docs/STEP8_CLEANUP.md"
test_file "INTEGRATION_SUMMARY.md"
test_file "MANIFEST.md"
echo ""

echo "🔐 Vérification des Imports (Scan)"
echo "----------------------------------"

# Check for common import errors
if grep -r "import.*from.*rapprochement-types" lib/ components/ hooks/ app/rapprochement/ 2>/dev/null | wc -l > /dev/null; then
    echo -e "${GREEN}✓${NC} rapprochement-types imports found"
    ((PASS++))
fi

if grep -r "import.*from.*matching-engine" lib/ components/ hooks/ app/rapprochement/ 2>/dev/null | wc -l > /dev/null; then
    echo -e "${GREEN}✓${NC} matching-engine imports found"
    ((PASS++))
fi

if grep -r "import.*from.*rapprochement-mock-data" lib/ components/ hooks/ app/rapprochement/ 2>/dev/null | wc -l > /dev/null; then
    echo -e "${GREEN}✓${NC} rapprochement-mock-data imports found"
    ((PASS++))
fi

echo ""

echo "📊 Résumé"
echo "========="
echo -e "Passé:    ${GREEN}$PASS${NC}"
echo -e "Échoué:   ${RED}$FAIL${NC}"
echo -e "Warnings: ${YELLOW}$WARN${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ TOUS LES FICHIERS PRÉSENTS${NC}"
    echo ""
    echo "📝 Prochaines étapes:"
    echo "   1. npm install"
    echo "   2. npm run build"
    echo "   3. npm run dev"
    echo "   4. Ouvrir http://localhost:3000/rapprochement"
    exit 0
else
    echo -e "${RED}✗ FICHIERS MANQUANTS DÉTECTÉS${NC}"
    echo ""
    echo "Vérifiez que tous les fichiers ont été créés correctement."
    exit 1
fi
