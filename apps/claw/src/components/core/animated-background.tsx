import * as React from 'react'
import { cn } from '../../lib/utils'

export function AnimatedBackground({
  className,
  durationMs = 5000,
  fadeOutMs = 400,
}: {
  className?: string
  durationMs?: number
  fadeOutMs?: number
}) {
  const [isAnimating, setIsAnimating] = React.useState(true)

  React.useEffect(() => {
    const stopTimer = window.setTimeout(() => {
      setIsAnimating(false)
    }, durationMs)

    return () => {
      window.clearTimeout(stopTimer)
    }
  }, [durationMs])

  const particles = React.useMemo(
    () =>
      [...Array(10)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'absolute w-2 h-2 bg-gradient-to-r from-primary/40 to-purple-500/40 dark:from-primary/20 dark:to-purple-500/20 rounded-full shadow-lg animate-pulse',
          )}
          style={{
            left: `${10 + i * 8}%`,
            top: `${20 + (i % 5) * 15}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${3 + i * 0.3}s`,
            animationPlayState: isAnimating ? 'running' : 'paused',
            willChange: 'transform, opacity',
          }}
        />
      )),
    [isAnimating],
  )

  const shapes = React.useMemo(
    () =>
      [...Array(6)].map((_, i) => (
        <div
          key={`shape-${i}`}
          className={cn(
            'absolute w-3 h-3 border border-primary/30 dark:border-primary/20 rotate-45 animate-bounce',
          )}
          style={{
            right: `${10 + i * 12}%`,
            top: `${25 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${3.5 + i * 0.2}s`,
            animationPlayState: isAnimating ? 'running' : 'paused',
            willChange: 'transform',
          }}
        />
      )),
    [isAnimating],
  )

  const sparkles = React.useMemo(
    () =>
      [...Array(6)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className={cn(
            'absolute text-yellow-400/60 dark:text-yellow-400/40 text-xl animate-bounce',
          )}
          style={{
            right: `${5 + i * 15}%`,
            top: `${30 + (i % 4) * 12}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2 + i * 0.3}s`,
            animationPlayState: isAnimating ? 'running' : 'paused',
            willChange: 'transform, opacity',
          }}
        >
          ✨
        </div>
      )),
    [isAnimating],
  )

  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
      {particles}
      {shapes}
      {sparkles}
    </div>
  )
}
