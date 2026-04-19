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
  Activity
} from "lucide-react"
import Link from "next/link"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome & Region Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col justify-between p-8 rounded-3xl bg-primary text-white shadow-2xl shadow-primary/20 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <Sprout className="h-40 w-40" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-headline font-bold mb-2">Selamat Pagi, Farmer Ahmad!</h2>
            <p className="text-primary-foreground/80 max-w-[500px]">Your Padi fields in Selangor are showing healthy growth. Weather looks optimal for the next 48 hours.</p>
          </div>
          <div className="flex gap-4 mt-8 relative z-10">
            <Link href="/dashboard/disease-scan">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-xl font-bold shadow-lg">
                <Plus className="mr-2 h-5 w-5" /> New Analysis
              </Button>
            </Link>
          </div>
        </div>
        <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-accent/30 pb-4">
             <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Local Weather</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Thermometer className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">32°C</div>
                  <div className="text-xs text-muted-foreground">Hot & Humid</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CloudRain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">12%</div>
                  <div className="text-xs text-muted-foreground">Rain Chance</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#F0F4F6] text-xs font-medium text-muted-foreground">
              Tip: Monitor moisture levels tonight. Potential dry spell starting Tuesday.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: ShieldAlert, title: "Export Ban Detected", color: "destructive", desc: "India has restricted fertilizer exports. Prices may surge soon.", link: "/dashboard/risk-intel", label: "High Risk" },
          { icon: TrendingUp, title: "Padi Prices Up", color: "orange-500", desc: "Local exchange reporting 4% increase in premium grain demand.", link: "/dashboard/chat", label: "Market" },
          { icon: Sprout, title: "Treatment Due", color: "primary", desc: "Recommended fungal prevention for Block A scheduled for tomorrow.", link: "/dashboard/records", label: "Health" },
          { icon: AlertTriangle, title: "Cloud Synced", color: "secondary", desc: "All regional data indexes are up to date. Ministry policies verified.", link: "#", label: "System" },
        ].map((alert, i) => (
          <Card key={i} className={`rounded-2xl border-l-4 shadow-md hover:shadow-lg transition-all border-l-${alert.color}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <alert.icon className={`h-5 w-5 text-${alert.color}`} />
                <span className={`text-[10px] font-bold uppercase bg-${alert.color}/10 text-${alert.color} px-2 py-0.5 rounded-full`}>{alert.label}</span>
              </div>
              <CardTitle className="text-sm font-bold mt-2">{alert.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">{alert.desc}</p>
              <Link href={alert.link}>
                <Button variant="link" size="sm" className="px-0 h-auto text-primary text-xs mt-2 group">
                  Action <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card className="rounded-3xl shadow-xl border-none">
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline font-bold">Crop Performance</CardTitle>
                  <CardDescription>Live health & growth index for Block A (Padi)</CardDescription>
                </div>
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
             </CardHeader>
             <CardContent>
                <div className="h-[250px] w-full">
                  <ChartContainer config={{ growth: { label: "Growth Index", color: "hsl(var(--primary))" } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                        <YAxis hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="growth" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorGrowth)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
             </CardContent>
           </Card>

           <Card className="rounded-3xl shadow-xl border-none">
             <CardHeader>
                <CardTitle className="font-headline font-bold">Recent Activities</CardTitle>
                <CardDescription>History of your farm actions and AI diagnostics</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Disease Scan: Blast Disease", date: "2 hours ago", type: "scan", result: "Treatment Applied" },
                    { title: "Price Check: Fertilizer", date: "Yesterday", type: "market", result: "Supplier Found" },
                    { title: "Policy Update", date: "2 days ago", type: "policy", result: "Subsidy Eligible" },
                  ].map((act, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-accent/20 hover:bg-accent/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                          {act.type === 'scan' ? <Sprout className="h-5 w-5 text-primary" /> : act.type === 'market' ? <TrendingUp className="h-5 w-5 text-orange-500" /> : <ShieldAlert className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold">{act.title}</div>
                          <div className="text-[10px] text-muted-foreground">{act.date}</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-muted-foreground border">
                        {act.result}
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/records">
                  <Button variant="ghost" className="w-full mt-6 text-primary font-bold">View Full Activity Log</Button>
                </Link>
             </CardContent>
           </Card>
        </div>

        <div className="space-y-8">
           <Card className="rounded-3xl shadow-xl border-none bg-secondary/10">
             <CardHeader>
                <CardTitle className="font-headline font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                  Ask Copilot
                </CardTitle>
                <CardDescription>Instant help for your farm</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="p-3 bg-white rounded-2xl border text-sm italic text-muted-foreground">
                  "How much fertilizer should I use for 5 acres of Padi?"
                </div>
                <div className="p-3 bg-white rounded-2xl border text-sm italic text-muted-foreground">
                  "What's the best treatment for brown spots?"
                </div>
                <Link href="/dashboard/chat">
                  <Button className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-xl font-bold mt-2 shadow-lg shadow-secondary/20">
                    Start Chatting
                  </Button>
                </Link>
             </CardContent>
           </Card>

           <Card className="rounded-3xl shadow-xl border-none">
             <CardHeader>
                <CardTitle className="font-headline font-bold">Quick Finder</CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/suppliers?q=fertilizer" className="p-4 rounded-2xl bg-[#F0F4F6] hover:bg-primary hover:text-white transition-all text-center group shadow-sm">
                  <MapPin className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Fertilizer</span>
                </Link>
                <Link href="/dashboard/suppliers?q=seeds" className="p-4 rounded-2xl bg-[#F0F4F6] hover:bg-primary hover:text-white transition-all text-center group shadow-sm">
                  <Sprout className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Seeds</span>
                </Link>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
