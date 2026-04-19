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

const navItems = [
  {
    title: "Overview",
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
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="border-r border-sidebar-border bg-sidebar no-scrollbar">
        <SidebarHeader className="h-20 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2 font-headline font-bold text-2xl text-sidebar-primary">
            <div className="h-8 w-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Sprout className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="group-data-[collapsible=icon]:hidden">TUAI</span>
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

      <SidebarInset className="no-scrollbar">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 md:px-6 border-b bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-primary hover:bg-primary/5 rounded-xl h-10 w-10 border border-primary/20 shadow-sm" />
            <div className="flex items-center gap-2 sm:hidden">
              <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center">
                <Sprout className="h-4 w-4 text-white" />
              </div>
              <span className="font-headline font-bold text-lg text-primary">TUAI</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
             <div className="hidden sm:flex flex-col items-end leading-none mr-2">
               <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Region</span>
               <span className="text-xs md:text-sm font-bold text-slate-700">Selangor, MY</span>
             </div>
             <Button variant="ghost" size="icon" className="rounded-xl bg-slate-100 text-primary h-9 w-9">
               <User className="h-4 w-4 md:h-5 md:w-5" />
             </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 bg-slate-50/50 min-h-[calc(100vh-4rem)] no-scrollbar">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
