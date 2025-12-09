import { useAssistants } from '@/hooks/use-assistants'
import type { LLMAssistant } from '@netko/claw-domain'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@netko/ui/components/shadcn/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@netko/ui/components/shadcn/sidebar'
import { cn } from '@netko/ui/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, ChevronsUpDown, Loader2, Plus, Sparkles } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

interface AssistantSwitcherProps {
  onAssistantChange?: (assistant: LLMAssistant) => void
}

export function AssistantSwitcher({ onAssistantChange }: AssistantSwitcherProps) {
  const { isMobile } = useSidebar()
  const { assistants, currentAssistant, isLoading, selectAssistant } = useAssistants()

  const [isOpen, setIsOpen] = React.useState(false)

  // Use the store-provided currentAssistant or fallback to first assistant
  const activeAssistant = currentAssistant || assistants[0]

  const handleAssistantSelect = (assistant: LLMAssistant) => {
    selectAssistant(assistant)
    onAssistantChange?.(assistant)
    toast.success(`Switched to ${assistant.name}`)
    setIsOpen(false)
  }

  // Show loading state
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Loader2 className="size-4 animate-spin" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Show empty state
  if (!activeAssistant || assistants.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Bot className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">No assistants</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                'relative overflow-hidden transition-all duration-300 ease-in-out',
                'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
                'hover:shadow-lg hover:scale-[1.02]',
              )}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                animate={{
                  opacity: isOpen ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Bot className="size-4" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                  }}
                >
                  <Sparkles className="size-3 text-yellow-400" />
                </motion.div>
              </motion.div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeAssistant.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeAssistant.description}
                </span>
              </div>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronsUpDown className="ml-auto" />
              </motion.div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg backdrop-blur-sm bg-opacity-95"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs flex items-center gap-2">
              <Sparkles className="size-3" /> Assistants
            </DropdownMenuLabel>
            <AnimatePresence>
              {assistants.map((assistant, index) => (
                <motion.div
                  key={assistant.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <DropdownMenuItem
                    onClick={() => {
                      handleAssistantSelect(assistant)
                    }}
                    className={cn(
                      'gap-2 p-2 transition-all duration-200',
                      'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10',
                      activeAssistant.name === assistant.name &&
                        'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
                    )}
                  >
                    <motion.div
                      className="flex size-6 items-center justify-center rounded-md border"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <Bot className="size-3.5 shrink-0" />
                    </motion.div>
                    {assistant.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </motion.div>
              ))}
            </AnimatePresence>
            <DropdownMenuSeparator />
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <DropdownMenuItem className="gap-2 p-2 group">
                <motion.div
                  className="flex size-6 items-center justify-center rounded-md border bg-transparent group-hover:border-purple-500/50"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="size-4" />
                </motion.div>
                <div className="text-muted-foreground font-medium group-hover:text-purple-500">
                  Add assistant
                </div>
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
