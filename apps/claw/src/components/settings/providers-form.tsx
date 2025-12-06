import type { LLMByok as ApiKey, LLMProvider as ModelProvider } from '@netko/claw-domain'
import { LLMProviderEnum as ModelProviderEnum } from '@netko/claw-domain'
import { Badge } from '@netko/ui/components/shadcn/badge'
import { Button } from '@netko/ui/components/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@netko/ui/components/shadcn/card'
import { Input } from '@netko/ui/components/shadcn/input'
import { EyeIcon, EyeOffIcon, Key, Loader2Icon, SaveIcon, TrashIcon } from 'lucide-react'
import * as React from 'react'
import { useByokKeys, useCreateByok, useUpdateByok, useDeleteByok } from '@/hooks/api'

/**
 * Providers Form
 *
 * Manage API keys for different model providers.
 * BYOK - Bring Your Own Keys. 🔑🐱
 */

export function ProvidersForm() {
  const { data: apiKeys = [], refetch } = useByokKeys()

  const createMutation = useCreateByok()
  const updateMutation = useUpdateByok()
  const deleteMutation = useDeleteByok()

  const [keyValues, setKeyValues] = React.useState<Record<string, string>>({})
  const [showKeys, setShowKeys] = React.useState<Record<string, boolean>>({})
  const [changedKeys, setChangedKeys] = React.useState<Set<string>>(new Set())
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({})

  const apiKeysByProvider = React.useMemo(() => {
    const map: Partial<Record<ModelProvider, ApiKey>> = {}
    apiKeys.forEach((key: ApiKey) => {
      map[key.provider as ModelProvider] = {
        ...key,
        lastUsedAt: key.lastUsedAt ? new Date(key.lastUsedAt) : null,
        createdAt: new Date(key.createdAt),
      }
    })
    return map
  }, [apiKeys])

  React.useEffect(() => {
    const initialValues: Record<string, string> = {}
    for (const provider of Object.values(ModelProviderEnum)) {
      const existingKey = apiKeysByProvider[provider]
      initialValues[provider] = existingKey?.encryptedKey || ''
    }
    setKeyValues(initialValues)
    setChangedKeys(new Set())
  }, [apiKeysByProvider])

  const handleKeyChange = (provider: ModelProvider, value: string) => {
    setKeyValues((prev) => ({ ...prev, [provider]: value }))
    const existingKey = apiKeysByProvider[provider]
    const hasChanged = value !== (existingKey?.encryptedKey || '')
    setChangedKeys((prev) => {
      const next = new Set(prev)
      if (hasChanged) next.add(provider)
      else next.delete(provider)
      return next
    })
  }

  const handleSaveOrDelete = async (provider: ModelProvider, action: 'save' | 'delete') => {
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
          await updateMutation.mutateAsync({ id: existingKey.id, key })
        } else {
          await createMutation.mutateAsync({ provider, key })
        }
      }
      setChangedKeys((prev) => {
        const next = new Set(prev)
        next.delete(provider)
        return next
      })
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
        {[ModelProviderEnum.OPENROUTER].map((provider) => {
          const existingKey = apiKeysByProvider[provider as ModelProvider]
          const isLoading = loadingStates[provider]
          const hasChanges = changedKeys.has(provider)

          const label = provider === ModelProviderEnum.OPENROUTER ? 'OpenRouter' : provider

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
                    onChange={(e) => handleKeyChange(provider as ModelProvider, e.target.value)}
                    placeholder={`Enter your ${label} API key`}
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
                    onClick={() => handleSaveOrDelete(provider as ModelProvider, 'save')}
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
                    onClick={() => handleSaveOrDelete(provider as ModelProvider, 'delete')}
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
