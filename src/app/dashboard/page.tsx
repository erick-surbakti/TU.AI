
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Sprout, 
  ShieldAlert, 
  Thermometer, 
  CloudRain, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  Plus,
  MapPin,
  MessageSquare,
  Activity,
  Newspaper,
  Globe,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const chartData = [
  { day: "Mon", growth: 45 },
  { day: "Tue", growth: 52 },
  { day: "Wed", growth: 48 },
  { day: "Thu", growth: 61 },
  { day: "Fri", growth: 55 },
  { day: "Sat", growth: 67 },
  { day: "Sun", growth: 72 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      {/* Welcome & Region Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col justify-between p-8 md:p-10 rounded-[3rem] bg-primary text-white shadow-2xl shadow-primary/20 overflow-hidden relative group min-h-[300px]">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
             <Sprout className="h-48 w-48" />
          </div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">Selamat Pagi, Farmer Ahmad!</h2>
            <p className="text-primary-foreground/80 max-w-[500px] text-lg font-medium">Your Padi fields in Selangor are showing healthy growth. Weather looks optimal for the next 48 hours.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-10 relative z-10">
            <Link href="/dashboard/disease-scan">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-2xl font-bold h-14 px-8 shadow-xl">
                <Plus className="mr-2 h-5 w-5" /> New AI Diagnosis
              </Button>
            </Link>
            <Link href="/dashboard/news">
              <Button size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 rounded-2xl font-bold h-14 px-8 backdrop-blur-sm">
                <Newspaper className="mr-2 h-5 w-5" /> Global Intel
              </Button>
            </Link>
          </div>
        </div>
        <Card className="rounded-[3rem] border-none shadow-xl bg-white overflow-hidden flex flex-col">
          <CardHeader className="bg-accent/30 pb-4">
             <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
               <Globe className="h-4 w-4" />
               Local Radar
             </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-8 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner">
                  <Thermometer className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-800 tracking-tighter">32°C</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hot & Humid</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center shadow-inner">
                  <CloudRain className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-800 tracking-tighter">12%</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rain Chance</div>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-600 leading-relaxed shadow-sm">
              AI Insight: Monitor moisture levels tonight. Potential dry spell starting Tuesday.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: ShieldAlert, title: "Export Ban Detected", color: "destructive", desc: "India has restricted fertilizer exports. Prices may surge soon.", link: "/dashboard/risk-intel", label: "Global Risk" },
          { icon: Newspaper, title: "AI News Briefing", color: "secondary", desc: "New report on Iran-US tensions and Malaysian food stages.", link: "/dashboard/news", label: "AI News" },
          { icon: Sprout, title: "Treatment Due", color: "primary", desc: "Recommended fungal prevention for Block A scheduled for tomorrow.", link: "/dashboard/records", label: "Health" },
          { icon: AlertTriangle, title: "Price Surge Alert", color: "orange-500", desc: "Urea prices reported 12% higher at 3 nearby suppliers.", link: "/dashboard/suppliers", label: "Market" },
        ].map((alert, i) => (
          <Card key={i} className="rounded-[2rem] border-none shadow-lg hover:shadow-2xl transition-all group overflow-hidden bg-white">
            <div className={cn("h-1.5 w-full", `bg-${alert.color}`)} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12", `bg-${alert.color}/10`)}>
                  <alert.icon className={cn("h-5 w-5", `text-${alert.color}`)} />
                </div>
                <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full", `bg-${alert.color}/10 text-${alert.color}`)}>{alert.label}</span>
              </div>
              <CardTitle className="text-base font-bold mt-4 text-slate-800">{alert.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">{alert.desc}</p>
              <Link href={alert.link}>
                <Button variant="link" size="sm" className="px-0 h-auto text-primary text-xs font-black mt-4 group/btn">
                  GET INTEL <ArrowRight className="ml-1 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card className="rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between p-8 md:p-10">
                <div>
                  <CardTitle className="text-2xl font-headline font-bold text-slate-900">Crop Performance</CardTitle>
                  <CardDescription className="text-lg font-medium text-slate-500">Live health & growth index for Block A (Padi)</CardDescription>
                </div>
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
                  <Activity className="h-7 w-7 text-primary" />
                </div>
             </CardHeader>
             <CardContent className="px-8 md:px-10 pb-10">
                <div className="h-[300px] w-full">
                  <ChartContainer config={{ growth: { label: "Growth Index", color: "hsl(var(--primary))" } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                        <YAxis hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="growth" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorGrowth)" strokeWidth={4} dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 4, stroke: "#fff" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
             </CardContent>
           </Card>

           <Card className="rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden">
             <CardHeader className="p-8 md:p-10 pb-4">
                <CardTitle className="text-2xl font-headline font-bold text-slate-900">Recent AI Activities</CardTitle>
                <CardDescription className="text-lg font-medium text-slate-500">Historical records of your farm actions and AI diagnostics</CardDescription>
             </CardHeader>
             <CardContent className="px-8 md:p-10 pt-0">
                <div className="space-y-4">
                  {[
                    { title: "Disease Scan: Blast Disease", date: "2 hours ago", type: "scan", result: "Treatment Applied" },
                    { title: "Price Check: Fertilizer", date: "Yesterday", type: "market", result: "Supplier Found" },
                    { title: "Policy Update: Fuel Subsidies", date: "2 days ago", type: "policy", result: "Subsidy Eligible" },
                  ].map((act, i) => (
                    <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group cursor-pointer shadow-sm hover:shadow-md">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          {act.type === 'scan' ? <Sprout className="h-7 w-7 text-primary" /> : act.type === 'market' ? <TrendingUp className="h-7 w-7 text-orange-500" /> : <ShieldAlert className="h-7 w-7 text-blue-500" />}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-800">{act.title}</div>
                          <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">{act.date}</div>
                        </div>
                      </div>
                      <div className="hidden sm:block text-xs font-black px-4 py-2 rounded-full bg-white text-slate-600 border shadow-sm uppercase tracking-wider">
                        {act.result}
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/records">
                  <Button variant="ghost" className="w-full mt-10 h-14 rounded-2xl text-primary font-black text-lg hover:bg-primary/5">
                    VIEW FULL ACTIVITY LOG
                  </Button>
                </Link>
             </CardContent>
           </Card>
        </div>

        <div className="space-y-8">
           <Card className="rounded-[3rem] shadow-2xl border-none bg-secondary/10 overflow-hidden">
             <CardHeader className="p-8">
                <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3 text-secondary-foreground">
                  <MessageSquare className="h-8 w-8 text-secondary" />
                  Ask Copilot
                </CardTitle>
                <CardDescription className="text-base font-medium text-slate-600">Instant AI help for your farm operations</CardDescription>
             </CardHeader>
             <CardContent className="px-8 pb-8 space-y-6">
                <div className="p-5 bg-white rounded-3xl border shadow-sm text-sm font-bold text-slate-500 italic relative group hover:border-primary transition-colors cursor-pointer">
                   "How much fertilizer should I use for 5 acres of Padi?"
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="h-4 w-4 text-primary" />
                   </div>
                </div>
                <div className="p-5 bg-white rounded-3xl border shadow-sm text-sm font-bold text-slate-500 italic relative group hover:border-primary transition-colors cursor-pointer">
                   "What's the best treatment for brown spots on rice leaves?"
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="h-4 w-4 text-primary" />
                   </div>
                </div>
                <Link href="/dashboard/chat">
                  <Button className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-2xl font-black h-14 text-lg shadow-xl shadow-secondary/20 transition-all hover:-translate-y-1">
                    START AI SESSION
                  </Button>
                </Link>
             </CardContent>
           </Card>

           <Card className="rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden p-8">
             <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-headline font-bold text-slate-900">Quick Resource Finder</CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500">AI finds the nearest authorized suppliers</CardDescription>
             </CardHeader>
             <CardContent className="px-0 pb-0 grid grid-cols-2 gap-4">
                <Link href="/dashboard/suppliers?q=fertilizer" className="p-6 rounded-[2rem] bg-slate-50 hover:bg-primary hover:text-white transition-all text-center group shadow-sm hover:shadow-xl hover:-translate-y-2">
                  <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:bg-white/20">
                    <MapPin className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-tighter">Fertilizer</span>
                </Link>
                <Link href="/dashboard/suppliers?q=seeds" className="p-6 rounded-[2rem] bg-slate-50 hover:bg-primary hover:text-white transition-all text-center group shadow-sm hover:shadow-xl hover:-translate-y-2">
                  <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:bg-white/20">
                    <Sprout className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-tighter">Seeds</span>
                </Link>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
