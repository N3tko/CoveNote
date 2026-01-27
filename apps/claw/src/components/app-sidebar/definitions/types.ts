export interface User {
  id: string
  name: string
  email: string
  image?: string | null
}

export interface Workspace {
  id: string
  name: string
  icon: string
}

export interface ChatItem {
  id: string
  title: string
  date: string
  preview?: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'mention' | 'comment' | 'share' | 'system'
}

export interface PageItem {
  id: string
  title: string
  icon?: string
  children?: PageItem[]
}

export type SidebarView = 'main' | 'chats' | 'inbox'

export interface SidebarViewContextValue {
  view: SidebarView
  setView: (view: SidebarView) => void
  goBack: () => void
}

export type DateGroup = 'today' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'older'

export type ChatItemWithGroup = ChatItem & { group: DateGroup }
