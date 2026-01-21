'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useRouter } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronsUpDown, Database, HelpCircle, LogOut, Settings, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { AuthUser } from '@/components/auth/definitions/types'
// import { ByokDialog } from '@/components/core/nav-dialogs/byok-dialog'
import { authClient } from '@/integrations/auth'

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
}

export function NavUser({ user }: { user: AuthUser | null }) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  // const [isByokDialogOpen, setIsByokDialogOpen] = useState(false)

  if (!user) return null

  // Use user.image as avatar, fallback to initials if not present
  const avatar = user.image || undefined
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <SidebarMenuButton
              size="lg"
              className="group relative w-full overflow-hidden data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              render={<DropdownMenuTrigger />}
            >
                {(isHovered || isOpen) && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                      duration: 1,
                      ease: 'linear',
                    }}
                  />
                )}
                <motion.div
                  className="relative z-10 flex w-full items-center gap-2"
                  animate={{
                    scale: isHovered || isOpen ? 1.02 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 rounded-lg ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/50">
                      <AvatarImage src={avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg bg-primary/10 font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <AnimatePresence>
                      {(isHovered || isOpen) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="absolute -right-1 -top-1 rounded-full bg-background p-0.5"
                        >
                          <Sparkles className="h-3 w-3 text-primary" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground/70">{user.email}</span>
                  </div>
                  <motion.div
                    animate={{
                      rotate: isOpen ? 180 : 0,
                      scale: isHovered ? 1.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <ChevronsUpDown className="ml-auto size-4" />
                  </motion.div>
                </motion.div>
            </SidebarMenuButton>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border-border/50 bg-popover/95 p-2 backdrop-blur-sm"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={8}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <motion.div
                    className="relative flex items-center gap-2 overflow-hidden rounded-md bg-primary/5 p-2 text-left text-sm"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar className="h-8 w-8 rounded-lg ring-2 ring-primary/20">
                      <AvatarImage src={avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg bg-primary/10 font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground/70">{user.email}</span>
                    </div>
                  </motion.div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-2 opacity-50" />
              <DropdownMenuGroup>
                {/* Account removed - now accessible via Settings page */}
                <motion.div
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                >
                  <DropdownMenuItem
                    className="group relative cursor-pointer gap-2 rounded-md p-2 text-sm"
                    onClick={() => {
                      setIsOpen(false)
                      router.navigate({ to: '/settings' })
                    }}
                  >
                    <Settings className="size-4 transition-all duration-300 group-hover:rotate-90" />
                    Settings
                    <span className="absolute right-2 opacity-0 transition-opacity group-hover:opacity-100">
                      →
                    </span>
                  </DropdownMenuItem>
                </motion.div>
                {/* BYOK removed - now accessible via Settings page */}
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-2 opacity-50" />
              <DropdownMenuGroup>
                <motion.div
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={3}
                >
                  <DropdownMenuItem className="group relative cursor-pointer gap-2 rounded-md p-2 text-sm">
                    <Database className="size-4 transition-transform duration-300 group-hover:scale-110" />
                    Data Export
                    <span className="absolute right-2 opacity-0 transition-opacity group-hover:opacity-100">
                      →
                    </span>
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-2 opacity-50" />
              <DropdownMenuGroup>
                <motion.div
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={4}
                >
                  <DropdownMenuItem
                    className="group relative cursor-pointer gap-2 rounded-md p-2 text-sm"
                    onClick={() => {
                      window.open('https://github.com/Valkyrie-Resistance/netko', '_blank')
                    }}
                  >
                    <HelpCircle className="size-4 transition-transform duration-300 group-hover:scale-110" />
                    Help & Support
                    <span className="absolute right-2 opacity-0 transition-opacity group-hover:opacity-100">
                      →
                    </span>
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuGroup>
              <motion.div variants={menuItemVariants} initial="hidden" animate="visible" custom={5}>
                <DropdownMenuItem
                  className="group relative mt-2 cursor-pointer gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive hover:bg-destructive/20"
                  onClick={() => {
                    authClient.signOut()
                  }}
                >
                  <LogOut className="size-4 transition-transform duration-300 group-hover:scale-110" />
                  Log out
                  <span className="absolute right-2 opacity-0 transition-opacity group-hover:opacity-100">
                    →
                  </span>
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      {/* <ByokDialog open={isByokDialogOpen} onOpenChange={setIsByokDialogOpen} /> */}
    </>
  )
}
