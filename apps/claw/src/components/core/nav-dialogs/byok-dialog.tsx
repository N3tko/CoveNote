import type { LLMByok, LLMProvider } from '@netko/claw-domain'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { EyeIcon, EyeOffIcon, Loader2Icon, SaveIcon, TrashIcon } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { client } from '@/integrations/eden'

interface ByokDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// LLM Provider enum values matching the database
const LLM_PROVIDERS = ['openai', 'ollama', 'openrouter', 'custom'] as const

const providerConfig: Record<LLMProvider, { name: string; icon: string }> = {
  openai: { name: 'OpenAI', icon: '🤖' },
  openrouter: { name: 'OpenRouter', icon: '🌐' },
  ollama: { name: 'Ollama', icon: '🦙' },
  custom: { name: 'Custom', icon: '⚡' },
}

export function ByokDialog({ open, onOpenChange }: ByokDialogProps) {
  const queryClient = useQueryClient()
  const { data: apiKeys = [], refetch } = useQuery({
    queryKey: ['byok'],
    queryFn: async () => {
      const response = await client.api.byok.get()
      if (response.error) throw new Error('Failed to fetch BYOK configurations')
      return response.data
    },
  })

  const [keyValues, setKeyValues] = React.useState<Record<string, string>>({})
  const [showKeys, setShowKeys] = React.useState<Record<string, boolean>>({})
  const [changedKeys, setChangedKeys] = React.useState<Set<string>>(new Set())
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({})

  const apiKeysByProvider = React.useMemo(() => {
    const map: Partial<Record<LLMProvider, LLMByok>> = {}
    apiKeys.forEach((key) => {
      map[key.provider as LLMProvider] = {
        ...key,
        createdAt: new Date(key.createdAt),
        updatedAt: new Date(key.updatedAt),
      } as LLMByok
    })
    return map
  }, [apiKeys])

  React.useEffect(() => {
    if (open) {
      const initialValues: Record<string, string> = {}
      for (const provider of LLM_PROVIDERS) {
        const existingKey = apiKeysByProvider[provider]
        initialValues[provider] = existingKey?.encryptedKey || ''
      }
      setKeyValues(initialValues)
      setChangedKeys(new Set())
    }
  }, [apiKeysByProvider, open])

  const createMutation = useMutation({
    mutationFn: async ({ provider, encryptedKey }: { provider: string; encryptedKey: string }) => {
      const response = await client.api.byok.post({ provider, encryptedKey })
      if (response.error) throw new Error('Failed to create BYOK')
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['byok'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, encryptedKey }: { id: string; encryptedKey: string }) => {
      const response = await client.api.byok[id].patch({ encryptedKey })
      if (response.error) throw new Error('Failed to update BYOK')
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['byok'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await client.api.byok[id].delete()
      if (response.error) throw new Error('Failed to delete BYOK')
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['byok'] })
    },
  })

  const handleMutation = async (provider: LLMProvider, action: 'save' | 'delete') => {
    setLoadingStates((prev) => ({ ...prev, [provider]: true }))
    try {
      const existingKey = apiKeysByProvider[provider]
      const providerName = providerConfig[provider].name

      if (action === 'delete') {
        if (
          existingKey &&
          confirm(`Are you sure you want to remove the ${providerName} API key?`)
        ) {
          await deleteMutation.mutateAsync({ id: existingKey.id })
          toast.success(`${providerName} API key removed.`)
        }
      } else if (action === 'save') {
        const key = keyValues[provider]
        if (!key?.trim()) {
          toast.error('API key cannot be empty.')
          return
        }
        if (existingKey) {
          await updateMutation.mutateAsync({ id: existingKey.id, encryptedKey: key })
          toast.success(`${providerName} API key updated.`)
        } else {
          await createMutation.mutateAsync({ provider, encryptedKey: key })
          toast.success(`${providerName} API key saved.`)
        }
      }

      setChangedKeys((prev) => {
        const newSet = new Set(prev)
        newSet.delete(provider)
        return newSet
      })
      await refetch()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.'
      toast.error(errorMessage)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [provider]: false }))
    }
  }

  const handleKeyChange = (provider: LLMProvider, value: string) => {
    setKeyValues((prev) => ({ ...prev, [provider]: value }))
    const existingKey = apiKeysByProvider[provider]
    const hasChanged = value !== (existingKey?.encryptedKey || '')
    setChangedKeys((prev) => {
      const newSet = new Set(prev)
      if (hasChanged) newSet.add(provider)
      else newSet.delete(provider)

      return newSet
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl border backdrop-blur-xl bg-background/60">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Manage API Keys</DialogTitle>
          <DialogDescription>
            Add or update your provider API keys. Your keys are encrypted and stored securely.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-4">
          <AnimatePresence>
            {LLM_PROVIDERS.map((provider, index) => {
              const config = providerConfig[provider]
              const existingKey = apiKeysByProvider[provider]
              const isLoading = loadingStates[provider]
              const hasChanges = changedKeys.has(provider)

              return (
                <motion.div
                  key={provider}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  className="flex items-center p-3 -mx-3 rounded-lg"
                >
                  <div className="flex items-center gap-4 w-36 shrink-0">
                    <span className="text-2xl">{config.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{config.name}</span>
                      {existingKey && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <motion.span
                            layout
                            className={`h-2 w-2 rounded-full ${existingKey.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {existingKey.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative flex-1">
                    <Input
                      type={showKeys[provider] ? 'text' : 'password'}
                      value={keyValues[provider] || ''}
                      onChange={(e) => handleKeyChange(provider, e.target.value)}
                      placeholder={`Enter your ${config.name} API key`}
                      className="pr-10 h-11 text-base"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-11"
                      onClick={() =>
                        setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }))
                      }
                    >
                      {showKeys[provider] ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center ml-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleMutation(provider, 'save')}
                      disabled={isLoading || !hasChanges}
                      className="h-11 w-11 shrink-0 text-muted-foreground hover:text-green-500"
                      aria-label={existingKey ? 'Update key' : 'Save key'}
                    >
                      {isLoading && loadingStates[provider] ? (
                        <Loader2Icon className="h-5 w-5 animate-spin" />
                      ) : (
                        <SaveIcon className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleMutation(provider, 'delete')}
                      disabled={isLoading || !existingKey}
                      className="h-11 w-11 text-muted-foreground hover:text-destructive disabled:hover:text-muted-foreground"
                      aria-label="Delete key"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
