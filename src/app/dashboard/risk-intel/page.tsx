
"use client"

import * as React from "react"
import { ShieldAlert, Globe, BarChart3, Loader2, AlertTriangle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { riskIntel, type RiskIntelOutput } from "@/ai/flows/risk-intel-flow"
import { cn } from "@/lib/utils"

const INITIAL_INTEL: RiskIntelOutput = {
  alertLevel: "Medium",
  potentialImpactSummary: "Malaysia's agricultural sector is currently facing moderate risk due to global fuel price fluctuations and export quotas in China for urea production. Local supply chains for Padi are stable but costs are increasing due to maritime shipping delays.",
  recommendedActions: [
    "Pre-order essential fertilizers for the next planting cycle to hedge against price hikes.",
    "Adopt soil moisture sensors to reduce irrigation costs by 15%.",
    "Diversify short-term crops to maintain cash flow during Padi off-seasons.",
    "Monitor federal policy updates on fuel and fertilizer subsidies regularly."
  ]
}

export default function RiskIntelPage() {
  const [intel, setIntel] = React.useState<RiskIntelOutput>(INITIAL_INTEL)
  const [loading, setLoading] = React.useState(false)

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
    } catch (error) {
      console.error("Failed to fetch risk intel", error)
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <Globe className="h-3 w-3" />
            Supply Chain Intelligence
          </div>
          <h2 className="text-3xl font-headline font-bold text-primary">Risk Intel & Shock Prediction</h2>
          <p className="text-muted-foreground">Regional stressors and global impacts affecting local farming.</p>
        </div>
        <Button 
          onClick={fetchIntel}
          className="h-12 px-8 rounded-xl bg-primary text-white font-bold shadow-lg active:scale-95 transition-all"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Update Global Risk Scan
        </Button>
      </div>

      <div className={cn("grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700", loading && "opacity-50 pointer-events-none")}>
        <Card className="lg:col-span-2 rounded-[2rem] border-none shadow-xl overflow-hidden bg-white">
          <div className={`h-3 ${alertColors[intel.alertLevel]}`} />
          <CardHeader className="bg-white p-8 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline font-bold text-2xl">Regional Risk Assessment</CardTitle>
              <div className={`px-4 py-1.5 rounded-full text-white text-sm font-bold flex items-center gap-2 ${alertColors[intel.alertLevel]}`}>
                <AlertTriangle className="h-4 w-4" />
                {intel.alertLevel} Alert
              </div>
            </div>
            <CardDescription className="text-base mt-2">
              Analysis based on recent geopolitical shifts and commodity market fluctuations.
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white p-8 pt-4 space-y-8">
            <div className="p-6 rounded-2xl bg-slate-50 border-l-4 border-l-primary space-y-3">
              <h4 className="font-bold flex items-center gap-2 text-primary text-sm uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4" />
                Impact Summary
              </h4>
              <p className="text-slate-600 leading-relaxed font-medium">{intel.potentialImpactSummary}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-headline font-bold text-lg">Preventative Actions for Farmers</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {intel.recommendedActions.map((action, i) => (
                  <div key={i} className="flex gap-3 p-4 rounded-xl bg-white border border-slate-100 hover:border-primary transition-all shadow-sm hover:shadow-md">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                      {i + 1}
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-snug">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <div className="bg-slate-50/50 p-6 flex items-center justify-between border-t text-[10px] font-black text-muted-foreground uppercase tracking-widest">
             <span>Verified TUAI Intelligence Engine</span>
             <div className="flex items-center gap-1">
               <Sparkles className="h-3 w-3 text-secondary fill-current" />
               Live Data
             </div>
          </div>
        </Card>

        <div className="space-y-6">
           <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden bg-white">
             <CardHeader className="bg-primary text-white p-6 pb-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Live Market Shocks
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <div className="space-y-6">
                  {[
                    { label: "Fertilizer (NPK)", price: "RM 820/t", trend: "up", change: "+12%" },
                    { label: "Diesel fuel", price: "RM 2.15/L", trend: "stable", change: "0%" },
                    { label: "Padi Premium", price: "RM 1.45/kg", trend: "up", change: "+4%" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                      <div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{item.label}</div>
                        <div className="text-xl font-headline font-bold text-slate-800">{item.price}</div>
                      </div>
                      <div className={`text-[10px] font-black px-3 py-1 rounded-full ${item.trend === 'up' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                        {item.change}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-8 bg-slate-100 text-primary hover:bg-primary hover:text-white rounded-xl h-12 font-bold transition-all shadow-sm">
                  Full Market Analysis
                </Button>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
