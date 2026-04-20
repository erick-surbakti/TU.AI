
"use client"

import * as React from "react"
import { Newspaper, Loader2, Sparkles, AlertTriangle, ArrowRight, TrendingUp, FileText, AlertCircle, Globe, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateNewsBatch, type NewsAnalysisOutput } from "@/ai/flows/news-analysis-flow"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { createClient } from "@/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

const ARTICLE_POOL: NewsAnalysisOutput[] = [
  {
    title: "Indonesia to Implement B50 Biofuel Mandate by July 2026",
    summary: "Minister Sulaiman announces plans to cease diesel imports as the nation shifts to a 50% palm-oil blend to boost energy sovereignty.",
    articleBody: "### Fuel Independence\nIndonesia is aggressively moving towards B50 biodiesel. This shift is expected to absorb a significant portion of domestic crude palm oil (CPO) production, supporting local smallholders while reducing reliance on international fuel markets.\n\n### Impact on Farmers\nIncreased domestic demand for CPO is likely to stabilize floor prices for fresh fruit bunches (FFB). Farmers should monitor provincial price announcements closely as the mandate approaches.",
    riskLevel: "Low",
    actions: ["Optimize CPO harvesting cycles", "Join local Smallholder Cooperatives", "Monitor B50 infrastructure updates"],
    sourceName: "Big News Network",
    sourceUrl: "https://www.bignewsnetwork.com/"
  },
  {
    title: "Indonesia Reaches Rice Surplus, Ceases Medium-Grade Imports",
    summary: "Government reserves reach record 4.8 million tonnes, ensuring stability against climate shifts and global supply chain shocks.",
    articleBody: "### Strategic Reserves\nWith a record-high stockpile, Indonesia's food security is reaching a new milestone. The government has officially declared a stop to imports of medium-grade rice, relying entirely on domestic production.\n\n### Climate Resilience\nDespite the surplus, officials are warning about potential El Niño impacts later this year. Farmers are encouraged to continue using early-maturing varieties to stay ahead of weather shifts.",
    riskLevel: "Moderate",
    actions: ["Utilize drought-resistant seeds", "Apply for water-pump subsidies", "Register with the local Sembako network"],
    sourceName: "Antara News",
    sourceUrl: "https://www.antaranews.com/"
  },
  {
    title: "Malaysia-Indonesia Deepen Bilateral Agri-AI Research",
    summary: "Nations collaborate on precision agriculture, drone technology, and AI integration for total food security across the ASEAN region.",
    articleBody: "### Tech Integration\nLeading labs in both nations are now co-developing AI models for pest prediction and soil nutrient analysis. This partnership aims to standardize 'Smart Farming' across the archipelago.\n\n### Cross-Border Learning\nExpect increased exchange programs for local extension workers and large-scale trials of shared agricultural IoT standards.",
    riskLevel: "Low",
    actions: ["Sign up for AI-Farming webinars", "Test IoT soil sensors", "Participate in local research surveys"],
    sourceName: "Antara News",
    sourceUrl: "https://www.antaranews.com/"
  },
  {
    title: "Malaysia Inventories Hit 7-Month Low as Palm Exports Surge",
    summary: "Global demand from India and China drives a recovery in exports, putting upward pressure on regional CPO prices.",
    articleBody: "### Supply Tightness\nWith inventories decreasing to multi-month lows, the market is entering a tightening phase. This is providing a much-needed boost to CPO futures in the Malaysian Derivatives Exchange.\n\n### Export Readiness\nFarmers are seeing better margins as export demand holds steady, though geopolitical tensions in the Middle East remain a volatility factor to watch.",
    riskLevel: "Moderate",
    actions: ["Monitor Bursa Malaysia CPO futures", "Maintain machinery for high output", "Audit plantation logistics"],
    sourceName: "Bernama",
    sourceUrl: "https://www.bernama.com/"
  },
  {
    title: "Malaysia Smart Tech Adoption Accelerates for 2026",
    summary: "New grants announced for smallholders adopting drones and blockchain-based traceability tools for global export compliance.",
    articleBody: "### Precision Growth\nTechnology is now a requirement rather than a luxury for competitive farming. The government is rolling out significant subsidies for drones used in fertilizer application and surveillance.\n\n### Transparency\nBlockchain tools are being integrated at the mill level, requiring farmers to maintain better digital records of their harvesting logs to access premium export markets.",
    riskLevel: "Moderate",
    actions: ["Apply for drone hardware grants", "Digitize harvesting records", "Verify MSPO/RSPO certifications"],
    sourceName: "Farmonaut",
    sourceUrl: "https://farmonaut.com/"
  }
]

export default function NewsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  
  const [groqKey, setGroqKey] = React.useState<string | null>(null)
  const [countryCode, setCountryCode] = React.useState<string>("MY")
  const [localArticles, setLocalArticles] = React.useState<NewsAnalysisOutput[]>([])
  const [globalArticles, setGlobalArticles] = React.useState<NewsAnalysisOutput[]>([])
  const [loading, setLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [activeArticle, setActiveArticle] = React.useState<NewsAnalysisOutput | null>(null)

  // Load configuration and cached news
  React.useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      let currentCountry = "MY"
      let currentKey = null

      if (user) {
        const { data: profile } = await supabase.from('users').select('geminiApiKey, countryCode').eq('id', user.id).single()
        if (profile?.geminiApiKey) {
          currentKey = profile.geminiApiKey
          setGroqKey(currentKey)
        }
        if (profile?.countryCode) {
          currentCountry = profile.countryCode
          setCountryCode(currentCountry)
        }
      }

      setMounted(true)
      loadCachedNews(currentCountry)
    }
    init()
  }, [])

  const loadCachedNews = (country: string) => {
    const today = new Date().toISOString().split('T')[0]
    const localKey = `tuai_news_local_${country}_${today}`
    const globalKey = `tuai_news_global_${today}`

    const cachedLocal = localStorage.getItem(localKey)
    const cachedGlobal = localStorage.getItem(globalKey)

    if (cachedLocal) {
      setLocalArticles(JSON.parse(cachedLocal))
    } else {
      // Fallback to real articles from the pool
      setLocalArticles(ARTICLE_POOL.slice(0, 3)) 
    }

    if (cachedGlobal) {
      setGlobalArticles(JSON.parse(cachedGlobal))
    } else {
      // Fallback to real articles from the pool
      setGlobalArticles(ARTICLE_POOL.slice(3))
    }
  }

  const handleRefresh = async (category: 'local' | 'global') => {
    const activeKey = groqKey || process.env.NEXT_PUBLIC_GROQ_API_KEY
    if (!activeKey) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Add your Groq key in Settings to generate fresh AI intelligence."
      })
      return
    }

    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    
    try {
      const results = await generateNewsBatch({
        category,
        countryCode,
        count: 5,
        apiKey: activeKey
      })

      if (category === 'local') {
        setLocalArticles(results)
        localStorage.setItem(`tuai_news_local_${countryCode}_${today}`, JSON.stringify(results))
      } else {
        setGlobalArticles(results)
        localStorage.setItem(`tuai_news_global_${today}`, JSON.stringify(results))
      }

      toast({ title: "Intelligence Refreshed", description: `Successfully generated ${category} news batch.` })
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "AI Generation Failed", description: "Could not fetch news updates at this time." })
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

  const NewsCard = ({ article }: { article: NewsAnalysisOutput }) => (
    <Card 
      className="rounded-[2rem] border-none shadow-lg hover:shadow-2xl transition-all group overflow-hidden bg-white cursor-pointer group flex flex-col h-full"
      onClick={() => setActiveArticle(article)}
    >
      <div className={cn("h-1.5 w-full", riskColors[article.riskLevel as keyof typeof riskColors] || "bg-primary")} />
      <CardHeader className="pb-2 p-6 flex-none">
        <div className="flex items-center justify-between mb-4">
           <div className={cn(
             "px-3 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5",
             riskColors[article.riskLevel as keyof typeof riskColors] || "bg-primary"
           )}>
             <AlertTriangle className="h-3 w-3" />
             {article.riskLevel} Risk
           </div>
           <div className="flex items-center gap-2">
             <span className="text-[9px] font-black text-slate-400 uppercase truncate max-w-[80px]">{article.sourceName || 'AI Feed'}</span>
             <Clock className="h-3 w-3 text-slate-300" />
           </div>
        </div>
        <CardTitle className="text-lg font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-4 flex-grow">
        <p className="text-xs text-muted-foreground leading-relaxed font-medium line-clamp-3">
          {article.summary}
        </p>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
          Read Dossier <ArrowRight className="h-3 w-3" />
        </div>
        {article.sourceUrl && (
          <a 
            href={article.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[9px] font-black text-slate-400 hover:text-primary underline uppercase tracking-tighter"
          >
            Source Website
          </a>
        )}
      </CardFooter>
    </Card>
  )

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Loading Intel...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 px-1 no-scrollbar animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            <Newspaper className="h-3.5 w-3.5" />
            Strategic Intelligence
          </div>
          <h2 className="text-3xl md:text-5xl font-headline font-bold text-slate-900 leading-tight">News Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Daily AI-scalped insights from regional and global markets.</p>
        </div>
      </div>

      {!groqKey && !process.env.NEXT_PUBLIC_GROQ_API_KEY && (
        <Alert className="bg-orange-50 border-orange-100 rounded-[2rem] shadow-sm p-6">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-orange-900 font-bold ml-2">Self-Provided Intelligence</AlertTitle>
          <AlertDescription className="text-orange-800 text-xs ml-2 leading-relaxed">
            To unlock daily automated news generation, please add your **Groq API Key** in your <Link href="/dashboard/settings" className="underline font-bold">Settings</Link>. 
            Static intelligence is shown as a fallback.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="local" className="space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-slate-100 rounded-[2rem]">
          <TabsList className="bg-transparent h-auto p-0 gap-2">
            <TabsTrigger value="local" className="rounded-[1.5rem] px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold text-sm">
              Local Intel
            </TabsTrigger>
            <TabsTrigger value="global" className="rounded-[1.5rem] px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold text-sm">
              Global Trends
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline"
              className="flex-1 sm:flex-none h-12 rounded-2xl bg-white border-none shadow-sm hover:shadow-md transition-all font-bold text-xs"
              onClick={() => handleRefresh("local")}
              disabled={loading}
            >
              Update Local
            </Button>
            <Button 
              variant="outline"
              className="flex-1 sm:flex-none h-12 rounded-2xl bg-white border-none shadow-sm hover:shadow-md transition-all font-bold text-xs"
              onClick={() => handleRefresh("global")}
              disabled={loading}
            >
              Update Global
            </Button>
          </div>
        </div>

        <TabsContent value="local" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localArticles.length > 0 ? (
              localArticles.map((art, idx) => <NewsCard key={idx} article={art} />)
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110">
                  <Zap className="h-10 w-10 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">No localized intel for today</p>
                <Button variant="link" onClick={() => handleRefresh("local")} className="text-primary font-bold">Try Generating Now</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="global" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {globalArticles.length > 0 ? (
              globalArticles.map((art, idx) => <NewsCard key={idx} article={art} />)
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110">
                  <Globe className="h-10 w-10 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">No global trends for today</p>
                <Button variant="link" onClick={() => handleRefresh("global")} className="text-primary font-bold">Try Generating Now</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Intelligence Dossier Dialog */}
      <Dialog open={!!activeArticle} onOpenChange={(open) => !open && setActiveArticle(null)}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] bg-white no-scrollbar p-0 overflow-hidden border-none shadow-2xl">
          {activeArticle && (
            <div className="max-h-[90vh] overflow-auto no-scrollbar">
              <div className={cn("h-4 w-full", riskColors[activeArticle.riskLevel as keyof typeof riskColors] || "bg-primary")} />
              <div className="p-8 md:p-12 space-y-8">
                <DialogHeader>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                       <TrendingUp className="h-4 w-4 text-primary" />
                       Intelligence Brief • {new Date().toLocaleDateString()}
                    </div>
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5",
                      riskColors[activeArticle.riskLevel as keyof typeof riskColors] || "bg-primary"
                    )}>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {activeArticle.riskLevel} Risk
                    </div>
                  </div>
                  <DialogTitle className="text-3xl md:text-5xl font-headline font-bold text-slate-900 leading-tight">
                    {activeArticle.title}
                  </DialogTitle>
                  <DialogDescription className="text-base md:text-xl font-medium text-slate-500 mt-8 leading-relaxed border-l-4 border-primary/20 pl-6 italic">
                    {activeArticle.summary}
                  </DialogDescription>
                </DialogHeader>

                <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-loose text-base md:text-lg py-8">
                   {activeArticle.articleBody.split('\n').map((line, i) => (
                     <p key={i} className="mb-4">{line.replace(/#/g, '')}</p>
                   ))}
                </div>

                <div className="p-8 md:p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-8">
                   <h4 className="font-headline font-bold text-xl md:text-2xl flex items-center gap-3 text-primary">
                     <Sparkles className="h-6 w-6 text-secondary fill-current" />
                     Tactical Strategy
                   </h4>
                   <div className="grid grid-cols-1 gap-4">
                      {activeArticle.actions.map((action, i) => (
                        <div key={i} className="flex gap-5 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 items-center">
                           <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-sm">
                             {i + 1}
                           </div>
                           <p className="text-sm font-bold text-slate-700 leading-relaxed">{action}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Zap className="h-3 w-3 text-yellow-500" /> Grounded via {activeArticle.sourceName || 'AI Analysis'}
                    </span>
                    {activeArticle.sourceUrl && (
                      <a 
                        href={activeArticle.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-primary underline truncate max-w-xs"
                      >
                        {activeArticle.sourceUrl}
                      </a>
                    )}
                  </div>
                  <Button variant="ghost" className="text-slate-500 font-bold text-xs hover:bg-slate-100 rounded-xl" onClick={() => setActiveArticle(null)}>
                    Close Dossier
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
