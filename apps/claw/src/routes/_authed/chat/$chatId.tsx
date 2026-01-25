import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/chat/$chatId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="flex h-full flex-col" />
}
