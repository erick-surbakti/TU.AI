
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

  // Defer date rendering to prevent hydration mismatch
  const formattedDate = mounted ? new Date().toLocaleDateString() : ""

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-8 px-1">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles className="h-3 w-3" />
            AI Intelligence Briefing
          </div>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-slate-900 leading-tight">Global News Analysis</h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Grounded agricultural impact assessments written by Gemini Pro.</p>
        </div>
        <Button 
          variant="outline" 
          className="rounded-xl border-primary text-primary h-12" 
          onClick={() => fetchArticle()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
          Refresh Intel
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
            <Sparkles className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold">AI is writing your article...</h3>
            <p className="text-sm text-muted-foreground animate-pulse">Analyzing global stressors and local supply chains.</p>
          </div>
        </div>
      ) : article ? (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <Card className="rounded-[2rem] md:rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
            <div className={`h-3 md:h-4 ${riskColors[article.riskLevel]}`} />
            <CardHeader className="p-6 md:p-12 pb-6">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Newspaper className="h-4 w-4" />
                    Latest Analysis • {formattedDate}
                 </div>
                 <div className={cn(
                   "px-3 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5",
                   riskColors[article.riskLevel]
                 )}>
                   <AlertTriangle className="h-3 w-3" />
                   {article.riskLevel}
                 </div>
              </div>
              <CardTitle className="text-2xl md:text-5xl font-headline font-bold text-slate-900 leading-tight md:leading-[1.15]">
                {article.title}
              </CardTitle>
              <CardDescription className="text-base md:text-lg font-medium text-slate-500 mt-6 leading-relaxed border-l-4 border-primary/20 pl-4 md:pl-6 italic">
                {article.summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 md:px-12 pb-12">
              <div className="prose prose-slate max-w-none prose-headings:font-headline prose-headings:font-bold prose-p:text-slate-600 prose-p:leading-loose text-base md:text-lg">
                {article.articleBody.split('\n').map((line, i) => (
                  <p key={i} className="mb-4">{line.replace(/#/g, '')}</p>
                ))}
              </div>

              <div className="mt-8 md:mt-12 p-6 md:p-8 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-6">
                 <h4 className="font-headline font-bold text-lg md:text-xl flex items-center gap-2 text-primary">
                   <Sparkles className="h-5 w-5" />
                   Action Plan for Farmers
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {article.actions.map((action, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
                         <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-xs">
                           {i + 1}
                         </div>
                         <p className="text-sm font-bold text-slate-700 leading-snug">{action}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 p-6 md:p-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Verified by TUAI Intel Engine</span>
               <div className="flex gap-2 w-full md:w-auto">
                 <Button variant="outline" className="flex-1 md:flex-none rounded-xl h-12 font-bold">
                   <Share2 className="h-4 w-4 mr-2" /> Share
                 </Button>
                 <Button className="flex-1 md:flex-none rounded-xl bg-primary text-white h-12 font-bold">
                   Full Report <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
               </div>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
             {["Fertilizer Shortage", "Fuel Subsidies", "Weather Shocks"].map((tag, i) => (
               <button 
                key={i} 
                onClick={() => fetchArticle(tag + " impact on Malaysia Padi")}
                className="p-6 bg-white rounded-[2rem] border border-slate-100 hover:border-primary transition-all text-left group shadow-sm active:scale-95"
               >
                 <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <Sparkles className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                 </div>
                 <h4 className="font-bold text-slate-800">Analyze {tag}</h4>
                 <p className="text-[10px] text-muted-foreground mt-1 uppercase font-black tracking-widest">Deep dive</p>
               </button>
             ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
