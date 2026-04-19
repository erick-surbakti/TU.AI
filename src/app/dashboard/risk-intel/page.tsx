
"use client"

import * as React from "react"
import { ShieldAlert, Globe, BarChart3, Loader2, AlertTriangle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { riskIntel, type RiskIntelOutput } from "@/ai/flows/risk-intel-flow"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const INTEL_POOL: RiskIntelOutput[] = [
  {
    alertLevel: "Medium",
    potentialImpactSummary: "Malaysia's agricultural sector is currently facing moderate risk due to global fuel price fluctuations and export quotas in China for urea production. Local supply chains for Padi are stable but costs are increasing due to maritime shipping delays.",
    recommendedActions: [
      "Pre-order essential fertilizers for the next planting cycle to hedge against price hikes.",
      "Adopt soil moisture sensors to reduce irrigation costs by 15%.",
      "Diversify short-term crops to maintain cash flow during Padi off-seasons.",
      "Monitor federal policy updates on fuel and fertilizer subsidies regularly."
    ]
  },
  {
    alertLevel: "High",
    potentialImpactSummary: "Significant risk detected in chemical supply chains. Major producers in East Asia have implemented temporary export bans on specific pesticide active ingredients, which may cause a 20% price surge locally within 30 days.",
    recommendedActions: [
      "Identify local organic alternatives for pest control.",
      "Verify existing pesticide stock levels and shelf life.",
      "Engage with agricultural officers for emergency active ingredient substitutes."
    ]
  }
]

export default function RiskIntelPage() {
  const [intel, setIntel] = React.useState<RiskIntelOutput>(INTEL_POOL[0])
  const [loading, setLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    setMounted(true)
    const day = new Date().getDate()
    const index = day % INTEL_POOL.length
    setIntel(INTEL_POOL[index])
  }, [])

  const fetchIntel = async () => {
    setLoading(true)
    try {
      const data = await riskIntel({
        region: "Malaysia",
        newsSummary: "Global shipping delays reported in Red Sea. India maintains export ban on non-basmati rice. Crude oil prices stabilizing around $80/barrel.",
        commodityPrices: { "Fertilizer (NPK)": 820, "Diesel": 2.15, "Padi Grade A": 1.45 },
        exportImportBans: ["Indian Rice Export Ban", "China Urea Export Quotas"],
        policyUpdates: "New federal subsidy for organic soil enhancers starting next month."
      })
      setIntel(data)
      toast({
        title: "Risk Scan Complete",
        description: "Regional stressors have been updated with current market data."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: "Could not retrieve live risk data at this time."
      })
    } finally {
      setLoading(false)
    }
  }

  const alertColors = {
    Low: "bg-emerald-500",
    Medium: "bg-yellow-500",
    High: "bg-orange-500",
    Critical: "bg-destructive"
  }

  if (!mounted) return null

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <Globe className="h-3 w-3" />
            Supply Chain Intelligence
          </div>
          <h2 className="text-3xl font-headline font-bold text-primary">Risk Intel & Shock Prediction</h2>
          <p className="text-muted-foreground font-medium">Daily regional assessments grounded in global agricultural shocks.</p>
        </div>
        <Button 
          onClick={fetchIntel}
          className="h-12 px-8 rounded-xl bg-primary text-white font-bold shadow-lg active:scale-95 transition-all"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Run Global Risk Scan
        </Button>
      </div>

      <div className={cn("grid lg:grid-cols-3 gap-8 px-1 animate-in fade-in slide-in-from-bottom-8 duration-700", loading && "opacity-50 pointer-events-none")}>
        <Card className="lg:col-span-2 rounded-[2rem] border-none shadow-xl overflow-hidden bg-white">
          <div className={cn("h-3", alertColors[intel.alertLevel as keyof typeof alertColors])} />
          <CardHeader className="bg-white p-8 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline font-bold text-2xl">Regional Risk Assessment</CardTitle>
              <div className={cn(
                "px-4 py-1.5 rounded-full text-white text-sm font-bold flex items-center gap-2",
                alertColors[intel.alertLevel as keyof typeof alertColors]
              )}>
                <AlertTriangle className="h-4 w-4" />
                {intel.alertLevel} Alert
              </div>
            </div>
            <CardDescription className="text-base mt-2 font-medium">
              Daily analysis based on geopolitical shifts and commodity market fluctuations.
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white p-8 pt-4 space-y-8">
            <div className="p-6 rounded-2xl bg-slate-50 border-l-4 border-l-primary space-y-3 shadow-sm">
              <h4 className="font-black flex items-center gap-2 text-primary text-[10px] uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4" />
                Impact Summary
              </h4>
              <p className="text-slate-600 leading-relaxed font-medium">{intel.potentialImpactSummary}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-headline font-bold text-lg">Preventative Actions for Farmers</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {intel.recommendedActions.map((action, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-primary transition-all shadow-sm hover:shadow-md group">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-xs group-hover:scale-110 transition-transform">
                      {i + 1}
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <div className="bg-slate-50/50 p-6 flex items-center justify-between border-t text-[10px] font-black text-muted-foreground uppercase tracking-widest">
             <span>Verified TUAI Intelligence Engine</span>
             <div className="flex items-center gap-1.5">
               <Sparkles className="h-3.5 w-3.5 text-secondary fill-current" />
               Grounded in ASEAN Data
             </div>
          </div>
        </Card>

        <div className="space-y-6">
           <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
             <CardHeader className="bg-primary text-white p-6 pb-6">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <BarChart3 className="h-5 w-5" />
                  Live Market Shocks
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8">
                <div className="space-y-6">
                  {[
                    { label: "Fertilizer (NPK)", price: "RM 820/t", trend: "up", change: "+12%" },
                    { label: "Diesel fuel", price: "RM 2.15/L", trend: "stable", change: "0%" },
                    { label: "Padi Premium", price: "RM 1.45/kg", trend: "up", change: "+4%" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between pb-6 border-b last:border-0 last:pb-0">
                      <div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">{item.label}</div>
                        <div className="text-xl font-headline font-bold text-slate-800">{item.price}</div>
                      </div>
                      <div className={cn(
                        "text-[10px] font-black px-3 py-1.5 rounded-full",
                        item.trend === 'up' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                      )}>
                        {item.change}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-10 bg-slate-100 text-primary hover:bg-primary hover:text-white rounded-xl h-14 font-black text-xs uppercase tracking-widest transition-all shadow-sm">
                  View Full Market Index
                </Button>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
