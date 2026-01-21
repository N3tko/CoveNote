// Settings route
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
// import { Separator } from '@/components/ui/separator'
import {
  BadgeCheck,
  BarChart3,
  ChevronLeft,
  Cpu,
  Key,
  LogOut,
  Monitor,
  Palette,
  Paperclip,
  SlidersHorizontal,
  Sparkles,
  User,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { ModelsForm } from '@/components/settings/models-form'
import { ProvidersForm } from '@/components/settings/providers-form'
import { authClient } from '@/integrations/auth'

export const Route = createFileRoute('/_authed/settings/')({
  component: SettingsPage,
})

type SettingsSection =
  | 'profile'
  | 'providers'
  | 'models'
  | 'ai-options'
  | 'customization'
  | 'usage'
  | 'attachments'
  | 'appearance'

const navItems: { key: SettingsSection; label: string; icon: React.ElementType }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'providers', label: 'Providers', icon: Key },
  { key: 'models', label: 'Models', icon: Cpu },
  { key: 'ai-options', label: 'AI Options', icon: SlidersHorizontal },
  { key: 'customization', label: 'Customization', icon: Sparkles },
  { key: 'usage', label: 'Usage Analytics', icon: BarChart3 },
  { key: 'attachments', label: 'Attachments', icon: Paperclip },
  { key: 'appearance', label: 'Appearance', icon: Palette },
]

//

function SettingsPage() {
  const navigate = useNavigate()
  const { data } = authClient.useSession()
  const user = data?.user
  const session = data?.session
  const [active, setActive] = useState<SettingsSection>('profile')

  // Sessions
  const {
    data: listedSessions = [],
    refetch: refetchSessions,
    isLoading: isSessionsLoading,
  } = useQuery({
    queryKey: ['auth-sessions'],
    queryFn: async () => {
      const result = await authClient.listSessions()
      // Normalize to array in case the client returns a wrapped object
      if (Array.isArray(result)) return result
      // @ts-expect-error - handle potential shapes: { sessions: [...] } or { data: [...] }
      if (result && Array.isArray(result.sessions)) return result.sessions
      if (result && Array.isArray(result.data)) return result.data
      return []
    },
  })
  //

  // --- Active Sessions helpers ---
  const getClientInfo = (userAgent?: string | null) => {
    const ua = (userAgent || '').toLowerCase()
    const isFirefox = ua.includes('firefox')
    const isChrome = ua.includes('chrome') && !ua.includes('edg') && !ua.includes('chromium')
    const isEdge = ua.includes('edg')
    const isSafari = ua.includes('safari') && !ua.includes('chrome')
    const browser = isFirefox
      ? 'Firefox'
      : isEdge
        ? 'Edge'
        : isChrome
          ? 'Chrome'
          : isSafari
            ? 'Safari'
            : 'Browser'

    const isMac = ua.includes('mac os') || ua.includes('macintosh')
    const isWin = ua.includes('windows')
    const isLinux = ua.includes('linux') && !ua.includes('android')
    const os = isMac ? 'macOS' : isWin ? 'Windows' : isLinux ? 'Linux' : 'Desktop'

    return { browser, os }
  }

  const revokeSessionMutation = useMutation({
    mutationFn: async (token: string) => authClient.revokeSession({ token }),
    onSuccess: () => refetchSessions(),
  })
  const revokeOthersMutation = useMutation({
    mutationFn: async () => authClient.revokeOtherSessions(),
    onSuccess: () => refetchSessions(),
  })
  const revokeAllMutation = useMutation({
    mutationFn: async () => authClient.revokeSessions(),
    onSuccess: () => refetchSessions(),
  })

  type ListedSession = {
    id: string
    token: string
    userAgent?: string | null
    ipAddress?: string | null
    updatedAt?: Date | null
    expiresAt?: Date | null
  }

  const activeSessions = useMemo(() => {
    const currentToken = session?.token
    const normalized: ListedSession[] = Array.isArray(listedSessions)
      ? (listedSessions as ListedSession[])
      : ([] as ListedSession[])

    return normalized.map((s) => ({
      id: s.id,
      token: s.token,
      userAgent: s.userAgent ?? null,
      ip: s.ipAddress ?? null,
      updatedAt: s.updatedAt,
      expiresAt: s.expiresAt,
      isCurrent: currentToken ? s.token === currentToken : false,
    }))
  }, [listedSessions, session?.token])

  //

  return (
    <div className="relative flex w-full h-full p-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex items-center">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/chat' })}
            className="gap-2 rounded-full border-border/60 bg-background/60 backdrop-blur-sm hover:bg-accent/40"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your account preferences and configuration.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left nav */}
          <aside className="col-span-12 md:col-span-3">
            <Card className="border-border/50 bg-background/60 backdrop-blur-sm">
              <CardContent className="p-2">
                <ul className="space-y-1">
                  {navItems.map(({ key, label, icon: Icon }) => (
                    <li key={key}>
                      <motion.button
                        type="button"
                        onClick={() => setActive(key)}
                        className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                          active === key
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent text-foreground'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {Icon ? <Icon className="h-4 w-4" /> : null} {label}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>

          {/* Content */}
          <main className="col-span-12 md:col-span-9 space-y-4">
            {active === 'profile' && (
              <>
                <Card className="border-border/50 bg-background/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" /> Profile Information
                    </CardTitle>
                    <CardDescription>Your personal account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 rounded-md ring-2 ring-primary/20">
                        <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ''} />
                        <AvatarFallback className="rounded-md">
                          {user?.name?.[0] ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">Name</div>
                          <div className="font-medium">{user?.name ?? '—'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Email</div>
                          <div className="font-medium">{user?.email ?? '—'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">User ID</div>
                          <div className="font-mono text-xs opacity-80 truncate max-w-[480px]">
                            {user?.id ?? '—'}
                          </div>
                        </div>
                      </div>
                      <div className="ml-auto">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <BadgeCheck className="h-4 w-4" /> Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-background/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" /> Active Sessions
                    </CardTitle>
                    <CardDescription>
                      Manage your active login sessions across devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-muted-foreground">
                        {isSessionsLoading
                          ? 'Loading sessions…'
                          : `${activeSessions.length} active session${activeSessions.length === 1 ? '' : 's'}`}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => revokeOthersMutation.mutate()}
                          disabled={activeSessions.length <= 1 || revokeOthersMutation.isPending}
                        >
                          Revoke others
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => revokeAllMutation.mutate()}
                          disabled={activeSessions.length === 0 || revokeAllMutation.isPending}
                        >
                          Revoke all
                        </Button>
                      </div>
                    </div>

                    {activeSessions.length === 0 && (
                      <div className="rounded-md border bg-muted/10 p-3 text-sm text-muted-foreground">
                        No active sessions.
                      </div>
                    )}

                    {activeSessions.map((s) => {
                      const info = getClientInfo(s.userAgent || undefined)
                      const lastSeen = s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '—'
                      return (
                        <div
                          key={s.id}
                          className="rounded-xl border bg-muted/10 p-3 md:p-4 flex items-start justify-between hover:bg-accent/10 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <Monitor className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium flex items-center gap-2">
                                {info.os} · {info.browser}
                                {s.isCurrent && (
                                  <Badge variant="outline" className="bg-background/40">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Last seen: {lastSeen}
                                {s.ip ? ` · IP: ${s.ip}` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {s.isCurrent ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                                onClick={() => authClient.signOut()}
                              >
                                <LogOut className="h-4 w-4" /> Sign Out
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => revokeSessionMutation.mutate(s.token)}
                                disabled={revokeSessionMutation.isPending}
                              >
                                {revokeSessionMutation.isPending ? 'Revoking…' : 'Revoke'}
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </>
            )}

            {active === 'models' && <ModelsForm />}

            {active === 'providers' && <ProvidersForm />}

            {active !== 'profile' && active !== 'providers' && active !== 'models' && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Coming soon</CardTitle>
                  <CardDescription>Nothing to see here yet—stay tuned.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We’re still wiring up this section.
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
