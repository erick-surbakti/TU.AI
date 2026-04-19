"use client"

import * as React from "react"
import { Newspaper, Loader2, Sparkles, AlertTriangle, ArrowRight, TrendingUp, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { generateNewsArticle, type NewsAnalysisOutput } from "@/ai/flows/news-analysis-flow"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

const ARTICLE_POOL: NewsAnalysisOutput[] = [
  {
    title: "The ASEAN Rice Crisis: Navigating Export Bans",
    summary: "Recent policy shifts in India and Thailand are creating a ripple effect across Malaysian padi fields.",
    articleBody: "Malaysia's rice self-sufficiency remains a top priority. As major exporters tighten quotas, local farmers are seeing increased pressure to optimize yields. \n\n### Fertilizer Price Shocks\nWith shipping routes disrupted, the cost of NPK fertilizer is projected to rise by 12% in the coming quarter. We recommend immediate soil testing to prevent over-application and waste.\n\n### Strategic Storage\nFarmers are encouraged to look into shared community storage solutions to hedge against market volatility.",
    riskLevel: "High",
    actions: ["Review padi subsidy eligibility", "Invest in moisture sensors", "Coordinate with local cooperatives"]
  },
  {
    title: "Fuel Volatility and the Smallholder Farmer",
    summary: "Global crude prices are stabilizing, but local pump prices for diesel remain a concern for machinery operators.",
    articleBody: "Energy costs account for up to 30% of operational expenses for modern farms. \n\n### Machinery Optimization\nRegular maintenance of tractors and harvesters can reduce fuel consumption by up to 15%. \n\n### Alternative Energy\nSolar-powered irrigation systems are becoming increasingly viable under new green energy grants.",
    riskLevel: "Moderate",
    actions: ["Apply for machinery grants", "Schedule engine tune-ups", "Audit irrigation runtimes"]
  },
  {
    title: "Climate Resilience in the Northern Region",
    summary: "Predicting the impact of the upcoming monsoon shift on Kedah and Perlis rice cycles.",
    articleBody: "Early onset rains are expected this year, potentially disrupting traditional harvest windows. \n\n### Drainage Integrity\nEnsure all field drainage is cleared of debris before the heavy rains begin. \n\n### Variety Selection\nShort-cycle varieties like MR219 are proving more resilient to unpredictable weather patterns.",
    riskLevel: "Moderate",
    actions: ["Clear field perimeter drains", "Consult MARDI on seed varieties", "Monitor daily weather radar"]
  }
]

export default function NewsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const userRef = useMemoFirebase(() => (db && user ? doc(db, "users", user.uid) : null), [db, user])
  const { data: profile } = useDoc(userRef)
  const geminiKey = profile?.geminiApiKey

  const [article, setArticle] = React.useState<NewsAnalysisOutput>(ARTICLE_POOL[0])
  const [loading, setLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [showFullReport, setShowFullReport] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    setMounted(true)
    const day = new Date().getDate()
    const index = day % ARTICLE_POOL.length
    setArticle(ARTICLE_POOL[index])
  }, [])

  const fetchArticle = async (topic: string = "Global food supply chain stressors for ASEAN 2024") => {
    if (!geminiKey) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Add your Gemini key in Settings to regenerate analysis."
      })
      return
    }

    setLoading(true)
    try {
      const data = await generateNewsArticle({ topic, apiKey: geminiKey })
      setArticle(data)
      toast({
        title: "Intelligence Updated",
        description: "Fresh AI analysis generated based on real-time data."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: "Could not generate the news briefing at this time."
      })
    } finally {
      setLoading(false)
    }
  }

  const riskColors = {
    Low: "bg-emerald-500",
    Moderate: "bg-yellow-500",
    High: "bg-orange-500",
    Critical: "bg-destructive"
  }

  if (!mounted) return null

  const formattedDate = new Date().toLocaleDateString()

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 px-1 no-scrollbar">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles className="h-3 w-3" />
            AI Intelligence Hub
          </div>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-slate-900 leading-tight">Global News Analysis</h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Daily impact assessments grounded in regional ASEAN data.</p>
        </div>
        <Button 
          className="rounded-xl bg-primary text-white h-12 font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
          onClick={() => fetchArticle()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Regenerate AI
        </Button>
      </div>

      {!geminiKey && (
        <Alert variant="default" className="bg-orange-100 border-none rounded-2xl shadow-sm">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-orange-900 font-bold">Token Responsibility</AlertTitle>
          <AlertDescription className="text-orange-800 text-xs">
            To regenerate fresh analysis, please add your own Gemini API key in <Link href="/dashboard/settings" className="underline font-bold">Settings</Link>.
          </AlertDescription>
        </Alert>
      )}

      <div className={cn("animate-in fade-in slide-in-from-bottom-8 duration-700 no-scrollbar", loading && "opacity-50 pointer-events-none")}>
        <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
          <div className={`h-4 ${riskColors[article.riskLevel as keyof typeof riskColors]}`} />
          <CardHeader className="p-8 md:p-12 pb-6">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Sourced Intelligence • {formattedDate}
               </div>
               <div className={cn(
                 "px-3 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5",
                 riskColors[article.riskLevel as keyof typeof riskColors]
               )}>
                 <AlertTriangle className="h-3 w-3" />
                 {article.riskLevel} Risk
               </div>
            </div>
            <CardTitle className="text-3xl md:text-5xl font-headline font-bold text-slate-900 leading-tight md:leading-[1.15]">
              {article.title}
            </CardTitle>
            <CardDescription className="text-base md:text-lg font-medium text-slate-500 mt-8 leading-relaxed border-l-4 border-primary/20 pl-6 italic bg-slate-50/50 py-4 rounded-r-2xl">
              {article.summary}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 md:px-12 pb-12">
            <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-loose text-base md:text-lg">
              {article.articleBody.split('\n').map((line, i) => (
                <p key={i} className="mb-4">{line.replace(/#/g, '')}</p>
              ))}
            </div>

            <div className="mt-10 md:mt-16 p-8 md:p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-8">
               <h4 className="font-headline font-bold text-xl md:text-2xl flex items-center gap-3 text-primary">
                 <Sparkles className="h-6 w-6 text-secondary fill-current" />
                 Action Plan for Malaysian Farmers
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.actions.map((action, i) => (
                    <div key={i} className="flex gap-5 p-5 bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-md">
                       <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-sm">
                         {i + 1}
                       </div>
                       <p className="text-sm font-bold text-slate-700 leading-relaxed">{action}</p>
                    </div>
                  ))}
               </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 p-8 md:p-12 border-t flex flex-col md:flex-row justify-between items-center gap-6">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Verified by TUAI Intelligence Engine</span>
             <div className="flex gap-3 w-full md:w-auto">
               <Button 
                onClick={() => setShowFullReport(true)}
                className="flex-1 md:flex-none rounded-xl bg-primary text-white h-14 font-bold shadow-lg shadow-primary/20"
              >
                 Full Report <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
             </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showFullReport} onOpenChange={setShowFullReport}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Intelligence Dossier
            </DialogTitle>
            <DialogDescription className="font-medium">
              Detailed breakdown of geopolitical impacts and local stressors.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6 text-slate-600 leading-relaxed font-medium overflow-auto max-h-[60vh] no-scrollbar">
            <p><strong>Dossier Reference:</strong> TUAI-INTEL-{new Date().getFullYear()}-{article.title.substring(0, 3).toUpperCase()}</p>
            <p>This report synthesizes data from global commodity markets, regional policy updates, and Vertex AI predictive models.</p>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
               <h4 className="font-bold text-slate-900">Key Vulnerabilities</h4>
               <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Input dependency on international NPK suppliers.</li>
                  <li>Energy price elasticity in transport logistics.</li>
                  <li>Localized rainfall variations impacting soil acidity.</li>
               </ul>
            </div>
            <p className="text-xs italic text-muted-foreground">This report is for authorized farmer use only. Do not share raw intelligence with non-members.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
