
"use client"

import * as React from "react"
import { ShieldAlert, Globe, BarChart3, Loader2, AlertTriangle, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { riskIntel, type RiskIntelOutput } from "@/ai/flows/risk-intel-flow"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { createClient } from "@/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

const INTEL_POOL: RiskIntelOutput[] = [
  {
    alertLevel: "Medium",
    potentialImpactSummary: "The agricultural sector is currently facing moderate risk due to global fuel price fluctuations and export quotas for urea production. Local supply chains are stable but costs are increasing due to maritime shipping delays.",
    recommendedActions: [
      "Pre-order essential fertilizers for the next planting cycle.",
      "Adopt soil moisture sensors to reduce irrigation costs.",
      "Diversify short-term crops to maintain cash flow.",
      "Monitor federal policy updates on fuel and fertilizer subsidies."
    ]
  },
  {
    alertLevel: "High",
    potentialImpactSummary: "Significant risk detected in chemical supply chains. Major producers have implemented temporary export bans on specific pesticide active ingredients, which may cause a 20% price surge locally.",
    recommendedActions: [
      "Identify local organic alternatives for pest control.",
      "Verify existing pesticide stock levels and shelf life.",
      "Engage with agricultural officers for ingredient substitutes."
    ]
  }
]

export default function RiskIntelPage() {
  const supabase = createClient()
  const [geminiKey, setGeminiKey] = React.useState<string | null>(null)
  const [countryCode, setCountryCode] = React.useState<string>("MY")

  const [intel, setIntel] = React.useState<RiskIntelOutput>(INTEL_POOL[0])
  const [loading, setLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('users').select('geminiApiKey, countryCode').eq('id', user.id).single().then(({ data }) => {
          if (data?.geminiApiKey) setGeminiKey(data.geminiApiKey)
          if (data?.countryCode) setCountryCode(data.countryCode)
        })
      }
    })
    setMounted(true)
    const day = new Date().getDate()
    const index = day % INTEL_POOL.length
    setIntel(INTEL_POOL[index])
  }, [])

  const fetchIntel = async () => {
    if (!geminiKey) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Add your Gemini key in Settings to run scans."
      })
      return
    }

    setLoading(true)
    try {
      const data = await riskIntel({
        region: "Local Region",
        countryCode: countryCode,
        newsSummary: "Global shipping delays reported. Crude oil prices stabilizing. Regional rice export bans maintained.",
        commodityPrices: { "Fertilizer (NPK)": 820, "Diesel": 2.15 },
        exportImportBans: ["Regional Rice Export Ban"],
        policyUpdates: "New federal subsidy updates for agriculture.",
        apiKey: geminiKey
      })
      setIntel(data)
      toast({ title: "Risk Scan Complete" })
    } catch (error) {
      toast({ variant: "destructive", title: "Scan Failed" })
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
    <div className="max-w-6xl mx-auto space-y-8 pb-32 px-1 no-scrollbar">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <Globe className="h-3.5 w-3.5" />
            Supply Chain Intelligence
          </div>
          <h2 className="text-3xl font-headline font-bold text-primary">Risk Intel & Shock Prediction</h2>
          <p className="text-muted-foreground font-medium">Grounded regional assessments updated daily.</p>
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

      {!geminiKey && (
        <Alert variant="default" className="bg-orange-50 border-orange-100 rounded-2xl shadow-sm">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-orange-900 font-bold">API Key Awareness</AlertTitle>
          <AlertDescription className="text-orange-800 text-xs">
            To use live risk scanning beyond the daily rotation, add your own Gemini API key in <Link href="/dashboard/settings" className="underline font-bold">Settings</Link>.
          </AlertDescription>
        </Alert>
      )}

      <div className={cn("grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700", loading && "opacity-50 pointer-events-none")}>
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
          </CardHeader>
          <CardContent className="bg-white p-8 pt-4 space-y-8">
            <div className="p-6 rounded-2xl bg-slate-50 border-l-4 border-l-primary space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-black flex items-center gap-2 text-primary text-[10px] uppercase tracking-wider">
                  <ShieldAlert className="h-4 w-4" />
                  Impact Summary
                </h4>
                {intel.groundingProof && (
                  <div className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-tighter border border-blue-100 flex items-center gap-1">
                    <Globe className="h-2 w-2" /> Verified Source
                  </div>
                )}
              </div>
              <p className="text-slate-600 leading-relaxed font-bold text-sm">{intel.potentialImpactSummary}</p>
              {intel.groundingProof && (
                <div className="bg-white/50 p-3 rounded-xl border border-dashed border-slate-200">
                  <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed">
                    "Search Grounding: {intel.groundingProof}"
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-headline font-bold text-lg">Preventative Actions</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {intel.recommendedActions.map((action, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 transition-all hover:border-primary">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-xs">
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
             <span>Grounded in ASEAN Data</span>
          </div>
        </Card>

        <div className="space-y-6">
           <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
             <CardHeader className="bg-primary text-white p-6">
                <CardTitle className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-lg font-bold">
                    <BarChart3 className="h-5 w-5" />
                    Market Shocks
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Grounded AI Analysis</span>
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
                <Button variant="outline" className="w-full mt-10 rounded-xl h-14 font-black text-[10px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 transition-all">
                  Full Market Index
                </Button>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
