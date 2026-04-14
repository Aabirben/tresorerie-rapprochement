'use client'

import { useState } from 'react'
import { Plus, Search, Pencil, Archive } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { clients as initialClients } from '@/lib/mock-data'
import type { Client } from '@/src/shared/types'
import { getStatusColor } from '@/src/shared/utils/format'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [searchQuery, setSearchQuery] = useState('')
  const [archiveTarget, setArchiveTarget] = useState<Client | null>(null)
  const [pageSize, setPageSize] = useState('10')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredClients = clients.filter(
    (c) =>
      c.raisonSociale.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ice.includes(searchQuery) ||
      c.ville.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pageSizeValue = Number.parseInt(pageSize, 10)
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSizeValue))
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * pageSizeValue
  const paginatedClients = filteredClients.slice(pageStart, pageStart + pageSizeValue)
  const displayedCount = paginatedClients.length

  const handleArchive = () => {
    if (archiveTarget) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === archiveTarget.id ? { ...c, statut: 'Inactif' } : c
        )
      )
      toast.success('Client archivé avec succès')
      setArchiveTarget(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Clients</h1>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Client
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, ICE ou ville..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Raison Sociale</TableHead>
                <TableHead className="font-semibold">ICE</TableHead>
                <TableHead className="font-semibold">Segment</TableHead>
                <TableHead className="font-semibold">Ville</TableHead>
                <TableHead className="font-semibold">Mode de paiement</TableHead>
                <TableHead className="font-semibold">Délai (j)</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Archive className="h-8 w-8" />
                      <p>Aucun client enregistré.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{client.raisonSociale}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {client.ice}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{client.segment || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{client.ville}</TableCell>
                    <TableCell className="text-muted-foreground">{client.modePaiement}</TableCell>
                    <TableCell className="text-muted-foreground">{client.delaiPaiement}j</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(client.statut)}>
                        {client.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setArchiveTarget(client)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Afficher</span>
              <Select value={pageSize} onValueChange={(value) => { setPageSize(value); setCurrentPage(1) }}>
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>par page</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{displayedCount} de {filteredClients.length} résultats</span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={!!archiveTarget} onOpenChange={() => setArchiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver le client</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir archiver le client{' '}
              <strong>{archiveTarget?.raisonSociale}</strong> ? Cette action changera son statut
              en Inactif.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Archiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
