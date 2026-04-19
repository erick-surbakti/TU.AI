"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Compass
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

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Pathfinder",
    href: "/dashboard/setup",
    icon: Compass,
  },
  {
    title: "Scans",
    href: "/dashboard/disease-scan",
    icon: Sprout,
  },
  {
    title: "News",
    href: "/dashboard/news",
    icon: Newspaper,
  },
  {
    title: "Risk",
    href: "/dashboard/risk-intel",
    icon: ShieldAlert,
  },
  {
    title: "Copilot",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Suppliers",
    href: "/dashboard/suppliers",
    icon: MapPin,
  },
  {
    title: "Records",
    href: "/dashboard/records",
    icon: ClipboardList,
  },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)

  // Hydration safety: ensure component is mounted before rendering dynamic parts
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <SidebarProvider>
      {/* Desktop Sidebar */}
      <Sidebar collapsible="icon" className="hidden md:flex border-r border-sidebar-border bg-sidebar">
        <SidebarHeader className="h-20 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2 font-headline font-bold text-2xl text-sidebar-primary">
            <div className="h-8 w-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Sprout className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="group-data-[collapsible=icon]:hidden">TUAI</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-3 py-6">
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
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border/50">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-12 rounded-xl text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10">
                <Link href="/login">
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="pb-24 md:pb-0">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 md:px-6 border-b bg-white sticky top-0 z-30 shadow-sm md:shadow-none">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="hidden md:flex -ml-1 text-primary" />
            <div className="md:hidden flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Sprout className="h-5 w-5 text-white" />
              </div>
              <span className="font-headline font-bold text-xl text-primary">TUAI</span>
            </div>
            <div className="hidden md:block h-6 w-[1px] bg-slate-200 mx-4" />
            <h1 className="font-headline font-bold text-base md:text-lg text-slate-800 hidden sm:block">
              {navItems.find(item => item.href === pathname)?.title || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
             <div className="hidden xs:flex flex-col items-end leading-none">
               <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Region</span>
               <span className="text-xs md:text-sm font-bold text-slate-700">Selangor, MY</span>
             </div>
             <Button variant="ghost" size="icon" className="rounded-xl bg-slate-100 text-primary h-9 w-9">
               <User className="h-4 w-4 md:h-5 md:w-5" />
             </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 bg-slate-50/50 pb-32 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-xl border-t flex md:hidden z-50 px-1 pb-safe-area-inset-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
          {navItems.slice(0, 5).map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 transition-all relative",
                pathname === item.href ? "text-primary" : "text-slate-400"
              )}
            >
              {pathname === item.href && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-8 bg-primary rounded-b-full" />
              )}
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                pathname === item.href ? "bg-primary/10" : "bg-transparent"
              )}>
                <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-primary" : "text-slate-400")} />
              </div>
              <span className={cn("text-[9px] font-black uppercase tracking-tighter transition-opacity", pathname === item.href ? "opacity-100" : "opacity-60")}>
                {item.title}
              </span>
            </Link>
          ))}
          <Link 
            href="/dashboard/records"
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 transition-all relative",
              pathname === "/dashboard/records" ? "text-primary" : "text-slate-400"
            )}
          >
            {pathname === "/dashboard/records" && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-8 bg-primary rounded-b-full" />
            )}
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300",
              pathname === "/dashboard/records" ? "bg-primary/10" : "bg-transparent"
            )}>
              <ClipboardList className={cn("h-5 w-5", pathname === "/dashboard/records" ? "text-primary" : "text-slate-400")} />
            </div>
            <span className={cn("text-[9px] font-black uppercase tracking-tighter transition-opacity", pathname === "/dashboard/records" ? "opacity-100" : "opacity-60")}>
              Records
            </span>
          </Link>
        </nav>
      </SidebarInset>
    </SidebarProvider>
  )
}
