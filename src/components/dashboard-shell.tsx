
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  Sprout, 
  ShieldAlert, 
  MessageSquare, 
  MapPin, 
  ClipboardList, 
  LayoutDashboard,
  LogOut,
  User,
  Newspaper,
  Compass,
  Settings,
  Mic,
  Smile
} from "lucide-react"
import { useEasyMode } from "@/components/easy-mode-provider"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { createClient } from "@/supabase/client"

const navItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Pathfinder", href: "/dashboard/setup", icon: Compass },
  { title: "Scans", href: "/dashboard/disease-scan", icon: Sprout },
  { title: "News", href: "/dashboard/news", icon: Newspaper },
  { title: "Risk", href: "/dashboard/risk-intel", icon: ShieldAlert },
  { title: "Copilot", href: "/dashboard/chat", icon: MessageSquare },
  { title: "Suppliers", href: "/dashboard/suppliers", icon: MapPin },
  { title: "Records", href: "/dashboard/records", icon: ClipboardList },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = React.useState<any>(null)
  const [isUserLoading, setIsUserLoading] = React.useState(true)
  const [mounted, setMounted] = React.useState(false)

  const { isEasyMode, isLoading: isPrefsLoading } = useEasyMode()

  React.useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsUserLoading(false)
    })
  }, [])

  React.useEffect(() => {
    if (mounted && !isUserLoading && !user) {
      router.push("/login")
    }
  }, [mounted, user, isUserLoading, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (!mounted || isUserLoading || isPrefsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Sprout className="h-10 w-10 text-primary animate-bounce" />
      </div>
    )
  }

  const filteredNavItems = isEasyMode 
    ? navItems.filter(item => !["Pathfinder", "Risk", "Suppliers"].includes(item.title))
    : navItems;

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="border-r bg-sidebar no-scrollbar">
        <SidebarHeader className={cn("flex items-center px-6 transition-all", isEasyMode ? "h-24" : "h-20")}>
          <Link href="/" className="flex items-center gap-3 font-headline font-bold text-2xl text-sidebar-primary group">
            <div className={cn("bg-sidebar-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-12 transition-all", isEasyMode ? "h-14 w-14" : "h-10 w-10")}>
              <Sprout className={cn("text-sidebar-primary-foreground transition-all", isEasyMode ? "h-8 w-8" : "h-6 w-6")} />
            </div>
            <span className={cn("group-data-[collapsible=icon]:hidden tracking-tighter uppercase font-black transition-all", isEasyMode ? "text-2xl" : "text-lg")}>TUAI</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-3 py-6 no-scrollbar">
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.href} className="mb-1">
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.title}
                  className={cn(
                    "rounded-xl transition-all duration-200 px-4",
                    isEasyMode ? "h-16" : "h-12",
                    pathname === item.href 
                      ? "bg-sidebar-accent text-sidebar-primary shadow-sm" 
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <Link href={item.href} className="items-center">
                    <item.icon className={cn("transition-all", isEasyMode ? "h-7 w-7 mr-3" : "h-5 w-5 mr-1.5", pathname === item.href ? "text-sidebar-primary" : "text-sidebar-foreground/40")} />
                    <span className={cn("font-bold transition-all", isEasyMode ? "text-lg" : "text-sm")}>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border/30">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogout}
                className={cn("rounded-xl text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all", isEasyMode ? "h-16" : "h-12")}
              >
                <LogOut className={cn("transition-all", isEasyMode ? "h-7 w-7 mr-3" : "h-5 w-5 mr-1.5")} />
                <span className={cn("font-bold transition-all", isEasyMode ? "text-lg" : "text-sm")}>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="no-scrollbar relative">
        <header className={cn("flex shrink-0 items-center justify-between gap-1 px-4 md:px-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm transition-all", isEasyMode ? "h-20 sm:h-24" : "h-16")}>
          <div className="flex items-center gap-2 sm:gap-3">
            <SidebarTrigger className={cn("text-primary hover:bg-primary/5 rounded-xl transition-all", isEasyMode ? "h-12 w-12 sm:h-16 sm:w-16" : "h-10 w-10")} />
            <div className="flex items-center gap-2 sm:hidden">
              <span className={cn("font-headline font-bold text-primary tracking-tighter uppercase font-black transition-all", isEasyMode ? "text-xl sm:text-2xl" : "text-xl")}>TUAI</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
             <div className="flex flex-col items-end leading-none mr-2">
               <span className={cn("font-black text-muted-foreground uppercase tracking-widest mb-0.5 transition-all text-right", isEasyMode ? "text-[8px] sm:text-[11px]" : "text-[9px]")}>ASEAN</span>
               <span className={cn("font-bold text-slate-700 transition-all text-right line-clamp-1", isEasyMode ? "text-sm sm:text-lg" : "text-xs")}>Intelligence Node</span>
             </div>
             <div className={cn("rounded-xl bg-slate-100 flex items-center justify-center text-primary shadow-inner transition-all", isEasyMode ? "h-12 w-12 sm:h-16 sm:w-16" : "h-9 w-9")}>
               <User className={cn("transition-all", isEasyMode ? "h-8 w-8 sm:h-10 sm:w-10" : "h-5 w-5")}/>
             </div>
          </div>
        </header>

        <main className={cn("flex-1 bg-slate-50/50 min-h-[calc(100vh-4rem)] no-scrollbar transition-all", isEasyMode ? "p-4 sm:p-6 md:p-8" : "p-4 md:p-8")}>
          <div className={cn("mx-auto transition-all", isEasyMode ? "max-w-5xl" : "w-full")}>
            {children}
          </div>
        </main>

        {isEasyMode && (
          <Button 
            className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 h-20 w-20 sm:h-28 sm:w-28 rounded-full shadow-2xl bg-emerald-600 hover:bg-emerald-700 text-white z-[9999] animate-bounce flex flex-col items-center justify-center gap-0.5 sm:gap-1 border-4 border-white ring-4 ring-emerald-500/20"
            onClick={() => router.push('/dashboard/chat')}
          >
            <Mic className="h-8 w-8 sm:h-12 sm:w-12" />
            <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-tighter">Talk to AI</span>
          </Button>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
