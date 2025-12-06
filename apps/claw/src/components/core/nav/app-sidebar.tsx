import { ChatSchema, LLMAssistantSchema } from '@netko/claw-domain'
import { Button } from '@netko/ui/components/shadcn/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@netko/ui/components/shadcn/command'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@netko/ui/components/shadcn/sidebar'
import { AnimatePresence, motion } from 'motion/react'
import {
  ChevronRight,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { AssistantSwitcher } from '@/components/core/nav/assistant-switcher'
import {
  type ConversationGroup,
  groupConversationsByTime,
  NavConversations,
} from '@/components/core/nav/nav-conversations'
import { NavUser } from '@/components/core/nav/nav-user'
import { useAssistants, useSidebarChats } from '@/hooks/api'
import { authClient } from '@/lib/auth'
import { useChatStore } from '@/stores/chat'

/**
 * App Sidebar
 *
 * The navigation hub for our chat app.
 * Where conversations live and assistants thrive. 🐱
 */

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [, navigate] = useLocation()
  
  // Fetch data using Eden hooks
  const { data: assistants, isLoading } = useAssistants()
  const { data: threads, isLoading: isThreadsLoading } = useSidebarChats()

  // Store integration
  const { currentAssistant, setCurrentAssistant } = useChatStore()

  const [conversationGroups, setConversationGroups] = useState<ConversationGroup[]>([])
  const { data: user } = authClient.useSession()
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isNewChatHovered, setIsNewChatHovered] = useState(false)

  useEffect(() => {
    if (threads && !isThreadsLoading) {
      setConversationGroups(groupConversationsByTime(threads.map((c) => ChatSchema.parse(c))))
    }
  }, [threads, isThreadsLoading])

  useEffect(() => {
    if (assistants && assistants.length > 0 && !currentAssistant) {
      const firstAssistant = LLMAssistantSchema.parse(assistants[0])
      setCurrentAssistant(firstAssistant)
    }
  }, [assistants, currentAssistant, setCurrentAssistant])

  const handleCreateChat = () => {
    navigate('/chat')
  }

  const handleCommand = (command: string) => {
    console.log('Running command:', command)
    setIsCommandOpen(false)

    switch (command) {
      case 'new-chat':
        handleCreateChat()
        break
      case 'search-conversations':
        console.log('Searching conversations... 🔍')
        break
      case 'settings':
        navigate('/settings')
        break
      default:
        break
    }
  }

  const handleThreadClick = (threadId: string) => {
    navigate(`/chat/${threadId}`)
    setIsCommandOpen(false)
  }

  return (
    <>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <div className="flex h-10 w-full items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <AssistantSwitcher
                assistants={assistants?.map((c) => LLMAssistantSchema.parse(c)) ?? []}
                currentAssistant={currentAssistant}
                onAssistantChange={setCurrentAssistant}
              />
            )}

            <div className="flex gap-2">
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsNewChatHovered(true)}
                onHoverEnd={() => setIsNewChatHovered(false)}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="relative flex w-full justify-start gap-2 overflow-hidden transition-all duration-300"
                  onClick={handleCreateChat}
                >
                  <div className="relative z-10 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>New Chat</span>
                  </div>
                  <AnimatePresence>
                    {isNewChatHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2"
                      >
                        <Sparkles className="h-4 w-4 text-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: isNewChatHovered ? '0%' : '-100%' }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCommandOpen(true)}
                  className="relative overflow-hidden"
                >
                  <Search className="h-4 w-4" />
                  <motion.div
                    className="absolute inset-0 rounded-md bg-primary/10"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  />
                </Button>
              </motion.div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <NavConversations conversationGroups={conversationGroups} />
        </SidebarContent>

        <SidebarFooter>{user ? <NavUser user={user.user} /> : null}</SidebarFooter>
      </Sidebar>

      <CommandDialog
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        title="Quick Actions"
        description="Search for actions and navigate quickly..."
      >
        <CommandInput
          placeholder="Type a command or search..."
          className="border-b-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <CommandList className="thin-scrollbar">
          <CommandEmpty>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-2 py-4 text-center"
            >
              <Search className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No results found. Try something else! 🤔
              </p>
            </motion.div>
          </CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => handleCommand('new-chat')}
              className="group relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors duration-300 aria-selected:bg-primary/10 hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Chat</span>
              <motion.div
                className="absolute right-2 opacity-0 transition-opacity group-hover:opacity-100"
                initial={false}
                animate={{ x: [-5, 0], opacity: [0, 1] }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </CommandItem>
            <CommandItem
              onSelect={() => handleCommand('search-conversations')}
              className="group relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors duration-300 aria-selected:bg-primary/10 hover:bg-accent"
            >
              <Search className="h-4 w-4" />
              <span>Search Conversations</span>
              <motion.div
                className="absolute right-2 opacity-0 transition-opacity group-hover:opacity-100"
                initial={false}
                animate={{ x: [-5, 0], opacity: [0, 1] }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </CommandItem>
            <CommandItem
              onSelect={() => handleCommand('settings')}
              className="group relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors duration-300 aria-selected:bg-primary/10 hover:bg-accent"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
              <motion.div
                className="absolute right-2 opacity-0 transition-opacity group-hover:opacity-100"
                initial={false}
                animate={{ x: [-5, 0], opacity: [0, 1] }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Recent Conversations">
            {threads?.map((thread) => (
              <CommandItem
                key={thread.id}
                onSelect={() => handleThreadClick(thread.id)}
                className="group relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors duration-300 aria-selected:bg-primary/10 hover:bg-accent"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="flex-1 truncate">{thread.title}</span>
                <motion.div
                  className="absolute right-2 opacity-0 transition-opacity group-hover:opacity-100"
                  initial={false}
                  animate={{ x: [-5, 0], opacity: [0, 1] }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
