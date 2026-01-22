'use client'

import { CheckIcon, ChevronDownIcon, GlobeIcon } from 'lucide-react'
import { useRef } from 'react'
import {
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
} from '@/components/ai-elements/model-selector'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ModelOption } from './definitions/message-types'

interface ChatInputProps {
  model: string
  models: ModelOption[]
  text: string
  useWebSearch: boolean
  useMicrophone: boolean
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  modelSelectorOpen: boolean
  disabled?: boolean
  placeholder?: string
  onModelChange: (modelId: string) => void
  onModelSelectorOpenChange: (open: boolean) => void
  onTextChange: (text: string) => void
  onUseWebSearchChange: (enabled: boolean) => void
  onUseMicrophoneChange: (enabled: boolean) => void
  onSubmit: (message: PromptInputMessage) => void
}

export type { PromptInputMessage }

export const ChatInput = ({
  model,
  models,
  text = '',
  useWebSearch,
  useMicrophone,
  status,
  modelSelectorOpen,
  disabled = false,
  placeholder = 'Type a message...',
  onModelChange,
  onModelSelectorOpenChange,
  onTextChange,
  onUseWebSearchChange,
  onUseMicrophoneChange,
  onSubmit,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const selectedModelData = models.find((m) => m.id === model)

  // Group models by provider
  const groupedModels = models.reduce(
    (acc, m) => {
      const provider = m.chefSlug || 'other'
      if (!acc[provider]) {
        acc[provider] = []
      }
      acc[provider].push(m)
      return acc
    },
    {} as Record<string, ModelOption[]>,
  )

  const handleSubmit = (message: PromptInputMessage) => {
    if (disabled || status === 'streaming') return
    onSubmit(message)
    onTextChange('')
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="w-full px-4 pb-4">
          <PromptInput
            onSubmit={handleSubmit}
            accept="image/*"
            multiple
            className="rounded-2xl border border-border/50 bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <PromptInputHeader>
              <PromptInputAttachments>
                {(file) => <PromptInputAttachment data={file} />}
              </PromptInputAttachments>
            </PromptInputHeader>

            <PromptInputBody>
              <PromptInputTextarea
                ref={textareaRef}
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
              />
            </PromptInputBody>

            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>

                <PromptInputSpeechButton
                  textareaRef={textareaRef}
                  onTranscriptionChange={onTextChange}
                />

                <PromptInputButton
                  variant={useWebSearch ? 'default' : 'ghost'}
                  onClick={() => onUseWebSearchChange(!useWebSearch)}
                >
                  <GlobeIcon className="mr-1 size-4" />
                  <span className="text-xs">Search</span>
                </PromptInputButton>

                <DropdownMenu open={modelSelectorOpen} onOpenChange={onModelSelectorOpenChange}>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
                      {selectedModelData && (
                        <ModelSelectorLogoGroup>
                          <ModelSelectorLogo provider={selectedModelData.chefSlug} />
                        </ModelSelectorLogoGroup>
                      )}
                      <span className="max-w-24 truncate text-xs">
                        {selectedModelData?.name || 'Select Model'}
                      </span>
                      <ChevronDownIcon className="size-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <ScrollArea className="max-h-72">
                      {Object.entries(groupedModels).map(([provider, providerModels]) => (
                        <DropdownMenuGroup key={provider}>
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            {provider.charAt(0).toUpperCase() + provider.slice(1)}
                          </DropdownMenuLabel>
                          {providerModels.map((m) => (
                            <DropdownMenuItem
                              key={m.id}
                              onClick={() => {
                                onModelChange(m.id)
                                onModelSelectorOpenChange(false)
                              }}
                              className="flex items-center gap-2"
                            >
                              <ModelSelectorLogoGroup>
                                <ModelSelectorLogo provider={m.chefSlug} />
                              </ModelSelectorLogoGroup>
                              <span className="flex-1 truncate">{m.name}</span>
                              {model === m.id && <CheckIcon className="size-4" />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      ))}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
              </PromptInputTools>

              <PromptInputSubmit
                disabled={disabled || status === 'streaming' || !text?.trim()}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
