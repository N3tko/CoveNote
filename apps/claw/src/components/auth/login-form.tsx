import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { NetkoIcon } from '@/components/core/netko-icon'
import { BarsSpinner } from '@/components/core/spinner/bars-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { client } from '@/integrations/eden'
import { socialProviders } from './definitions/values'

export function LoginForm() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const { data: serverProviders, isLoading: isLoadingProviders } = useQuery({
    queryKey: ['social-providers'],
    queryFn: async () => {
      const response = await client.api.config['social-providers'].get()
      return response.data ?? []
    },
    staleTime: Number.POSITIVE_INFINITY,
  })

  // Filter providers based on what's enabled on the server
  const enabledProviders = serverProviders
    ? socialProviders.filter((p) =>
        serverProviders.some((sp) => sp.provider === p.provider && sp.enabled),
      )
    : []

  const getGridLayout = (count: number) => {
    if (count <= 2) return { grid: 'grid-cols-1', showText: true }
    if (count <= 4) return { grid: 'grid-cols-1 sm:grid-cols-2', showText: true }
    if (count <= 6) return { grid: 'grid-cols-1 sm:grid-cols-2', showText: false }
    return { grid: 'grid-cols-2 sm:grid-cols-3', showText: false }
  }

  const { grid, showText } = getGridLayout(enabledProviders.length)

  const handleProviderLogin = async (provider: (typeof socialProviders)[0]) => {
    setLoadingProvider(provider.provider)
    try {
      await provider.action()
    } catch (error) {
      console.error('Login failed:', error)
      setLoadingProvider(null)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 z-50">
      {/* Header */}
      <div className="text-center space-y-4">
        <NetkoIcon className="mx-auto flex tems-center justify-center h-32 w-32 dark:invert-1 invert" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Netko</h1>
          <p className="text-muted-foreground text-balance">
            Your overly confident AI conversation buddy
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Well, well, well...
          </CardTitle>
          <CardDescription className="text-base">
            Pick your poison—I mean, preferred login method
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Social Providers Grid */}
          {isLoadingProviders ? (
            <div className="flex items-center justify-center py-8">
              <BarsSpinner size={24} />
            </div>
          ) : enabledProviders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No login providers configured
            </div>
          ) : (
            <div className={`grid gap-3 ${grid}`}>
              {enabledProviders.map((provider) => {
                const Icon = provider.icon
                const isCurrentlyLoading = loadingProvider === provider.provider
                const isAnyLoading = loadingProvider !== null

                return (
                  <Button
                    key={provider.provider}
                    variant="outline"
                    size={showText ? 'default' : 'default'}
                    className={`h-12 transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${
                      showText ? 'justify-start' : 'justify-center'
                    }`}
                    onClick={() => handleProviderLogin(provider)}
                    disabled={isAnyLoading}
                  >
                    {isCurrentlyLoading ? (
                      <BarsSpinner size={20} className={showText ? 'mr-3' : ''} />
                    ) : (
                      <Icon className={`h-5 w-5 ${showText ? 'mr-3' : ''}`} />
                    )}

                    {showText && !isCurrentlyLoading && (
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{provider.name}</span>
                        {enabledProviders.length <= 2 && (
                          <span className="text-xs text-muted-foreground">
                            {provider.description}
                          </span>
                        )}
                      </div>
                    )}

                    {showText && isCurrentlyLoading && (
                      <span className="font-medium">Signing in...</span>
                    )}
                  </Button>
                )
              })}
            </div>
          )}

          <Separator />

          {/* Self-host info */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Want to run your own lab?{' '}
              <a
                href="https://github.com/Valkyrie-Resistance/netko"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Self-host this bad boy
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attribution below card */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground/80">
          Made with questionable life choices by{' '}
          <a
            href="https://github.com/Valkyrie-Resistance"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            @Valkyrie-Resistance
          </a>
        </p>
      </div>
    </div>
  )
}
