'use client'

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@netko/ui/components/ai-elements/model-selector'
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
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@netko/ui/components/ai-elements/prompt-input'
import { CheckIcon, GlobeIcon, MicIcon } from 'lucide-react'
import type { ModelOption } from './definitions/message-types'

interface ChatInputProps {
  model: string
  models: ModelOption[]
  text: string
  useWebSearch: boolean
  useMicrophone: boolean
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  modelSelectorOpen: boolean
  onModelChange: (modelId: string) => void
  onModelSelectorOpenChange: (open: boolean) => void
  onTextChange: (text: string) => void
  onUseWebSearchChange: (enabled: boolean) => void
  onUseMicrophoneChange: (enabled: boolean) => void
  onSubmit: (message: PromptInputMessage) => void
}

export const ChatInput = ({
  model,
  models,
  text,
  useWebSearch,
  useMicrophone,
  status,
  modelSelectorOpen,
  onModelChange,
  onModelSelectorOpenChange,
  onTextChange,
  onUseWebSearchChange,
  onUseMicrophoneChange,
  onSubmit,
}: ChatInputProps) => {
  const selectedModelData = models.find((m) => m.id === model)

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="w-full px-4">
          <PromptInput
            className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            globalDrop
            multiple
            onSubmit={onSubmit}
          >
            <PromptInputHeader>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
            </PromptInputHeader>

            <PromptInputBody>
              <PromptInputTextarea
                onChange={(event) => onTextChange(event.target.value)}
                value={text}
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

                <PromptInputButton
                  onClick={() => onUseMicrophoneChange(!useMicrophone)}
                  variant={useMicrophone ? 'default' : 'ghost'}
                >
                  <MicIcon size={16} />
                  <span className="sr-only">Microphone</span>
                </PromptInputButton>

                <PromptInputButton
                  onClick={() => onUseWebSearchChange(!useWebSearch)}
                  variant={useWebSearch ? 'default' : 'ghost'}
                >
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>

                <ModelSelector onOpenChange={onModelSelectorOpenChange} open={modelSelectorOpen}>
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton>
                      {selectedModelData?.chefSlug ? (
                        <ModelSelectorLogo provider={selectedModelData.chefSlug} />
                      ) : null}
                      {selectedModelData?.name ? (
                        <ModelSelectorName>{selectedModelData.name}</ModelSelectorName>
                      ) : null}
                    </PromptInputButton>
                  </ModelSelectorTrigger>

                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>

                      {['OpenAI', 'Anthropic', 'Google'].map((chef) => (
                        <ModelSelectorGroup key={chef} heading={chef}>
                          {models
                            .filter((m) => m.chef === chef)
                            .map((m) => (
                              <ModelSelectorItem
                                key={m.id}
                                onSelect={() => {
                                  onModelChange(m.id)
                                  onModelSelectorOpenChange(false)
                                }}
                                value={m.id}
                              >
                                <ModelSelectorLogo provider={m.chefSlug} />
                                <ModelSelectorName>{m.name}</ModelSelectorName>
                                <ModelSelectorLogoGroup>
                                  {m.providers.map((provider) => (
                                    <ModelSelectorLogo key={provider} provider={provider} />
                                  ))}
                                </ModelSelectorLogoGroup>
                                {model === m.id ? (
                                  <CheckIcon className="ml-auto size-4" />
                                ) : (
                                  <div className="ml-auto size-4" />
                                )}
                              </ModelSelectorItem>
                            ))}
                        </ModelSelectorGroup>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>

              <PromptInputSubmit disabled={status === 'streaming'} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
