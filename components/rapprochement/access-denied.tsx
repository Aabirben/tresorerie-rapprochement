'use client'

import { Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] p-6">
      <Card className="w-full max-w-md border-[#DDE3EF] bg-white">
        <CardContent className="flex flex-col items-center gap-6 p-12">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEE2E2]"
          >
            <Lock className="h-8 w-8 text-[#DC2626]" />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-[#1B2E5E]">Accès non autorisé</h1>
            <p className="text-sm text-[#64748B]">
              Vous n'avez pas les permissions nécessaires pour accéder à cette section.
            </p>
          </div>

          <div className="w-full space-y-3">
            <Link href="/dashboard" className="block">
              <Button className="w-full bg-[#1B2E5E] text-white hover:bg-[#1B2E5E]/90">
                Retour au tableau de bord
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button
                variant="outline"
                className="w-full border-[#DDE3EF] text-[#1B2E5E] hover:bg-[#F8FAFC]"
              >
                Accueil
              </Button>
            </Link>
          </div>

          <p className="text-xs text-[#94A3B8] text-center">
            Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
