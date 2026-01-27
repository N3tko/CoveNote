import type { IconProps } from '@tabler/icons-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

export interface ChatInterfaceProps {
  chatId: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface Suggestion {
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>
  title: string
  description: string
}
