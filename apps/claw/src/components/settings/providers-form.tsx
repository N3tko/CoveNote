import type { LLMProvider } from '@netko/claw-domain'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EyeIcon, EyeOffIcon, Key, Loader2Icon, SaveIcon, TrashIcon } from 'lucide-react'
import * as React from 'react'
import { client } from '@/integrations/eden'

// LLM Provider enum values matching the database
const LLM_PROVIDERS = ['openai', 'ollama', 'openrouter', 'custom'] as const

type ByokResponse = {
  id: string
  provider: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function ProvidersForm() {
  const queryClient = useQueryClient()
  const { data: apiKeys = [], refetch } = useQuery({
    queryKey: ['byok'],
    queryFn: async () => {
      const res = await client.api.byok.get()
      if (res.error) throw new Error('Failed to fetch BYOK')
      return (res.data ?? []) as ByokResponse[]
    },
  })

  const [keyValues, setKeyValues] = React.useState<Record<string, string>>({})
  const [showKeys, setShowKeys] = React.useState<Record<string, boolean>>({})
  const [changedKeys, setChangedKeys] = React.useState<Set<string>>(new Set())
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({})

  const apiKeysByProvider = React.useMemo(() => {
    const map: Partial<Record<LLMProvider, ByokResponse>> = {}
    apiKeys.forEach((key) => {
      map[key.provider as LLMProvider] = key
    })
    return map
  }, [apiKeys])

  React.useEffect(() => {
    const initialValues: Record<string, string> = {}
    for (const provider of LLM_PROVIDERS) {
      const existingKey = apiKeysByProvider[provider]
      // If key exists, show placeholder to indicate it's saved
      initialValues[provider] = existingKey ? '' : ''
    }
    setKeyValues(initialValues)
    setChangedKeys(new Set())
  }, [apiKeysByProvider])

  const createMutation = useMutation({
    mutationFn: async (data: { provider: string; encryptedKey: string }) => {
      const res = await client.api.byok.post(data)
      if (res.error) throw new Error('Failed to create BYOK')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['byok'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; encryptedKey?: string; isActive?: boolean }) => {
      const { id, ...body } = data
      const res = await client.api.byok({ id }).patch(body)
      if (res.error) throw new Error('Failed to update BYOK')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['byok'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.byok({ id }).delete()
      if (res.error) throw new Error('Failed to delete BYOK')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['byok'] })
    },
  })

  const handleKeyChange = (provider: LLMProvider, value: string) => {
    setKeyValues((prev) => ({ ...prev, [provider]: value }))
    // Mark as changed if there's a value entered
    setChangedKeys((prev) => {
      const next = new Set(prev)
      if (value.trim()) next.add(provider)
      else next.delete(provider)
      return next
    })
  }

  const handleSaveOrDelete = async (provider: LLMProvider, action: 'save' | 'delete') => {
    setLoadingStates((prev) => ({ ...prev, [provider]: true }))
    try {
      const existingKey = apiKeysByProvider[provider]
      if (action === 'delete') {
        if (existingKey) {
          await deleteMutation.mutateAsync(existingKey.id)
        }
      } else {
        const key = keyValues[provider]
        if (existingKey) {
          await updateMutation.mutateAsync({ id: existingKey.id, encryptedKey: key })
        } else {
          await createMutation.mutateAsync({ provider, encryptedKey: key })
        }
      }
      setChangedKeys((prev) => {
        const next = new Set(prev)
        next.delete(provider)
        return next
      })
      setKeyValues((prev) => ({ ...prev, [provider]: '' }))
      await refetch()
    } finally {
      setLoadingStates((prev) => ({ ...prev, [provider]: false }))
    }
  }

  return (
    <Card className="border-border/50 bg-background/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Key className="h-5 w-5" /> Providers
          </span>
          <span className="text-xs text-muted-foreground">Bring Your Own Key</span>
        </CardTitle>
        <CardDescription>Connect your preferred model providers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(['openrouter'] as const).map((provider) => {
          const existingKey = apiKeysByProvider[provider as LLMProvider]
          const isLoading = loadingStates[provider]
          const hasChanges = changedKeys.has(provider)

          const label = provider === 'openrouter' ? 'OpenRouter' : provider

          return (
            <div
              key={provider}
              className="p-4 rounded-xl border bg-gradient-to-br from-background/80 to-background shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{label}</span>
                  {existingKey && (
                    <Badge variant="outline" className="bg-background/50">
                      {existingKey.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Input
                    type={showKeys[provider] ? 'text' : 'password'}
                    value={keyValues[provider] || ''}
                    onChange={(e) => handleKeyChange(provider as LLMProvider, e.target.value)}
                    placeholder={existingKey ? 'Enter new key to update' : `Enter your ${label} API key`}
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

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleSaveOrDelete(provider as LLMProvider, 'save')}
                    disabled={isLoading || !hasChanges}
                    className="gap-2"
                    variant="outline"
                  >
                    {isLoading ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <SaveIcon className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                  <Button
                    onClick={() => handleSaveOrDelete(provider as LLMProvider, 'delete')}
                    disabled={isLoading || !existingKey}
                    className="gap-2"
                    variant="ghost"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )
        })}

        <div className="mt-4 rounded-xl border border-dashed p-4 bg-muted/10">
          <div className="text-sm font-medium">More providers coming soon</div>
          <div className="text-xs text-muted-foreground">OpenAI, Ollama, Custom, and more.</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProvidersForm
