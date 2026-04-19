
"use client"

import * as React from "react"
import { Newspaper, Loader2, Sparkles, AlertTriangle, ArrowRight, Share2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { generateNewsArticle, type NewsAnalysisOutput } from "@/ai/flows/news-analysis-flow"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function NewsPage() {
  const [article, setArticle] = React.useState<NewsAnalysisOutput | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [mounted, setMounted] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    setMounted(true)
    fetchArticle()
  }, [])

  const fetchArticle = async (topic: string = "Iran-US Tensions impact on Malaysian Food Security and Palm Oil Supply") => {
    setLoading(true)
    try {
      const data = await generateNewsArticle({ topic })
      setArticle(data)
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

  // Hydration safety: only show date when mounted
  const formattedDate = mounted ? new Date().toLocaleDateString() : ""

  if (!mounted) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 px-1">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles className="h-3 w-3" />
            AI Intelligence Briefing
          </div>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-slate-900 leading-tight">Global News Analysis</h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Grounded agricultural impact assessments written by Gemini Pro.</p>
        </div>
        <Button 
          variant="outline" 
          className="rounded-xl border-primary text-primary h-12 w-full md:w-auto" 
          onClick={() => fetchArticle()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
          Refresh Intel
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-8">
          <div className="relative">
            <Loader2 className="h-20 w-20 animate-spin text-primary opacity-20" />
            <Sparkles className="h-10 w-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-slate-800">AI is writing your article...</h3>
            <p className="text-sm text-muted-foreground animate-pulse max-w-[280px] mx-auto leading-relaxed">Analyzing global stressors and local supply chains for Malaysia.</p>
          </div>
        </div>
      ) : article ? (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
            <div className={`h-4 ${riskColors[article.riskLevel]}`} />
            <CardHeader className="p-8 md:p-12 pb-6">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Newspaper className="h-4 w-4 text-primary" />
                    Latest Analysis • {formattedDate}
                 </div>
                 <div className={cn(
                   "px-3 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5",
                   riskColors[article.riskLevel]
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
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Verified by TUAI Intelligence Engine • Grounded Data</span>
               <div className="flex gap-3 w-full md:w-auto">
                 <Button variant="outline" className="flex-1 md:flex-none rounded-xl h-14 font-bold shadow-sm">
                   <Share2 className="h-4 w-4 mr-2" /> Share
                 </Button>
                 <Button className="flex-1 md:flex-none rounded-xl bg-primary text-white h-14 font-bold shadow-lg shadow-primary/20">
                   Full Report <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
               </div>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
             {["Fertilizer Shortage", "Fuel Subsidies", "Weather Shocks"].map((tag, i) => (
               <button 
                key={i} 
                onClick={() => fetchArticle(tag + " impact on Malaysia Padi")}
                className="p-8 bg-white rounded-[2.5rem] border border-slate-100 hover:border-primary transition-all text-left group shadow-sm active:scale-95 hover:shadow-xl"
               >
                 <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                    <Sparkles className="h-6 w-6 text-slate-400 group-hover:text-primary" />
                 </div>
                 <h4 className="font-bold text-slate-800 text-lg">Analyze {tag}</h4>
                 <p className="text-[10px] text-muted-foreground mt-1 uppercase font-black tracking-widest">Deep dive intelligence</p>
               </button>
             ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
