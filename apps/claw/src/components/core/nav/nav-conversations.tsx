'use client'

import type { Chat } from '@netko/claw-domain'
import { useRouter } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  Archive,
  Calendar,
  Clock,
  EllipsisVertical,
  History,
  type LucideIcon,
  MessageSquare,
  Share,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export type ConversationGroup = {
  label: string
  icon: LucideIcon
  conversations: Chat[]
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
}

export function NavConversations({
  conversationGroups,
}: {
  conversationGroups: ConversationGroup[]
}) {
  const router = useRouter()
  const { isMobile } = useSidebar()

  return (
    <>
      {conversationGroups.map(
        (group) =>
          group.conversations.length > 0 && (
            <SidebarGroup key={group.label} className="group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel className="flex items-center gap-2 text-sidebar-foreground/70">
                <group.icon className="size-4" />
                {group.label}
                <span className="ml-auto text-xs text-sidebar-foreground/50">
                  {group.conversations.length}
                </span>
              </SidebarGroupLabel>
              <SidebarMenu>
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-0.5"
                >
                  {group.conversations.map((conversation, _index) => (
                    <motion.div key={conversation.id} variants={itemVariants}>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="group relative h-auto overflow-hidden py-2 pr-1 transition-all duration-200 hover:bg-sidebar-accent/10">
                          <a
                            href={`/chat/${conversation.id}`}
                            onClick={(e) => {
                              e.preventDefault()
                              router.navigate({
                                to: '/chat/$chatId',
                                params: { chatId: conversation.id },
                              })
                            }}
                            className="flex w-full items-center group/item"
                          >
                            {/* Hover indicator line */}
                            <div className="absolute left-0 top-0 h-full w-0.5 bg-primary opacity-0 transition-opacity duration-200 group-hover/item:opacity-100" />

                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                              <span className="truncate text-sm text-sidebar-foreground/90 group-hover/item:text-sidebar-foreground">
                                {conversation.title}
                              </span>
                            </div>
                          </a>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <SidebarMenuAction
                            showOnHover
                            className="data-[state=open]:opacity-100 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                            render={<DropdownMenuTrigger />}
                          >
                            <EllipsisVertical className="size-4" />
                            <span className="sr-only">More options for {conversation.title}</span>
                          </SidebarMenuAction>
                          <DropdownMenuContent
                            className="w-48"
                            side={isMobile ? 'bottom' : 'right'}
                            align={isMobile ? 'end' : 'start'}
                          >
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                              <Share className="size-4 text-muted-foreground" />
                              <span>Share Chat</span>
                              <span className="ml-auto text-xs text-muted-foreground">⌘S</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                              <Trash2 className="size-4" />
                              <span>Delete Chat</span>
                              <span className="ml-auto text-xs opacity-60">⌫</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    </motion.div>
                  ))}
                </motion.div>
              </SidebarMenu>
            </SidebarGroup>
          ),
      )}
    </>
  )
}

// Helper function to group conversations by time periods
export function groupConversationsByTime(conversations: Chat[]): ConversationGroup[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  return [
    {
      label: 'Today',
      icon: Clock,
      conversations: conversations.filter((conv) => conv.createdAt >= today),
    },
    {
      label: 'Yesterday',
      icon: History,
      conversations: conversations.filter(
        (conv) => conv.createdAt >= yesterday && conv.createdAt < today,
      ),
    },
    {
      label: 'Last Week',
      icon: Calendar,
      conversations: conversations.filter(
        (conv) => conv.createdAt >= lastWeek && conv.createdAt < yesterday,
      ),
    },
    {
      label: 'Last Month',
      icon: MessageSquare,
      conversations: conversations.filter(
        (conv) => conv.createdAt >= lastMonth && conv.createdAt < lastWeek,
      ),
    },
    {
      label: 'Older',
      icon: Archive,
      conversations: conversations.filter((conv) => conv.createdAt < lastMonth),
    },
  ]
}
