'use client'

import {
  IconArrowLeft,
  IconBell,
  IconChevronDown,
  IconChevronRight,
  IconDots,
  IconFile,
  IconFolder,
  IconInbox,
  IconLogout,
  IconPlus,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconTrash,
} from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { authClient } from '@/integrations/auth'
import { cn } from '@/lib/utils'
import type {
  ChatItem,
  ChatItemWithGroup,
  DateGroup,
  PageItem,
  SidebarView,
  SidebarViewContextValue,
  User,
} from './app-sidebar/definitions/types'
import {
  allChats,
  groupLabels,
  listItem,
  notifications,
  pages,
  staggerContainer,
  viewVariants,
  workspaceColors,
  workspaces,
} from './app-sidebar/definitions/values'

// Sidebar view context
const SidebarViewContext = React.createContext<SidebarViewContextValue | null>(null)

function useSidebarView() {
  const context = React.useContext(SidebarViewContext)
  if (!context) {
    throw new Error('useSidebarView must be used within SidebarViewProvider')
  }
  return context
}

function groupChatsByDate(chats: ChatItemWithGroup[]) {
  const groups: Record<DateGroup, ChatItem[]> = {
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
    older: [],
  }

  for (const chat of chats) {
    groups[chat.group].push(chat)
  }

  return groups
}

// Back Button Header
function BackHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  const { goBack } = useSidebarView()

  return (
    <motion.div
      className="flex items-center gap-2 px-2 py-1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Button variant="ghost" size="icon-sm" onClick={goBack} className="shrink-0">
        <IconArrowLeft className="size-4" />
        <span className="sr-only">Back</span>
      </Button>
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        <span>{title}</span>
      </div>
    </motion.div>
  )
}

// Workspace Selector Component
function WorkspaceSelector() {
  const [selectedWorkspace, setSelectedWorkspace] = React.useState(workspaces[0])
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const colors = workspaceColors[selectedWorkspace.id] || { from: 'from-primary', to: 'to-primary' }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            tooltip={selectedWorkspace.name}
            className={cn(
              'data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground',
              isCollapsed && 'size-8! p-0!',
            )}
          >
            <div
              className={cn(
                'flex shrink-0 items-center justify-center rounded-lg bg-linear-to-br font-semibold text-sm text-white shadow-sm',
                'size-8',
                colors.from,
                colors.to,
              )}
            >
              {selectedWorkspace.icon}
            </div>
            {!isCollapsed && (
              <>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold text-sm">{selectedWorkspace.name}</span>
                  <span className="truncate text-muted-foreground text-xs">Workspace</span>
                </div>
                <IconChevronDown className="ml-auto size-4 opacity-50" />
              </>
            )}
          </SidebarMenuButton>
        }
      />
      <DropdownMenuContent className="min-w-56" align="start" side="bottom" sideOffset={4}>
        {workspaces.map((workspace) => {
          const wColors = workspaceColors[workspace.id] || {
            from: 'from-primary',
            to: 'to-primary',
          }
          return (
            <DropdownMenuItem
              key={workspace.id}
              onSelect={() => setSelectedWorkspace(workspace)}
              className="gap-2"
            >
              <div
                className={cn(
                  'flex size-6 items-center justify-center rounded bg-linear-to-br text-xs font-medium text-white',
                  wColors.from,
                  wColors.to,
                )}
              >
                {workspace.icon}
              </div>
              <span>{workspace.name}</span>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <IconPlus className="size-4" />
          <span>Create workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Chat List Item (compact for main view)
function ChatListItem({ chat }: { chat: ChatItem }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link to="/chat/$chatId" params={{ chatId: chat.id }} />}
        tooltip={chat.title}
      >
        <IconSparkles className="size-4 shrink-0 text-primary/70" />
        <span className="truncate">{chat.title}</span>
      </SidebarMenuButton>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction showOnHover className="group-data-[collapsible=icon]:hidden">
              <IconDots className="size-3.5" />
            </SidebarMenuAction>
          }
        />
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem variant="destructive">
            <IconTrash className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

// AI Chats Section (main view)
function AIChatsSection() {
  const [isOpen, setIsOpen] = React.useState(true)
  const { setView } = useSidebarView()
  const recentChats = allChats.slice(0, 10)
  const hasMore = allChats.length > 10

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarGroup>
        <CollapsibleTrigger
          nativeButton={false}
          render={
            <SidebarGroupLabel className="cursor-pointer group-data-[collapsible=icon]:hidden">
              <IconChevronRight
                className={cn(
                  'mr-1 size-3.5 transition-transform duration-200',
                  isOpen && 'rotate-90',
                )}
              />
              <IconSparkles className="mr-1.5 size-3.5" />
              AI Chats
              <span className="ml-1 text-xs text-muted-foreground">({allChats.length})</span>
            </SidebarGroupLabel>
          }
        />
        <SidebarGroupAction title="New Chat" className="group-data-[collapsible=icon]:hidden">
          <IconPlus className="size-4" />
        </SidebarGroupAction>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentChats.map((chat) => (
                <ChatListItem key={chat.id} chat={chat} />
              ))}
              {hasMore && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setView('chats')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <IconDots className="size-4" />
                    <span>View all chats</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

// Inbox Button (main view)
function InboxButton() {
  const { setView } = useSidebarView()
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={`Inbox (${unreadCount})`} onClick={() => setView('inbox')}>
        <IconInbox className="size-4" />
        <span className="flex-1">Inbox</span>
        {unreadCount > 0 && (
          <SidebarMenuBadge className="bg-primary/10 text-primary">{unreadCount}</SidebarMenuBadge>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// Pages Section (collapsible)
function PagesSection() {
  const [isOpen, setIsOpen] = React.useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <CollapsibleTrigger
          nativeButton={false}
          render={
            <SidebarGroupLabel className="cursor-pointer">
              <IconChevronRight
                className={cn(
                  'mr-1 size-3.5 transition-transform duration-200',
                  isOpen && 'rotate-90',
                )}
              />
              <IconFolder className="mr-1.5 size-3.5" />
              Pages
              <span className="ml-1 text-xs text-muted-foreground">({pages.length})</span>
            </SidebarGroupLabel>
          }
        />
        <SidebarGroupAction title="New Page" className="group-data-[collapsible=icon]:hidden">
          <IconPlus className="size-4" />
        </SidebarGroupAction>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {pages.map((page) => (
                <PageTreeItem key={page.id} page={page} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

// Page Tree Item Component (recursive)
function PageTreeItem({ page }: { page: PageItem }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = page.children && page.children.length > 0

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <SidebarMenuItem>
          <CollapsibleTrigger
            render={
              <SidebarMenuButton tooltip={page.title}>
                {hasChildren ? (
                  <IconChevronRight
                    className={cn(
                      'size-4 shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-90',
                    )}
                  />
                ) : (
                  <IconFile className="size-4 shrink-0 opacity-50" />
                )}
                {page.icon && <span className="shrink-0 text-sm">{page.icon}</span>}
                <span className="truncate">{page.title}</span>
              </SidebarMenuButton>
            }
          />
          <SidebarMenuAction showOnHover>
            <IconPlus className="size-3.5" />
          </SidebarMenuAction>
          <CollapsibleContent>
            <SidebarMenuSub>
              {page.children?.map((child) => (
                <PageTreeSubItem key={child.id} page={child} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={page.title}>
        {page.icon ? (
          <span className="shrink-0 text-sm">{page.icon}</span>
        ) : (
          <IconFile className="size-4 shrink-0 opacity-50" />
        )}
        <span className="truncate">{page.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// Page Tree Sub Item Component (for nested items)
function PageTreeSubItem({ page }: { page: PageItem }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = page.children && page.children.length > 0

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <SidebarMenuSubItem>
          <CollapsibleTrigger
            nativeButton={false}
            render={
              <SidebarMenuSubButton>
                <IconChevronRight
                  className={cn(
                    'size-3.5 shrink-0 transition-transform duration-200',
                    isOpen && 'rotate-90',
                  )}
                />
                <span className="truncate">{page.title}</span>
              </SidebarMenuSubButton>
            }
          />
          <CollapsibleContent>
            <SidebarMenuSub>
              {page.children?.map((child) => (
                <PageTreeSubItem key={child.id} page={child} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuSubItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton>
        <IconFile className="size-3.5 shrink-0 opacity-50" />
        <span className="truncate">{page.title}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

// User Footer Component
function UserFooter({ user }: { user: User }) {
  const navigate = useNavigate()
  const initials =
    user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? 'U'

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/auth' })
        },
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            tooltip={user.name}
            className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
          >
            <Avatar size="sm">
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-medium text-sm">{user.name}</span>
              <span className="truncate text-muted-foreground text-xs">{user.email}</span>
            </div>
            <IconDots className="ml-auto size-4 opacity-50" />
          </SidebarMenuButton>
        }
      />
      <DropdownMenuContent className="min-w-56" align="end" side="top" sideOffset={4}>
        <div className="flex items-center gap-2 p-2">
          <Avatar size="sm">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-medium text-sm">{user.name}</span>
            <span className="truncate text-muted-foreground text-xs">{user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <IconSettings className="mr-2 size-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} variant="destructive">
          <IconLogout className="mr-2 size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Notification type icons
function getNotificationIcon(type: NotificationItem['type']) {
  switch (type) {
    case 'mention':
      return <span className="font-semibold text-blue-500">@</span>
    case 'comment':
      return <IconDots className="size-3.5 text-green-500" />
    case 'share':
      return <IconFolder className="size-3.5 text-purple-500" />
    case 'system':
      return <IconBell className="size-3.5 text-muted-foreground" />
  }
}

// Main View Content
function MainViewContent() {
  return (
    <motion.div
      key="main"
      initial="enter"
      animate="center"
      exit="exit"
      variants={viewVariants}
      custom={-1}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-1 flex-col"
    >
      {/* Search */}
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-muted-foreground hover:text-foreground"
                tooltip="Search (⌘K)"
              >
                <IconSearch className="size-4" />
                <span className="flex-1">Search</span>
                <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  ⌘K
                </kbd>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Inbox - Now at the top */}
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          <SidebarMenu>
            <InboxButton />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

      {/* AI Chats - Collapsible */}
      <AIChatsSection />

      <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

      {/* Pages - Collapsible */}
      <PagesSection />

      {/* Pages icon when collapsed */}
      <SidebarGroup className="hidden py-0 group-data-[collapsible=icon]:block">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Pages">
                <IconFolder className="size-4" />
                <span>Pages</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </motion.div>
  )
}

// Compact Chat Item for grouped view
function CompactChatItem({ chat, index }: { chat: ChatItem; index: number }) {
  return (
    <motion.div
      variants={listItem}
      transition={{ duration: 0.12, delay: index * 0.015 }}
      className="group relative"
    >
      <Link
        to="/chat/$chatId"
        params={{ chatId: chat.id }}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
          'hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        )}
      >
        <IconSparkles className="size-3.5 shrink-0 text-primary/60" />
        <span className="truncate text-sm">{chat.title}</span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 transition-opacity hover:bg-accent-foreground/10 group-hover:opacity-100"
            >
              <IconDots className="size-3" />
            </button>
          }
        />
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem variant="destructive">
            <IconTrash className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}

// All Chats View
function ChatsViewContent() {
  const groupedChats = React.useMemo(() => groupChatsByDate(allChats), [])
  const groupOrder: DateGroup[] = ['today', 'yesterday', 'lastWeek', 'lastMonth', 'older']

  let itemIndex = 0

  return (
    <motion.div
      key="chats"
      initial="enter"
      animate="center"
      exit="exit"
      variants={viewVariants}
      custom={1}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-1 flex-col"
    >
      <SidebarGroup className="py-0">
        <BackHeader title="All Chats" icon={<IconSparkles className="size-4 text-primary" />} />
      </SidebarGroup>

      <SidebarSeparator />

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col"
        >
          {groupOrder.map((group) => {
            const chats = groupedChats[group]
            if (chats.length === 0) return null

            return (
              <div key={group} className="mt-3 first:mt-1">
                <div className="mb-1 px-2 text-xs font-medium text-muted-foreground">
                  {groupLabels[group]}
                </div>
                <div className="flex flex-col">
                  {chats.map((chat) => {
                    const currentIndex = itemIndex++
                    return <CompactChatItem key={chat.id} chat={chat} index={currentIndex} />
                  })}
                </div>
              </div>
            )
          })}
        </motion.div>
      </div>
    </motion.div>
  )
}

// Inbox View
function InboxViewContent() {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <motion.div
      key="inbox"
      initial="enter"
      animate="center"
      exit="exit"
      variants={viewVariants}
      custom={1}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-1 flex-col"
    >
      <SidebarGroup className="py-0">
        <BackHeader
          title={`Inbox${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          icon={<IconInbox className="size-4" />}
        />
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarGroup className="flex-1 overflow-y-auto">
        <SidebarGroupContent className="px-2">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-1"
          >
            {notifications.map((notification, index) => (
              <motion.button
                key={notification.id}
                variants={listItem}
                transition={{ duration: 0.15, delay: index * 0.03 }}
                className={cn(
                  'flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
                  'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  !notification.read && 'bg-accent/40',
                )}
              >
                <div className="flex size-5 shrink-0 items-center justify-center pt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{notification.title}</span>
                    {!notification.read && (
                      <motion.span
                        className="size-1.5 shrink-0 rounded-full bg-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.03 + 0.1 }}
                      />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{notification.message}</span>
                  <span className="text-xs text-muted-foreground/60">{notification.time}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </SidebarGroupContent>
      </SidebarGroup>
    </motion.div>
  )
}

// Main AppSidebar Component
export function AppSidebar({ user }: { user: User }) {
  const [view, setView] = React.useState<SidebarView>('main')
  const [direction, setDirection] = React.useState(0)

  const handleSetView = React.useCallback((newView: SidebarView) => {
    setDirection(newView === 'main' ? -1 : 1)
    setView(newView)
  }, [])

  const goBack = React.useCallback(() => {
    setDirection(-1)
    setView('main')
  }, [])

  const contextValue = React.useMemo(
    () => ({ view, setView: handleSetView, goBack }),
    [view, handleSetView, goBack],
  )

  return (
    <SidebarViewContext.Provider value={contextValue}>
      <Sidebar collapsible="icon" variant="sidebar">
        {/* Header - only show workspace selector on main view */}
        <AnimatePresence mode="wait">
          {view === 'main' && (
            <motion.div
              key="header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <WorkspaceSelector />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarHeader>
            </motion.div>
          )}
        </AnimatePresence>

        <SidebarContent className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {view === 'main' && <MainViewContent />}
            {view === 'chats' && <ChatsViewContent />}
            {view === 'inbox' && <InboxViewContent />}
          </AnimatePresence>
        </SidebarContent>

        {/* Footer - only show on main view */}
        <AnimatePresence mode="wait">
          {view === 'main' && (
            <motion.div
              key="footer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <UserFooter user={user} />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </motion.div>
          )}
        </AnimatePresence>

        <SidebarRail />
      </Sidebar>
    </SidebarViewContext.Provider>
  )
}
