import { NetkoIcon } from '@netko/ui/components/core/netko-icon'
import { Button } from '@netko/ui/components/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@netko/ui/components/shadcn/card'
import { Separator } from '@radix-ui/react-separator'
import { useState } from 'react'
import { BarsSpinner } from '@/components/core/spinner/bars-spinner'
import { useAuthMethods } from '@/hooks/api'
import { socialProviders } from './definitions/values'

/**
 * Login Form
 *
 * The gateway to our chat kingdom.
 * Pick your poison—I mean, login method. 😏🐱
 */

// Skeleton loader component for social providers
function ProvidersLoader() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3">
        <div className="h-12 bg-muted rounded-md animate-pulse flex items-center justify-center">
          <BarsSpinner size={20} className="text-muted-foreground" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Summoning your login options... 🪄</p>
      </div>
    </div>
  )
}

export function LoginForm() {
  const { data: providers, isLoading } = useAuthMethods()
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const enabledProviders = socialProviders.filter((provider) =>
    providers?.includes(provider.provider),
  )

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
            Pick your poison—I mean, preferred login method 😏
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Show loader while fetching providers */}
          {isLoading ? (
            <ProvidersLoader />
          ) : (
            <>
              {/* Social Providers Grid */}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Attribution below card */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground/80">
          Made with 💜 and questionable life choices by{' '}
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
