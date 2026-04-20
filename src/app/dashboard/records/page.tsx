"use client"

import * as React from "react"
import {
  ClipboardList,
  Filter,
  Download,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Loader2,
  MoreVertical,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/supabase/client"
import { ASEAN_COUNTRIES, formatCurrency } from "@/lib/localization"
import { runFarmAudit, type FarmAuditOutput } from "@/ai/flows/farm-audit-flow"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function RecordsPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [mounted, setMounted] = React.useState(false)
  const [countryCode, setCountryCode] = React.useState("MY")
  const [geminiKey, setGeminiKey] = React.useState<string | null>(null)

  // Historical Ledger State
  const [records, setRecords] = React.useState<any[]>([])
  const [ledgerSearch, setLedgerSearch] = React.useState("")
  const [isLedgerLoading, setIsLedgerLoading] = React.useState(true)

  // Audit Form State
  const [auditForm, setAuditForm] = React.useState({
    landSize: 2.5,
    cropType: 'Rice',
    totalCosts: 1500,
    actualHarvest: 5000,
    marketPrice: 1.45, // RM/kg
    legalStatus: 'Individual' as any
  })

  // Audit Result State
  const [auditResult, setAuditResult] = React.useState<FarmAuditOutput | null>(null)
  const [isAuditing, setIsAuditing] = React.useState(false)

  React.useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('users').select('countryCode, geminiApiKey').eq('id', user.id).single()
        if (profile?.countryCode) setCountryCode(profile.countryCode)
        if (profile?.geminiApiKey) setGeminiKey(profile.geminiApiKey)

        // Fetch scan history
        const { data } = await supabase
          .from('crop_scan_results')
          .select('*')
          .eq('user_id', user.id)
          .order('scanDate', { ascending: false })
        setRecords(data || [])
      }
      setIsLedgerLoading(false)
    }
    init()
    setMounted(true)
  }, [])

  const filteredRecords = React.useMemo(() => {
    if (!records) return []
    return records.filter(r =>
      r.diseaseIdentified.toLowerCase().includes(ledgerSearch.toLowerCase())
    )
  }, [records, ledgerSearch])

  const runAudit = async () => {
    if (!geminiKey) {
      toast({ variant: "destructive", title: "API Key Required", description: "Please add your Gemini key in Settings." })
      return
    }

    setIsAuditing(true)
    try {
      const result = await runFarmAudit({
        ...auditForm,
        countryCode: countryCode,
        apiKey: geminiKey
      })
      setAuditResult(result)
      toast({ title: "Audit Complete", description: "Check the Investors tab for matches!" })
    } catch (e) {
      toast({ variant: "destructive", title: "Audit Failed", description: "Please try again later." })
    } finally {
      setIsAuditing(false)
    }
  }

  // Calculated Real-time KPIs
  const revenue = auditForm.actualHarvest * auditForm.marketPrice
  const profit = revenue - auditForm.totalCosts
  const yieldPerHa = auditForm.actualHarvest / auditForm.landSize
  const costPerHa = auditForm.totalCosts / auditForm.landSize

  if (!mounted) return null

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 px-1 no-scrollbar animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-3">
            <ShieldCheck className="h-3.5 w-3.5" /> Intelligence Verified
          </div>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">Farm Audit & Investor Hub</h2>
          <p className="text-muted-foreground font-medium mt-1">Audit your performance, track history, and scale with real investment intelligence.</p>
        </div>
      </div>

      <Tabs defaultValue="audit" className="space-y-8">
        <TabsList className="bg-slate-100 p-1.5 rounded-[1.5rem] w-full md:w-auto h-auto flex flex-col md:flex-row gap-1">
          <TabsTrigger value="audit" className="rounded-2xl px-8 py-3 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md">
            Farm Audit
          </TabsTrigger>
          <TabsTrigger value="investors" className="rounded-2xl px-8 py-3 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md">
            Find Investors
          </TabsTrigger>
          <TabsTrigger value="ledger" className="rounded-2xl px-8 py-3 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md">
            Health Ledger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Side */}
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/80 p-8 border-b">
                <CardTitle className="text-xl font-bold">Manual Audit Entry</CardTitle>
                <CardDescription>Enter your latest harvest and expense data below.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Land Size (Ha)</label>
                      <Input
                        type="number"
                        value={auditForm.landSize}
                        onChange={(e) => setAuditForm({ ...auditForm, landSize: Number(e.target.value) })}
                        className="h-12 rounded-xl bg-slate-50 border-none shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Main Crop</label>
                      <Select value={auditForm.cropType} onValueChange={(v) => setAuditForm({ ...auditForm, cropType: v })}>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none shadow-inner">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Rice">Padi / Rice</SelectItem>
                          <SelectItem value="Oil Palm">Oil Palm</SelectItem>
                          <SelectItem value="Corn">Corn</SelectItem>
                          <SelectItem value="Rubber">Rubber</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Harvest Weight (kg)</label>
                    <Input
                      type="number"
                      value={auditForm.actualHarvest}
                      onChange={(e) => setAuditForm({ ...auditForm, actualHarvest: Number(e.target.value) })}
                      className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold text-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Op. Expenses ({ASEAN_COUNTRIES[countryCode]?.currency.symbol})</label>
                    <Input
                      type="number"
                      value={auditForm.totalCosts}
                      onChange={(e) => setAuditForm({ ...auditForm, totalCosts: Number(e.target.value) })}
                      className="h-12 rounded-xl bg-slate-100/50 border-none shadow-inner"
                    />
                  </div>

                  <div className="space-y-2 pt-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Legal Entity Status</label>
                    <Select value={auditForm.legalStatus} onValueChange={(v) => setAuditForm({ ...auditForm, legalStatus: v })}>
                      <SelectTrigger className="h-14 rounded-2xl bg-primary/5 border-primary/20 text-primary font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual">Individual Farmer</SelectItem>
                        <SelectItem value="Cooperative">Village Cooperative</SelectItem>
                        <SelectItem value="Registered Company">Private Limited (Sdn Bhd/PT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={runAudit}
                    disabled={isAuditing}
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 active:scale-95 transition-all mt-4"
                  >
                    {isAuditing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                    Generate AI Audit
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Side */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <Card className="rounded-[2rem] border-none shadow-xl bg-white p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <Badge className="bg-emerald-500 text-white border-none rounded-full px-4 py-1 text-xs font-bold">ROI POSITIVE</Badge>
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimated Net Profit</h4>
                  <div className="text-4xl font-headline font-bold text-slate-800">{formatCurrency(profit, countryCode)}</div>
                  <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                    +12.5% vs Last Period <Sparkles className="h-3 w-3" />
                  </p>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-xl bg-white p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <Badge className="bg-blue-500 text-white border-none rounded-full px-4 py-1 text-xs font-bold">HIGH EFFICIENCY</Badge>
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Yield Efficiency</h4>
                  <div className="text-4xl font-headline font-bold text-slate-800">{(yieldPerHa / 1000).toFixed(1)} <span className="text-lg">t/ha</span></div>
                  <p className="text-xs text-blue-600 font-bold mt-2">Optimal range found for {auditForm.cropType}</p>
                </Card>
              </div>

              {auditResult ? (
                <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white p-8 md:p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-all">
                    <Zap className="h-48 w-48 text-yellow-300" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h3 className="text-2xl font-headline font-bold flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-yellow-400" />
                        Intelligence Audit Report
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-[9px] font-black uppercase text-white/50 tracking-widest">Efficiency</div>
                          <div className="text-xl font-bold text-emerald-400">{auditResult.efficiencyScore}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[9px] font-black uppercase text-white/50 tracking-widest">Readiness</div>
                          <div className="text-xl font-bold text-blue-400">{auditResult.readinessScore}%</div>
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-yellow-400 prose-strong:text-white prose-p:text-slate-300 leading-relaxed font-medium">
                      {auditResult.analysisMarkdown}
                    </div>

                    <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60">
                        <Target className="h-4 w-4" /> Benchmark: {auditResult.benchmarks}
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          className="rounded-xl border-white/20 text-white hover:bg-white/10 font-bold text-xs h-12"
                          onClick={() => {
                            const tabTrigger = document.querySelector('[value="investors"]') as HTMLElement
                            tabTrigger?.click()
                          }}
                        >
                          Scout Investors
                        </Button>
                        <Button
                          className="rounded-xl bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-black text-xs px-6 h-12 shadow-lg shadow-yellow-400/20"
                          onClick={() => {
                            window.open(`https://wa.me/?text=Hi TUAI Investor Desk, I have completed my Farm Audit with an efficiency score of ${auditResult.efficiencyScore}%. I want to apply for investment for my ${auditForm.cropType} farm.`, "_blank")
                          }}
                        >
                          Verify via WhatsApp <Zap className="h-4 w-4 ml-2 fill-current" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Loader2 className={cn("h-8 w-8 text-slate-300", isAuditing && "animate-spin text-primary")} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-400">Interactive Intelligence Awaiting Input</h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-2">Fill the audit entry form and click 'Generate' to see your performance analysis vs national benchmarks.</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="investors" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-headline font-bold text-primary">Strategic Capital Matchmaking</h3>
              <p className="text-muted-foreground font-medium">Bespoke investment matching grounded in REAL-WORLD {ASEAN_COUNTRIES[countryCode]?.name} capital markets.</p>
            </div>

            {!auditResult ? (
              <Card className="rounded-[3rem] p-20 text-center space-y-6 bg-slate-50 border-none">
                <div className="h-20 w-20 rounded-[2rem] bg-white flex items-center justify-center shadow-lg mx-auto">
                  <Users className="h-10 w-10 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-slate-500">No Readiness Data Available</h4>
<<<<<<< HEAD
                  <p className="text-sm text-slate-400">If you need investor, you can fill the form that we had to get started on your investment journey.</p>
                </div>
                <Button
                  onClick={() => {
                    window.open('https://tuai-form.vercel.app/', '_blank')
                  }}
                  className="rounded-2xl h-14 px-10 font-bold bg-primary"
                >
                  Go to Form
=======
                  <p className="text-sm text-slate-400">You must run a Farm Audit first to unlock the Investor Matchmaking engine.</p>
                </div>
                <Button
                  onClick={() => {
                    const tabTrigger = document.querySelector('[value="audit"]') as HTMLElement
                    tabTrigger?.click()
                  }}
                  className="rounded-2xl h-14 px-10 font-bold bg-primary"
                >
                  Go to
>>>>>>> 4d34a26ab06acff10245004f1aa72ead216eaf79
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {auditResult.investorMatches.map((investor, i) => (
                  <Card key={i} className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden p-8 flex flex-col md:flex-row gap-8 hover:shadow-2xl transition-all group">
                    <div className="h-20 w-20 rounded-[1.5rem] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Building2 className="h-10 w-10" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none rounded-md px-2 py-0 text-[9px] font-black uppercase mb-1">
                            {investor.type}
                          </Badge>
                          <h4 className="text-2xl font-headline font-bold text-slate-800">{investor.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button asChild size="icon" variant="outline" className="h-10 w-10 rounded-xl">
                            <a href={investor.link} target="_blank" rel="noopener noreferrer">
                              <ArrowRight className="h-5 w-5" />
                            </a>
                          </Button>
                          <Button
                            className="rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest px-6 h-10 shadow-md active:scale-95 transition-all"
                            onClick={() => {
                              toast({
                                title: "Application Initiated",
                                description: "Audit packet generated. Please check your instructions below."
                              })
                            }}
                          >
                            Start Application
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-4">
                        "{investor.description}"
                      </p>
                    </div>
                  </Card>
                ))}

                <Card className="rounded-[2rem] border border-dashed border-primary/30 bg-primary/5 p-8 md:p-10 text-center space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-primary">Investor Desk Final Submission</h4>
                    <p className="text-sm text-slate-600 max-w-xl mx-auto font-medium">
                      To finalize your match with these investors, please email your generated **Audit ID** and **Farm ID** to
                      <span className="font-bold text-primary mx-1 underline cursor-pointer">investor-desk@tu.ai</span>.
                      Our team will verify your efficiency scores and contact you via **WhatsApp** within 24 hours to begin the funding process.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" className="rounded-2xl h-14 px-10 bg-primary font-black text-xs uppercase tracking-widest w-full sm:w-auto" asChild>
                      <a href="mailto:salwanettayumna@gmail.com?subject=Investment Application: Farm Audit Verified">
                        Send Email Dossier
                      </a>
                    </Button>
                    <Button variant="outline" size="lg" className="rounded-2xl h-14 px-10 border-emerald-200 text-emerald-600 font-black text-xs uppercase tracking-widest w-full sm:w-auto" asChild>
                      <a href="https://wa.me/?text=Hi TUAI Team, I've completed my Farm Audit and I'm ready to connect with investors. My Efficiency Score is verified." target="_blank" rel="noopener noreferrer">
                        WhatsApp Verification
                      </a>
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden bg-white">
            <CardHeader className="border-b bg-slate-50/50 p-4 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold">Historical Health Ledger</CardTitle>
                  <CardDescription>Records of your past AI crop scans and diagnostic history.</CardDescription>
                </div>
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search scans..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="pl-9 rounded-xl border-none bg-white shadow-inner h-11 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLedgerLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Syncing Records...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-black text-[10px] uppercase tracking-widest pl-8">Date</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Diagnosis</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest hidden sm:table-cell text-center">Confidence</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest pr-8 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id} className="group hover:bg-slate-50 transition-colors border-b">
                          <TableCell className="pl-8 text-[11px] font-bold text-slate-500">
                            {new Date(record.scanDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-slate-800 text-sm">{record.diseaseIdentified}</div>
                            <div className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1 uppercase font-black">AI Diagnosis Log</div>
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell">
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${record.confidenceScore}%` }} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400">{record.confidenceScore}%</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full bg-emerald-50 text-emerald-600 border-none px-3 text-[9px] font-black uppercase">
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-8 text-right">
                            <Button variant="ghost" size="icon" className="rounded-xl">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}