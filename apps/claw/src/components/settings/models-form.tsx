import type { LLMModel, LLMProvider } from '@netko/claw-domain'
import { Badge } from '@netko/ui/components/shadcn/badge'
import { Button } from '@netko/ui/components/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@netko/ui/components/shadcn/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@netko/ui/components/shadcn/dialog'
import { Input } from '@netko/ui/components/shadcn/input'
import { Label } from '@netko/ui/components/shadcn/label'
import { Switch } from '@netko/ui/components/shadcn/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@netko/ui/components/shadcn/tooltip'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Cpu, Loader2Icon, Pencil, Plus, SaveIcon, Trash2 } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { useTRPC } from '@/integrations/trpc/react'
import { authClient } from '@/integrations/auth'

// LLM Provider enum values matching the database
const LLM_PROVIDERS = ['openai', 'ollama', 'openrouter', 'custom'] as const

function isPublicModel(model: LLMModel): model is LLMModel & { isPublic: boolean } {
  return typeof (model as unknown as { isPublic?: unknown }).isPublic === 'boolean'
}

type ModelsFormProps = {
  className?: string
}

export function ModelsForm({ className }: ModelsFormProps) {
  const trpcHttp = useTRPC()
  const { data } = authClient.useSession()
  const user = data?.user
  const { data: models = [], refetch } = useQuery(trpcHttp.llmModels.getAvailable.queryOptions())

  const createMutation = useMutation(trpcHttp.llmModels.create.mutationOptions())

  const updateMutation = useMutation(trpcHttp.llmModels.update.mutationOptions())
  const deleteMutation = useMutation(trpcHttp.llmModels.delete.mutationOptions())

  const [form, setForm] = React.useState({
    slug: '',
    name: '',
    provider: 'custom' as LLMProvider,
    description: '',
    isActive: true,
  })

  const [editOpen, setEditOpen] = React.useState(false)
  const [editForm, setEditForm] = React.useState({
    id: '',
    slug: '',
    name: '',
    provider: 'custom' as LLMProvider,
    description: '',
    isActive: true,
    isPublic: false,
  })

  const [search, setSearch] = React.useState('')
  const [providerFilter, setProviderFilter] = React.useState<LLMProvider | 'ALL'>('ALL')
  const [sortBy, setSortBy] = React.useState<'name' | 'provider' | 'active'>('name')

  const filteredSorted = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = models.filter((m) => {
      const matchesTerm = term
        ? m.slug.toLowerCase().includes(term) || m.name.toLowerCase().includes(term)
        : true
      const matchesProvider =
        providerFilter === 'ALL' ? true : (m.provider as unknown as string) === providerFilter
      return matchesTerm && matchesProvider
    })

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'provider')
        return (a.provider as unknown as string).localeCompare(b.provider as unknown as string)
      // active first
      return Number(b.isActive) - Number(a.isActive)
    })
    return list
  }, [models, search, providerFilter, sortBy])

  const isSaving = createMutation.isPending || updateMutation.isPending

  const getFriendlyError = (err: unknown) => {
    const anyErr = err as { message?: string; data?: { code?: string } }
    const code = anyErr?.data?.code || ''
    const message = anyErr?.message || 'Something went wrong'
    if (
      code === 'FORBIDDEN' ||
      /forbidden|only update your own|only delete your own/i.test(message)
    ) {
      return 'You can only modify your own models'
    }
    if (/public/i.test(message)) {
      return 'Public models cannot be deleted'
    }
    return message
  }

  const isAuthoredByUser = (model: LLMModel, userId?: string) => {
    if (!userId) return false
    return model.createdBy === userId
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.slug.trim() || !form.name.trim()) {
      toast.error('Please provide Slug and Name')
      return
    }
    try {
      await createMutation.mutateAsync({
        slug: form.slug,
        name: form.name,
        provider: form.provider,
        description: form.description || null,
        isActive: form.isActive,
      })
      toast.success('Model added')
      setForm({
        slug: '',
        name: '',
        provider: 'custom',
        description: '',
        isActive: true,
      })
      await refetch()
    } catch (err) {
      toast.error(getFriendlyError(err))
    }
  }

  const toggleActive = async (model: LLMModel) => {
    try {
      await updateMutation.mutateAsync({ id: model.id, isActive: !model.isActive })
      await refetch()
    } catch (err) {
      toast.error(getFriendlyError(err))
    }
  }

  const handleDelete = async (model: LLMModel) => {
    try {
      await deleteMutation.mutateAsync({ id: model.id })
      await refetch()
    } catch (err) {
      toast.error(getFriendlyError(err))
    }
  }

  const openEdit = (model: LLMModel) => {
    setEditForm({
      id: model.id,
      slug: model.slug,
      name: model.name,
      provider: (model.provider as unknown as LLMProvider) ?? 'custom',
      description: model.description ?? '',
      isActive: model.isActive,
      isPublic: isPublicModel(model) ? model.isPublic : false,
    })
    setEditOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await updateMutation.mutateAsync({
        id: editForm.id,
        slug: editForm.slug,
        name: editForm.name,
        provider: editForm.provider,
        description: editForm.description || null,
        isActive: editForm.isActive,
        isPublic: editForm.isPublic,
      })
      toast.success('Model updated')
      setEditOpen(false)
      await refetch()
    } catch (err) {
      toast.error(getFriendlyError(err))
    }
  }

  return (
    <>
      <Card className={`${className ?? ''} border-border/50 bg-background/60 backdrop-blur-sm`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="h-5 w-5" /> Models
          </CardTitle>
          <CardDescription>Manage built-in and custom models</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Search</Label>
              <Input
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Provider</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value as LLMProvider | 'ALL')}
              >
                <option value="ALL">All</option>
                {LLM_PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Sort by</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'provider' | 'active')}
              >
                <option value="name">Name</option>
                <option value="provider">Provider</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-6 gap-2">
            <div className="md:col-span-2">
              <Label className="text-xs">Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="e.g., gpt-4o-mini, my-awesome-model"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Display name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., GPT-4o Mini, My Awesome Model"
              />
            </div>
            <div className="md:col-span-1">
              <Label className="text-xs">Provider</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.provider}
                onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value as LLMProvider }))}
              >
                {LLM_PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <Label className="text-xs">Active</Label>
              <div className="h-10 flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: Boolean(v) }))}
                />
                <span className="text-xs text-muted-foreground">
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="md:col-span-6">
              <Label className="text-xs">Description (optional)</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description of capabilities"
              />
            </div>
            <div className="md:col-span-6 flex justify-end">
              <Button type="submit" className="gap-2 relative overflow-hidden" disabled={isSaving}>
                {isSaving ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add model
                <motion.div
                  className="absolute inset-0 rounded-md bg-primary/10"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            <AnimatePresence>
              {filteredSorted.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border bg-gradient-to-br from-background/60 to-background p-3 md:p-4 flex items-start justify-between backdrop-blur-sm hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 pr-4">
                    <div className="font-medium">{m.name}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                      <Badge variant="outline" className="bg-background/40">
                        {m.provider}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={m.isActive}
                          onCheckedChange={() => toggleActive(m)}
                          disabled={!isAuthoredByUser(m, user?.id)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {m.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {isPublicModel(m) && m.isPublic ? (
                        <Badge variant="outline" className="bg-background/40">
                          Public
                        </Badge>
                      ) : null}
                      {isAuthoredByUser(m, user?.id) ? (
                        <Badge variant="outline" className="bg-background/40">
                          Yours
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(m)}
                              disabled={!isAuthoredByUser(m, user?.id)}
                              aria-label="Edit model"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {!isAuthoredByUser(m, user?.id) ? (
                          <TooltipContent>Only the author can edit a model</TooltipContent>
                        ) : null}
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(m)}
                              disabled={
                                (isPublicModel(m) && m.isPublic) || !isAuthoredByUser(m, user?.id)
                              }
                              aria-label="Delete model"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {isPublicModel(m) && m.isPublic ? (
                          <TooltipContent>Public models cannot be deleted</TooltipContent>
                        ) : !isAuthoredByUser(m, user?.id) ? (
                          <TooltipContent>Only the author can delete a model</TooltipContent>
                        ) : null}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl border backdrop-blur-xl bg-background/60">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Model</DialogTitle>
            <DialogDescription>Update your model details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Slug</Label>
                <Input
                  value={editForm.slug}
                  onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="e.g., gpt-4o-mini"
                />
              </div>
              <div>
                <Label className="text-xs">Display name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., GPT-4o Mini"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-2">
                <Label className="text-xs">Description (optional)</Label>
                <Input
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description of capabilities"
                />
              </div>
              <div>
                <Label className="text-xs">Provider</Label>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={editForm.provider}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, provider: e.target.value as LLMProvider }))
                  }
                >
                  {LLM_PROVIDERS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.isActive}
                  onCheckedChange={(v) => setEditForm((f) => ({ ...f, isActive: Boolean(v) }))}
                />
                <span className="text-xs text-muted-foreground">
                  {editForm.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.isPublic}
                  onCheckedChange={(v) => setEditForm((f) => ({ ...f, isPublic: Boolean(v) }))}
                />
                <span className="text-xs text-muted-foreground">
                  {editForm.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <SaveIcon className="h-4 w-4" /> Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ModelsForm
