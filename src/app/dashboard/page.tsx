"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Sprout,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Newspaper,
  Compass,
  Smile,
  Globe,
  Plus,
  Sparkles,
  MapPin,
  MessageSquare,
  Activity
} from "lucide-react"
import { ASEAN_COUNTRIES } from "@/lib/localization"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useEasyMode } from "@/components/easy-mode-provider"
import { createClient } from "@/supabase/client"
import { LocalRadar } from "@/components/local-radar-component"
import { CropPerformance } from "@/components/crop-performance-component"
import { ActivityLog } from "@/components/activity-log-component"
import * as React from "react"

export default function DashboardPage() {
  const { isEasyMode, ageGroup, birthDate } = useEasyMode()
  const [userName, setUserName] = React.useState("Farmer")
  const [countryCode, setCountryCode] = React.useState("MY")
  const [apiKey, setApiKey] = React.useState("")
  const supabase = createClient()

  React.useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const metadataName =
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name

        if (typeof metadataName === 'string' && metadataName.trim()) {
          setUserName(metadataName.split(' ')[0])
        }

        const { data: profile } = await supabase
          .from('users')
          .select('displayName, countryCode, geminiApiKey')
          .eq('id', user.id)
          .single()

        if (profile?.displayName && (!metadataName || !String(metadataName).trim())) {
          setUserName(profile.displayName.split(' ')[0])
        }
        if (profile?.countryCode) setCountryCode(profile.countryCode)
        if (profile?.geminiApiKey) setApiKey(profile.geminiApiKey)
      }
    }
    init()
  }, [])

  const isBirthday = React.useMemo(() => {
    if (!birthDate) return false
    const today = new Date()
    const birth = new Date(birthDate)
    return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate()
  }, [birthDate])

  const getGreeting = () => {
    const hour = new Date().getHours()
    const greetings: Record<string, { morning: string; afternoon: string; evening: string }> = {
      BN: { morning: "Selamat Pagi", afternoon: "Selamat Petang", evening: "Selamat Malam" },
      KH: { morning: "Arun Soursdey", afternoon: "Tivea Soursdey", evening: "Sayoan Soursdey" },
      ID: { morning: "Selamat Pagi", afternoon: "Selamat Siang", evening: "Selamat Malam" },
      LA: { morning: "Sabaidee", afternoon: "Sabaidee", evening: "Sabaidee" },
      MY: { morning: "Selamat Pagi", afternoon: "Selamat Tengah Hari", evening: "Selamat Malam" },
      MM: { morning: "Mingalarba", afternoon: "Mingalarba", evening: "Mingalarba" },
      PH: { morning: "Magandang Umaga", afternoon: "Magandang Hapon", evening: "Magandang Gabi" },
      SG: { morning: "Good Morning", afternoon: "Good Afternoon", evening: "Good Evening" },
      TH: { morning: "Sawatdee Krab/Ka", afternoon: "Sawatdee Krab/Ka", evening: "Sawatdee Krab/Ka" },
      VN: { morning: "Chào buổi sáng", afternoon: "Chào buổi chiều", evening: "Chào buổi tối" },
    }

    const countryGreeting = greetings[countryCode] || greetings["MY"]
    if (hour < 12) return countryGreeting.morning
    if (hour < 18) return countryGreeting.afternoon
    return countryGreeting.evening
  }

  const getAgeAdaptiveMessage = () => {
    if (isEasyMode) {
      return "Everything looks good today. Rain expected tomorrow. Apply fertilizer today before 5 PM."
    }

    switch (ageGroup) {
      case "Young Farmer":
        return "Your fields are currently operating at peak high-performance specs. We’ve analyzed the soil telemetry and crop vigor—it’s time to push the envelope. Let’s leverage the AI Pathfinder to identify high-yield opportunities and maximize your production ceiling today.";

      case "Mid Career":
        return "Optimization is the priority for this cycle. We’ve streamlined your operational data into a high-density report, pinpointing exactly where we can tighten margins and boost efficiency. Your strategic optimization suite is fully synchronized and ready for your perusal.";

      case "Senior Active":
        return "Steady, sustainable growth has been detected across all synchronized plots. There is a powerful synergy at work here: your decades of traditional field wisdom combined with our predictive AI modeling is consistently winning the season. Your legacy is being backed by data.";

      default:
        return "Full-spectrum field monitoring is active and nominal. Every hectare is being scanned for real-time performance metrics—your comprehensive AI insights and predictive trend analyses are synchronized and ready for deployment.";
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 px-4 sm:px-6 lg:px-8">
      {/* WELCOME SECTION - Mobile First */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="lg:col-span-2 flex flex-col justify-between p-6 sm:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[3rem] bg-primary text-white shadow-lg sm:shadow-2xl shadow-primary/20 overflow-hidden relative group min-h-[280px] sm:min-h-[320px] lg:min-h-[300px]">
          <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-5 sm:opacity-10 group-hover:scale-110 transition-transform">
            {isBirthday ? (
              <Sparkles className="h-32 sm:h-40 lg:h-48 w-32 sm:w-40 lg:w-48 text-yellow-300" />
            ) : (
              <Sprout className="h-32 sm:h-40 lg:h-48 w-32 sm:w-40 lg:w-48" />
            )}
          </div>

          <div className="relative z-10 space-y-3 sm:space-y-4">
            {isBirthday && (
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-yellow-400 text-primary-foreground font-black text-[10px] sm:text-xs uppercase tracking-widest animate-bounce">
                <Smile className="h-3 w-3 sm:h-4 sm:w-4" /> It's your birthday!
              </div>
            )}
            <h2 className={cn(
              "font-headline font-bold leading-tight transition-all",
              isEasyMode
                ? "text-3xl sm:text-4xl lg:text-5xl"
                : "text-2xl sm:text-3xl lg:text-4xl"
            )}>
              {isBirthday ? `Happy Birthday, ${userName}!` : `${getGreeting()}, ${userName}!`}
            </h2>
            <p className={cn(
              "text-primary-foreground/85 max-w-[500px] font-medium transition-all",
              isEasyMode ? "text-base sm:text-lg" : "text-sm sm:text-base"
            )}>
              {getAgeAdaptiveMessage()}
            </p>
          </div>

          {/* Action Buttons - Stack on mobile, row on tablet+ */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 relative z-10">
            <Link href="/dashboard/setup" className="flex-1 sm:flex-none">
              <Button
                size="lg"
                className={cn(
                  "w-full bg-white text-primary hover:bg-white/90 rounded-xl sm:rounded-2xl font-bold px-6 sm:px-8 shadow-lg sm:shadow-xl transition-all",
                  isEasyMode ? "h-16 sm:h-20 text-lg sm:text-2xl" : "h-12 sm:h-14 text-base"
                )}
              >
                <Compass className={cn("mr-2", isEasyMode ? "h-5 sm:h-7 w-5 sm:w-7" : "h-4 sm:h-5 w-4 sm:w-5")} />
                <span className="hidden sm:inline">{isEasyMode ? "Simple Guide" : "AI Pathfinder"}</span>
                <span className="sm:hidden">{isEasyMode ? "Guide" : "Pathfinder"}</span>
              </Button>
            </Link>
            <Link href="/dashboard/disease-scan" className="flex-1 sm:flex-none">
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "w-full border-white/20 bg-white/10 text-white hover:bg-white/20 rounded-xl sm:rounded-2xl font-bold px-6 sm:px-8 backdrop-blur-sm transition-all",
                  isEasyMode ? "h-16 sm:h-20 text-lg sm:text-2xl" : "h-12 sm:h-14 text-base"
                )}
              >
                <Plus className={cn("mr-2", isEasyMode ? "h-5 sm:h-7 w-5 sm:w-7" : "h-4 sm:h-5 w-4 sm:w-5")} />
                <span className="hidden sm:inline">{isEasyMode ? "Check Plants" : "New Diagnosis"}</span>
                <span className="sm:hidden">{isEasyMode ? "Check" : "Scan"}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Local Radar - Hidden on mobile, visible on lg */}
        <div className="hidden lg:block">
          <LocalRadar countryCode={countryCode} apiKey={apiKey} />
        </div>
      </div>

      {/* ALERTS SECTION - Responsive Grid */}
      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { icon: Compass, title: "Farmer Pathfinder", color: "primary", desc: `Personalized blueprint for ${ASEAN_COUNTRIES[countryCode]?.name || 'local'} terrain.`, link: "/dashboard/setup", label: "New Path" },
          { icon: ShieldAlert, title: "Policy Risk", color: "destructive", desc: `New trade update for ${ASEAN_COUNTRIES[countryCode]?.name || 'the region'}.`, link: "/dashboard/risk-intel", label: "Risk" },
          { icon: Newspaper, title: "AI News", color: "secondary", desc: `Latest impact reports on food security.`, link: "/dashboard/news", label: "News" },
          { icon: AlertTriangle, title: "Price Alert", color: "orange-500", desc: `Market prices higher at nearby suppliers.`, link: "/dashboard/suppliers", label: "Market" },
        ].map((alert, i) => (
          <Card key={i} className="rounded-2xl sm:rounded-[2rem] border-none shadow-md hover:shadow-lg transition-all group overflow-hidden bg-white">
            <div className={cn("h-1 sm:h-1.5 w-full", `bg-${alert.color}`)} />
            <CardHeader className="pb-2 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className={cn("h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12", `bg-${alert.color}/10`)}>
                  <alert.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", `text-${alert.color}`)} />
                </div>
                <span className={cn("text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 sm:px-3 py-1 rounded-full", `bg-${alert.color}/10 text-${alert.color}`)}>{alert.label}</span>
              </div>
              <CardTitle className="text-sm sm:text-base font-bold mt-3 sm:mt-4 text-slate-800">{alert.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium line-clamp-2">{alert.desc}</p>
              <Link href={alert.link}>
                <Button variant="link" size="sm" className="px-0 h-auto text-primary text-xs font-black mt-3 sm:mt-4 group/btn">
                  GET INTEL <ArrowRight className="ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* LOCAL RADAR - Mobile view */}
      <div className="lg:hidden">
        <LocalRadar countryCode={countryCode} apiKey={apiKey} />
      </div>

      {/* MAIN CONTENT - Responsive 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left column: 2/3 width on lg */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Crop Performance */}
          <CropPerformance countryCode={countryCode} isEasyMode={isEasyMode} />

          {/* Activity Log */}
          <ActivityLog limit={3} />
        </div>

        {/* Right column: 1/3 width on lg */}
        <div className="space-y-6 sm:space-y-8">
          {/* Ask Copilot Card */}
          <Card className="rounded-2xl sm:rounded-3xl lg:rounded-[3rem] shadow-lg sm:shadow-2xl border-none bg-secondary/10 overflow-hidden">
            <CardHeader className="p-5 sm:p-8">
              <CardTitle className="text-lg sm:text-2xl font-headline font-bold flex items-center gap-2 sm:gap-3 text-secondary-foreground">
                <MessageSquare className="h-5 w-5 sm:h-8 sm:w-8 text-secondary" />
                <span className="hidden sm:inline">Ask Copilot</span>
                <span className="sm:hidden">Chat</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-base font-medium text-slate-600 mt-1">AI help for your farm</CardDescription>
            </CardHeader>
            <CardContent className="px-5 sm:px-8 pb-5 sm:pb-8 space-y-3 sm:space-y-6">
              <div className="p-3 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border shadow-sm text-xs sm:text-sm font-bold text-slate-500 italic relative group hover:border-primary transition-colors cursor-pointer">
                "How much fertilizer for 5 acres?"
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
              </div>
              <div className="p-3 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border shadow-sm text-xs sm:text-sm font-bold text-slate-500 italic relative group hover:border-primary transition-colors cursor-pointer">
                "Best treatment for brown spots?"
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
              </div>
              <Link href="/dashboard/chat" className="w-full">
                <Button className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-xl sm:rounded-2xl font-black h-12 sm:h-14 text-sm sm:text-lg shadow-lg sm:shadow-xl shadow-secondary/20 transition-all hover:-translate-y-1">
                  START SESSION
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pathfinder Tools Card */}
          <Card className="rounded-2xl sm:rounded-3xl lg:rounded-[3rem] shadow-lg sm:shadow-2xl border-none bg-white overflow-hidden p-5 sm:p-8">
            <CardHeader className="px-0 pt-0 mb-4 sm:mb-6">
              <CardTitle className="text-lg sm:text-2xl font-headline font-bold text-slate-900">Tools</CardTitle>
              <CardDescription className="text-xs sm:text-sm font-medium text-slate-500 mt-1">AI planning & scouting</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 grid grid-cols-2 gap-3 sm:gap-4">
              <Link href="/dashboard/setup" className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all text-center group shadow-sm hover:shadow-lg hover:-translate-y-1">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4 shadow-sm group-hover:bg-white/20">
                  <Compass className="h-5 w-5 sm:h-6 sm:w-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-tight">Pathfinder</span>
              </Link>
              <Link href="/dashboard/suppliers" className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all text-center group shadow-sm hover:shadow-lg hover:-translate-y-1">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4 shadow-sm group-hover:bg-white/20">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-tight">Suppliers</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}