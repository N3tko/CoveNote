'use client'

import { IconSparkles } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { BarsSpinner } from '@/components/core/spinner/bars-spinner'
import { Button } from '@/components/ui/button'
import { client } from '@/integrations/eden'
import {
  containerVariants,
  itemVariants,
  logoVariants,
  socialProviders,
} from './definitions/values'

// Floating particle component
function FloatingParticle({
  delay,
  duration,
  x,
  y,
  size,
}: {
  delay: number
  duration: number
  x: number
  y: number
  size: number
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-gradient-to-br from-amber-300/40 to-orange-400/20 blur-sm"
      style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.3, 0.7, 0.3],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      }}
    />
  )
}

// Animated background with warm gradient
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-amber-200/30 to-orange-300/20 blur-3xl dark:from-amber-900/20 dark:to-orange-900/10"
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-rose-200/30 to-amber-200/20 blur-3xl dark:from-rose-950/20 dark:to-amber-950/10"
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      {/* Floating particles */}
      <FloatingParticle delay={0} duration={4} x={15} y={20} size={8} />
      <FloatingParticle delay={0.5} duration={5} x={80} y={15} size={6} />
      <FloatingParticle delay={1} duration={4.5} x={25} y={70} size={10} />
      <FloatingParticle delay={1.5} duration={6} x={70} y={60} size={7} />
      <FloatingParticle delay={2} duration={5.5} x={50} y={30} size={5} />
      <FloatingParticle delay={2.5} duration={4} x={90} y={80} size={8} />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

export function LoginForm() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null)

  const { data: serverProviders, isLoading: isLoadingProviders } = useQuery({
    queryKey: ['social-providers'],
    queryFn: async () => {
      const response = await client.api.config['social-providers'].get()
      return response.data ?? []
    },
    staleTime: Number.POSITIVE_INFINITY,
  })

  const enabledProviders = serverProviders
    ? socialProviders.filter((p) =>
        serverProviders.some((sp) => sp.provider === p.provider && sp.enabled),
      )
    : []

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
    <>
      <AnimatedBackground />

      <motion.div
        className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo and branding */}
        <motion.div className="mb-8 flex flex-col items-center" variants={itemVariants}>
          <motion.div
            className="relative mb-6"
            variants={logoVariants}
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 scale-150 blur-2xl">
              <div className="h-full w-full rounded-full bg-gradient-to-br from-amber-400/40 to-orange-500/30" />
            </div>
            <img
              src="/logo.png"
              alt="CoveNote"
              className="relative h-28 w-28 drop-shadow-xl sm:h-32 sm:w-32"
            />
          </motion.div>

          <motion.h1
            className="mb-2 bg-gradient-to-br from-neutral-900 via-neutral-700 to-neutral-800 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-neutral-100 dark:via-neutral-300 dark:to-neutral-200 sm:text-5xl"
            variants={itemVariants}
          >
            CoveNote
          </motion.h1>

          <motion.p
            className="flex items-center gap-2 text-center text-base text-neutral-600 dark:text-neutral-400"
            variants={itemVariants}
          >
            <IconSparkles className="size-4 text-amber-500" />
            <span>AI-powered notes, effortlessly organized</span>
            <IconSparkles className="size-4 text-amber-500" />
          </motion.p>
        </motion.div>

        {/* Login card with glassmorphism */}
        <motion.div className="w-full max-w-sm" variants={itemVariants}>
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/70 sm:p-8">
            {/* Subtle inner glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-100/20 via-transparent to-rose-100/20 dark:from-amber-900/10 dark:to-rose-900/10" />

            <div className="relative">
              <motion.div className="mb-6 text-center" variants={itemVariants}>
                <h2 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Welcome back
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Sign in to continue to your notes
                </p>
              </motion.div>

              {/* Social providers */}
              {isLoadingProviders ? (
                <div className="flex items-center justify-center py-8">
                  <BarsSpinner size={24} />
                </div>
              ) : enabledProviders.length === 0 ? (
                <div className="py-8 text-center text-neutral-500">
                  No login providers configured
                </div>
              ) : (
                <motion.div
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {enabledProviders.map((provider, index) => {
                    const Icon = provider.icon
                    const isCurrentlyLoading = loadingProvider === provider.provider
                    const isAnyLoading = loadingProvider !== null
                    const isHovered = hoveredProvider === provider.provider

                    return (
                      <motion.div key={provider.provider} variants={itemVariants} custom={index}>
                        <Button
                          variant="outline"
                          className="group relative h-12 w-full justify-start gap-3 overflow-hidden border-neutral-200/80 bg-white/50 px-4 transition-all duration-300 hover:border-amber-300/50 hover:bg-amber-50/50 dark:border-neutral-700/80 dark:bg-neutral-800/50 dark:hover:border-amber-700/50 dark:hover:bg-amber-950/30"
                          onClick={() => handleProviderLogin(provider)}
                          onMouseEnter={() => setHoveredProvider(provider.provider)}
                          onMouseLeave={() => setHoveredProvider(null)}
                          disabled={isAnyLoading}
                        >
                          {/* Hover gradient effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-amber-100/0 via-amber-100/50 to-amber-100/0 dark:from-amber-900/0 dark:via-amber-900/30 dark:to-amber-900/0"
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{
                              x: isHovered ? '100%' : '-100%',
                              opacity: isHovered ? 1 : 0,
                            }}
                            transition={{ duration: 0.5 }}
                          />

                          <span className="relative flex items-center gap-3">
                            {isCurrentlyLoading ? (
                              <BarsSpinner size={20} />
                            ) : (
                              <Icon className="size-5 transition-transform duration-300 group-hover:scale-110" />
                            )}
                            <span className="font-medium">
                              {isCurrentlyLoading
                                ? 'Signing in...'
                                : `Continue with ${provider.name}`}
                            </span>
                          </span>
                        </Button>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}

              {/* Divider */}
              <motion.div className="my-6 flex items-center gap-3" variants={itemVariants}>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
                <span className="text-xs text-neutral-400">or</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
              </motion.div>

              {/* Self-host link */}
              <motion.p
                className="text-center text-sm text-neutral-500 dark:text-neutral-400"
                variants={itemVariants}
              >
                Want to self-host?{' '}
                <a
                  href="https://github.com/Valkyrie-Resistance/covenote"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-600 underline-offset-4 transition-colors hover:text-amber-700 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
                >
                  View on GitHub
                </a>
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer className="mt-8 text-center" variants={itemVariants}>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Crafted by{' '}
            <a
              href="https://github.com/Valkyrie-Resistance"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors hover:text-amber-600 dark:hover:text-amber-400"
            >
              @Valkyrie-Resistance
            </a>
          </p>
        </motion.footer>
      </motion.div>
    </>
  )
}
