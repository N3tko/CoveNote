import type { ChatItemWithGroup, DateGroup, NotificationItem, PageItem, Workspace } from './types'

// Animation variants
export const viewVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
  }),
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
}

export const listItem = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
}

// Mock data - replace with real data
export const workspaces: Workspace[] = [
  { id: '1', name: 'Personal', icon: 'P' },
  { id: '2', name: 'Work', icon: 'W' },
  { id: '3', name: 'Side Projects', icon: 'S' },
]

export const allChats: ChatItemWithGroup[] = [
  { id: '1', title: 'Understanding React Server Components', date: 'Today', group: 'today' },
  { id: '2', title: 'TypeScript Advanced Patterns', date: 'Today', group: 'today' },
  { id: '3', title: 'Database Schema Design', date: 'Yesterday', group: 'yesterday' },
  { id: '4', title: 'API Authentication Strategies', date: 'Yesterday', group: 'yesterday' },
  { id: '5', title: 'CSS Grid vs Flexbox', date: '2 days ago', group: 'lastWeek' },
  { id: '6', title: 'React Query Best Practices', date: '2 days ago', group: 'lastWeek' },
  { id: '7', title: 'Node.js Performance Tips', date: '3 days ago', group: 'lastWeek' },
  { id: '8', title: 'GraphQL Schema Design', date: '3 days ago', group: 'lastWeek' },
  { id: '9', title: 'Docker Compose Setup', date: '4 days ago', group: 'lastWeek' },
  { id: '10', title: 'Testing Strategies', date: '4 days ago', group: 'lastWeek' },
  { id: '11', title: 'CI/CD Pipeline Setup', date: '5 days ago', group: 'lastWeek' },
  { id: '12', title: 'Microservices Architecture', date: '2 weeks ago', group: 'lastMonth' },
  { id: '13', title: 'Redis Caching Patterns', date: '2 weeks ago', group: 'lastMonth' },
  { id: '14', title: 'WebSocket Implementation', date: '3 weeks ago', group: 'lastMonth' },
  { id: '15', title: 'OAuth 2.0 Deep Dive', date: '2 months ago', group: 'older' },
]

export const groupLabels: Record<DateGroup, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  lastWeek: 'Last 7 days',
  lastMonth: 'Last 30 days',
  older: 'Older',
}

export const notifications: NotificationItem[] = [
  {
    id: '1',
    title: 'John mentioned you',
    message: 'in Project Alpha discussion',
    time: '5 min ago',
    read: false,
    type: 'mention',
  },
  {
    id: '2',
    title: 'New comment',
    message: 'Sarah replied to your note',
    time: '1 hour ago',
    read: false,
    type: 'comment',
  },
  {
    id: '3',
    title: 'Document shared',
    message: "Mike shared 'Q4 Planning' with you",
    time: '2 hours ago',
    read: false,
    type: 'share',
  },
  {
    id: '4',
    title: 'AI Chat completed',
    message: 'Your analysis is ready',
    time: '3 hours ago',
    read: true,
    type: 'system',
  },
  {
    id: '5',
    title: 'Weekly digest',
    message: 'Your activity summary is ready',
    time: '1 day ago',
    read: true,
    type: 'system',
  },
]

export const pages: PageItem[] = [
  {
    id: '1',
    title: 'Getting Started',
    icon: '📚',
    children: [
      { id: '1-1', title: 'Quick Start Guide' },
      { id: '1-2', title: 'Installation' },
    ],
  },
  {
    id: '2',
    title: 'Projects',
    icon: '🚀',
    children: [
      { id: '2-1', title: 'Project Alpha' },
      { id: '2-2', title: 'Project Beta' },
      {
        id: '2-3',
        title: 'Archive',
        children: [{ id: '2-3-1', title: 'Old Project' }],
      },
    ],
  },
  { id: '3', title: 'Notes', icon: '📝' },
  { id: '4', title: 'Resources', icon: '🔗' },
]

// Workspace icon colors
export const workspaceColors: Record<string, { from: string; to: string }> = {
  '1': { from: 'from-pink-500', to: 'to-rose-600' },
  '2': { from: 'from-fuchsia-500', to: 'to-pink-600' },
  '3': { from: 'from-rose-500', to: 'to-pink-500' },
}
