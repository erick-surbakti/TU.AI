"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Smile,
  ChevronDown,
  Edit2,
  Lock,
} from "lucide-react";
import { useEasyMode } from "@/components/easy-mode-provider";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/supabase/client";

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
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = React.useState<any>(null);
  const [isUserLoading, setIsUserLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [farmLocation, setFarmLocation] =
    React.useState<string>("Intelligence Node");
  const [isProfileLoading, setIsProfileLoading] = React.useState(false);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [editedName, setEditedName] = React.useState("");

  const { isEasyMode, isLoading: isPrefsLoading } = useEasyMode();

  React.useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);

      // Fetch user profile data from the users table
      if (user) {
        const { data: profile, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
          // Set farm location or use displayName as fallback
          const location = profile.farm_name || "Intelligence Node";
          const name = profile.displayName || user.email || "User";
          setFarmLocation(location);
          setEditedName(name);
        } else {
          // First time user - set defaults
          const name = user.email?.split("@")[0] || "User";
          setEditedName(name);
          setFarmLocation("Intelligence Node");
        }
      }
      setIsUserLoading(false);
    });
  }, []);

  React.useEffect(() => {
    if (mounted && !isUserLoading && !user) {
      router.push("/login");
    }
  }, [mounted, user, isUserLoading, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleProfileUpdate = async () => {
    setIsProfileLoading(true);
    try {
      // Update the users table with new displayName and farm_name
      const { error } = await supabase
        .from("users")
        .update({
          displayName: editedName,
          farm_name: farmLocation,
          lastLogin: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
        return;
      }

      // Update local state
      setUserProfile({
        ...userProfile,
        displayName: editedName,
        farm_name: farmLocation,
      });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  if (!mounted || isUserLoading || isPrefsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Sprout className="h-10 w-10 text-primary animate-bounce" />
      </div>
    );
  }

  const filteredNavItems = isEasyMode
    ? navItems.filter(
        (item) => !["Pathfinder", "Risk", "Suppliers"].includes(item.title),
      )
    : navItems;

  const displayUsername = editedName || user?.email || "User";
  const displayLocation = farmLocation || "ASEAN Intelligence Node";

  return (
    <SidebarProvider>
      <Sidebar
        side="left"
        collapsible="icon"
        className="border-r bg-sidebar no-scrollbar"
      >
        <SidebarHeader
          className={cn(
            "relative flex items-center px-6 border-b border-sidebar-border/20 bg-sidebar",
            isEasyMode ? "h-24" : "h-20",
          )}
        >
          {/* subtle divider glow */}
          <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-sidebar-primary/25 to-transparent" />

          <div className="w-full group-data-[collapsible=icon]:hidden select-none">
            <div className="flex flex-col leading-none">
              <span
                className={cn(
                  "text-sidebar-foreground font-semibold tracking-tight",
                  isEasyMode ? "text-2xl" : "text-lg",
                )}
              >
                Dashboard
              </span>

              <span className="mt-2 text-[10px] uppercase tracking-[0.38em] text-sidebar-foreground/35">
                Precision Agriculture
              </span>
            </div>
          </div>

          {/* collapsed mode */}
          <div className="hidden group-data-[collapsible=icon]:flex w-full justify-center">
            <span className="text-xs font-semibold tracking-[0.3em] text-sidebar-foreground/40">
              
            </span>
          </div>
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
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                  )}
                >
                  <Link href={item.href} className="items-center">
                    <item.icon
                      className={cn(
                        "transition-all",
                        isEasyMode ? "h-7 w-7 mr-3" : "h-5 w-5 mr-1.5",
                        pathname === item.href
                          ? "text-sidebar-primary"
                          : "text-sidebar-foreground/40",
                      )}
                    />
                    <span
                      className={cn(
                        "font-bold transition-all",
                        isEasyMode ? "text-lg" : "text-sm",
                      )}
                    >
                      {item.title}
                    </span>
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
                className={cn(
                  "rounded-xl text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all",
                  isEasyMode ? "h-16" : "h-12",
                )}
              >
                <LogOut
                  className={cn(
                    "transition-all",
                    isEasyMode ? "h-7 w-7 mr-3" : "h-5 w-5 mr-1.5",
                  )}
                />
                <span
                  className={cn(
                    "font-bold transition-all",
                    isEasyMode ? "text-lg" : "text-sm",
                  )}
                >
                  Logout
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="no-scrollbar relative">
        <header
          className={cn(
            "flex shrink-0 items-center justify-between gap-1 px-4 md:px-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm transition-all",
            isEasyMode ? "h-20 sm:h-24" : "h-16",
          )}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <SidebarTrigger
              className={cn(
                "text-primary hover:bg-primary/5 rounded-xl transition-all",
                isEasyMode ? "h-12 w-12 sm:h-16 sm:w-16" : "h-10 w-10",
              )}
            />
            <div className="flex items-center gap-2 sm:hidden">
              <span
                className={cn(
                  "font-headline font-bold text-primary tracking-tighter uppercase font-black transition-all",
                  isEasyMode ? "text-xl sm:text-2xl" : "text-xl",
                )}
              >
                TUAI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-end leading-none mr-2">
              <span
                className={cn(
                  "font-black text-muted-foreground uppercase tracking-widest mb-0.5 transition-all text-right",
                  isEasyMode ? "text-[8px] sm:text-[11px]" : "text-[9px]",
                )}
              >
                {displayLocation.toUpperCase().split(" ")[0] || "ASEAN"}
              </span>
              <span
                className={cn(
                  "font-bold text-slate-700 transition-all text-right line-clamp-1",
                  isEasyMode ? "text-sm sm:text-lg" : "text-xs",
                )}
              >
                {displayUsername}
              </span>
            </div>

            {/* Clickable Profile Icon with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "rounded-xl bg-slate-100 flex items-center justify-center text-primary shadow-inner transition-all hover:bg-slate-200 cursor-pointer hover:shadow-md group",
                    isEasyMode ? "h-12 w-12 sm:h-16 sm:w-16" : "h-9 w-9",
                  )}
                >
                  <User
                    className={cn(
                      "transition-all",
                      isEasyMode ? "h-8 w-8 sm:h-10 sm:w-10" : "h-5 w-5",
                    )}
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {/* Profile Info */}
                <div className="px-4 py-3 border-b">
                  <p className="font-semibold text-sm">{displayUsername}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {" "}
                    {displayLocation}
                  </p>
                </div>

                {/* Edit Profile Option */}
                {isEditingProfile ? (
                  <>
                    <div className="px-4 py-3 border-b space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="w-full mt-1 px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">
                          Farm/Location
                        </label>
                        <input
                          type="text"
                          value={farmLocation}
                          onChange={(e) => setFarmLocation(e.target.value)}
                          className="w-full mt-1 px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter farm name or location"
                        />
                      </div>
                    </div>
                    <div className="px-2 py-2 flex gap-2 border-b">
                      <Button
                        size="sm"
                        onClick={handleProfileUpdate}
                        disabled={isProfileLoading}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        {isProfileLoading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={() => setIsEditingProfile(true)}
                    className="cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                )}

                {/* Settings */}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                {/* Change Password */}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard/change-password">
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main
          className={cn(
            "flex-1 bg-slate-50/50 min-h-[calc(100vh-4rem)] no-scrollbar transition-all",
            isEasyMode ? "p-4 sm:p-6 md:p-8" : "p-4 md:p-8",
          )}
        >
          <div
            className={cn(
              "mx-auto transition-all",
              isEasyMode ? "max-w-5xl" : "w-full",
            )}
          >
            {children}
          </div>
        </main>

        {isEasyMode && (
          <Button
            className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 h-20 w-20 sm:h-28 sm:w-28 rounded-full shadow-2xl bg-emerald-600 hover:bg-emerald-700 text-white z-[9999] animate-bounce flex flex-col items-center justify-center gap-0.5 sm:gap-1 border-4 border-white ring-4 ring-emerald-500/20"
            onClick={() => router.push("/dashboard/chat")}
          >
            <Mic className="h-8 w-8 sm:h-12 sm:w-12" />
            <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-tighter">
              Talk to AI
            </span>
          </Button>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
