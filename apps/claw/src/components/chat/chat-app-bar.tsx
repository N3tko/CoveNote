import type { LLMAssistant } from '@netko/claw-domain'
import { Avatar, AvatarFallback, AvatarImage } from '@netko/ui/components/shadcn/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@netko/ui/components/shadcn/breadcrumb'
import { Button } from '@netko/ui/components/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@netko/ui/components/shadcn/dropdown-menu'
import { SidebarTrigger } from '@netko/ui/components/shadcn/sidebar'
import { Archive, Bot, MoreHorizontal, Plus, Settings, Share2, Trash2 } from 'lucide-react'
import * as React from 'react'

interface ChatAppBarProps {
  assistants?: LLMAssistant[]
  assistant?: LLMAssistant | null
  chatTitle?: string
  onAssistantChange?: (assistant: LLMAssistant) => void
  onSettingsClick?: () => void
  onShareClick?: () => void
  onArchiveClick?: () => void
  onDeleteClick?: () => void
}

export function ChatAppBar({
  assistants = [],
  assistant,
  chatTitle = 'New Chat',
  onAssistantChange,
  onSettingsClick,
  onShareClick,
  onArchiveClick,
  onDeleteClick,
}: ChatAppBarProps) {
  const [activeAssistant, setActiveAssistant] = React.useState<LLMAssistant | null>(
    assistant || assistants[0] || null,
  )

  React.useEffect(() => {
    if (assistant) {
      setActiveAssistant(assistant)
    } else if (assistants.length > 0 && !activeAssistant) {
      setActiveAssistant(assistants[0])
    }
  }, [assistant, assistants, activeAssistant])

  const handleAssistantSelect = (selectedAssistant: LLMAssistant) => {
    setActiveAssistant(selectedAssistant)
    onAssistantChange?.(selectedAssistant)
  }

  const getAssistantAvatar = (assistant: LLMAssistant | null | undefined) => {
    if (!assistant) return undefined
    // You can customize this to return different avatars based on assistant name
    if (assistant.name.toLowerCase() === 'marvin') {
      return '/assets/models/marvin.jpg'
    }
    return undefined
  }

  const getAssistantInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-1 backdrop-blur-md">
      <div className="flex items-center">
        <SidebarTrigger />
        <Breadcrumb>
          <BreadcrumbList className="gap-1 sm:gap-1.5">
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto pl-2 pr-0 py-1 gap-2 hover:bg-accent">
                    <Avatar className="size-5">
                      <AvatarImage
                        src={getAssistantAvatar(activeAssistant)}
                        alt={activeAssistant?.name}
                      />
                      <AvatarFallback className="text-xs">
                        {activeAssistant ? (
                          getAssistantInitials(activeAssistant.name)
                        ) : (
                          <Bot className="size-3" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{activeAssistant?.name || 'Assistant'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 rounded-lg"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    Assistants
                  </DropdownMenuLabel>
                  {assistants.map((asst, index) => (
                    <DropdownMenuItem
                      key={asst.id}
                      onClick={() => handleAssistantSelect(asst)}
                      className="gap-2 p-2"
                    >
                      <Avatar className="size-6">
                        <AvatarImage src={getAssistantAvatar(asst)} alt={asst.name} />
                        <AvatarFallback className="text-xs">
                          {getAssistantInitials(asst.name)}
                        </AvatarFallback>
                      </Avatar>
                      {asst.name}
                      <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 p-2">
                    <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                      <Plus className="size-4" />
                    </div>
                    <div className="text-muted-foreground font-medium">Add assistant</div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <span className="text-muted-foreground">/</span>
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">{chatTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Chat options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShareClick}>
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onArchiveClick}>
            <Archive className="mr-2 h-4 w-4" />
            <span>Archive</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDeleteClick} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
