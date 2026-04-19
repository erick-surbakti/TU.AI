
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
  Settings
} from "lucide-react"

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
import { useAuth, useUser } from "@/firebase"
import { signOut } from "firebase/auth"

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
  const auth = useAuth()
  const { user, isUserLoading } = useUser()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (mounted && !isUserLoading && !user) {
      router.push("/login")
    }
  }, [mounted, user, isUserLoading, router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  if (!mounted || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Sprout className="h-10 w-10 text-primary animate-bounce" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="border-r bg-sidebar no-scrollbar">
        <SidebarHeader className="h-20 flex items-center px-6">
          <Link href="/" className="flex items-center gap-3 font-headline font-bold text-2xl text-sidebar-primary group">
            <div className="h-10 w-10 bg-sidebar-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-12 transition-transform">
              <Sprout className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <span className="group-data-[collapsible=icon]:hidden tracking-tighter">TUAI</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-3 py-6 no-scrollbar">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href} className="mb-1">
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.title}
                  className={cn(
                    "h-12 rounded-xl transition-all duration-200 px-4",
                    pathname === item.href 
                      ? "bg-sidebar-accent text-sidebar-primary shadow-sm" 
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-sidebar-primary" : "text-sidebar-foreground/40")} />
                    <span className="font-bold">{item.title}</span>
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
                className="h-12 rounded-xl text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-bold">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="no-scrollbar">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 md:px-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-primary hover:bg-primary/5 rounded-xl h-10 w-10" />
            <div className="flex items-center gap-2 sm:hidden">
              <span className="font-headline font-bold text-xl text-primary tracking-tighter">TUAI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end leading-none mr-2">
               <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">ASEAN</span>
               <span className="text-xs font-bold text-slate-700">Intelligence Node</span>
             </div>
             <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-primary shadow-inner">
               <User className="h-5 w-5" />
             </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 bg-slate-50/50 min-h-[calc(100vh-4rem)] no-scrollbar">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
