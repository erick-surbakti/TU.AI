"use client"

import * as React from "react"
import { 
  Compass, 
  Map, 
  Sprout, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Activity,
  ShieldAlert,
  TrendingUp,
  Droplets,
  Zap,
  User,
  MapPin,
  TrendingDown,
  Info,
  DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { farmSetupGuide, type FarmSetupOutput } from "@/ai/flows/farm-setup-flow"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useFirestore, useUser } from "@/firebase"
import { collection, serverTimestamp } from "firebase/firestore"
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates"

export default function FarmSetupPage() {
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<FarmSetupOutput | null>(null)
  const [step, setStep] = React.useState(1)
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()

  const [formData, setFormData] = React.useState({
    status: 'beginner' as 'beginner' | 'existing',
    basicInfo: {
      farmName: '',
      ownerName: '',
      country: 'Malaysia',
      region: '',
      address: '',
    },
    // Existing Farm Specific
    farmType: '',
    sizeValue: 0,
    sizeUnit: 'hectares',
    hasLivestock: false,
    livestockDetails: '',
    techInterest: false,
    problems: [] as string[],
    operations: {
      trackingMethod: 'no system',
      useSensors: false,
      useMachinery: false,
    },
    productionData: {
      averageYield: '',
      feedUsage: '',
      mortalityRate: '',
    },
    // Beginner Specific
    targetCrop: '',
    hasLand: false,
    motivation: '',
    // Shared
    goals: [] as string[],
    budget: 'RM 0–500',
    helpType: 'Daily alerts',
  })

  const handleProblemToggle = (problem: string) => {
    setFormData(prev => ({
      ...prev,
      problems: prev.problems.includes(problem) 
        ? prev.problems.filter(p => p !== problem)
        : [...prev.problems, problem]
    }))
  }

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  const handleStartPlanning = async () => {
    setLoading(true)
    try {
      const output = await farmSetupGuide(formData)
      setResult(output)

      if (db && user) {
        const farmsRef = collection(db, "farms")
        addDocumentNonBlocking(farmsRef, {
          ...formData,
          userId: user.uid,
          aiAnalysis: output,
          createdAt: serverTimestamp()
        })
      }

      toast({
        title: "Intelligence Generated!",
        description: formData.status === 'beginner' ? "Your Roadmap is ready." : "Farm Audit complete."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Planning Failed",
        description: "Could not generate your farm roadmap."
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
               <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">I am currently...</Label>
                  <Tabs value={formData.status} onValueChange={(v) => setFormData(p => ({...p, status: v as any}))}>
                    <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl bg-slate-100 p-1.5">
                      <TabsTrigger value="beginner" className="rounded-xl font-bold">New Farmer (Pemula)</TabsTrigger>
                      <TabsTrigger value="existing" className="rounded-xl font-bold">Existing Farm (Exist)</TabsTrigger>
                    </TabsList>
                  </Tabs>
               </div>
               <div className="space-y-2">
                 <Label>Farm Name</Label>
                 <Input 
                   placeholder="e.g. Green Fields Padi" 
                   value={formData.basicInfo.farmName}
                   onChange={(e) => setFormData(p => ({...p, basicInfo: {...p.basicInfo, farmName: e.target.value}}))}
                   className="rounded-xl h-12"
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Country</Label>
                   <Select value={formData.basicInfo.country} onValueChange={(v) => setFormData(p => ({...p, basicInfo: {...p.basicInfo, country: v}}))}>
                     <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                     <SelectContent>
                        <SelectItem value="Malaysia">Malaysia</SelectItem>
                        <SelectItem value="Indonesia">Indonesia</SelectItem>
                        <SelectItem value="Thailand">Thailand</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label>Region/State</Label>
                   <Input 
                     placeholder="e.g. Kedah" 
                     value={formData.basicInfo.region}
                     onChange={(e) => setFormData(p => ({...p, basicInfo: {...p.basicInfo, region: e.target.value}}))}
                     className="rounded-xl h-12"
                   />
                 </div>
               </div>
            </div>
            <Button onClick={nextStep} className="w-full h-14 rounded-2xl bg-primary">Next: Farm Details <ChevronRight className="ml-2 h-4 w-4" /></Button>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            {formData.status === 'existing' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Main Crop / Majority Plant</Label>
                  <Select value={formData.farmType} onValueChange={(v) => setFormData(p => ({...p, farmType: v}))}>
                    <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {['Rice / Padi', 'Vegetables', 'Fruits', 'Palm Oil', 'Rubber'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Land Area</Label>
                    <Input 
                      type="number"
                      value={formData.sizeValue}
                      onChange={(e) => setFormData(p => ({...p, sizeValue: Number(e.target.value)}))}
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select value={formData.sizeUnit} onValueChange={(v) => setFormData(p => ({...p, sizeUnit: v}))}>
                      <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hectares">Hectares</SelectItem>
                        <SelectItem value="acres">Acres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Do you have Livestock? (Cow, Chicken, etc)</Label>
                  <Tabs value={formData.hasLivestock ? "yes" : "no"} onValueChange={(v) => setFormData(p => ({...p, hasLivestock: v === "yes"}))}>
                    <TabsList className="grid grid-cols-2 h-10">
                      <TabsTrigger value="no">No</TabsTrigger>
                      <TabsTrigger value="yes">Yes</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {formData.hasLivestock && (
                    <Input 
                      placeholder="e.g. 50 Chickens, 5 Cows" 
                      value={formData.livestockDetails}
                      onChange={(e) => setFormData(p => ({...p, livestockDetails: e.target.value}))}
                      className="mt-2 rounded-xl"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>What do you want to plant/raise?</Label>
                  <Input 
                    placeholder="e.g. Padi Grade A" 
                    value={formData.targetCrop}
                    onChange={(e) => setFormData(p => ({...p, targetCrop: e.target.value}))}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Do you already have land?</Label>
                  <Tabs value={formData.hasLand ? "yes" : "no"} onValueChange={(v) => setFormData(p => ({...p, hasLand: v === "yes"}))}>
                    <TabsList className="grid grid-cols-2 h-10">
                      <TabsTrigger value="yes">Yes</TabsTrigger>
                      <TabsTrigger value="no">No (AI Scouts Needed)</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="space-y-2">
                   <Label>Interest in Tech/Robots?</Label>
                   <Checkbox checked={formData.techInterest} onCheckedChange={(v) => setFormData(p => ({...p, techInterest: !!v}))} />
                   <span className="ml-2 text-sm">I want to use robots/AI automation</span>
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-2xl">Back</Button>
              <Button onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-primary">Next: Analysis</Button>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            {formData.status === 'existing' ? (
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Operational Pain Points</Label>
                <div className="grid grid-cols-1 gap-3">
                  {['Crop disease', 'Low yield', 'Expensive fertilizer', 'Water issues', 'Labor shortage', 'High mortality rate'].map(p => (
                    <div key={p} className="flex items-center space-x-3 p-4 rounded-xl border bg-slate-50">
                      <Checkbox 
                        id={p} 
                        checked={formData.problems.includes(p)}
                        onCheckedChange={() => handleProblemToggle(p)}
                      />
                      <Label htmlFor={p} className="text-sm font-medium">{p}</Label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Why do you want to farm?</Label>
                <Textarea 
                  placeholder="e.g. To secure food for my family and reduce import reliance..."
                  value={formData.motivation}
                  onChange={(e) => setFormData(p => ({...p, motivation: e.target.value}))}
                  className="rounded-xl h-32"
                />
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-4">Goals</Label>
                <div className="grid grid-cols-1 gap-2">
                   {['Full time income', 'Side hustle', 'Food security', 'Sustainability'].map(g => (
                      <div key={g} className="flex items-center space-x-2">
                        <Checkbox checked={formData.goals.includes(g)} onCheckedChange={() => handleGoalToggle(g)} />
                        <span className="text-sm">{g}</span>
                      </div>
                   ))}
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-2xl">Back</Button>
              <Button onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-primary">Next: Data & Modal</Button>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
               {formData.status === 'existing' ? (
                 <div className="space-y-4">
                   <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Production Output (Last Season)</Label>
                   <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase">Average Yield (Kg/Metric Ton)</Label>
                        <Input value={formData.productionData.averageYield} onChange={(e) => setFormData(p => ({...p, productionData: {...p.productionData, averageYield: e.target.value}}))} className="rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase">Feed/Fertilizer Usage per month</Label>
                        <Input value={formData.productionData.feedUsage} onChange={(e) => setFormData(p => ({...p, productionData: {...p.productionData, feedUsage: e.target.value}}))} className="rounded-xl" />
                      </div>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                   <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Capital Readiness (Modal)</Label>
                   <Select value={formData.budget} onValueChange={(v) => setFormData(p => ({...p, budget: v}))}>
                    <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RM 0–500 (Small Scale)">RM 0–500 (Small Scale)</SelectItem>
                      <SelectItem value="RM 5,000–20,000 (Commercial)">RM 5,000–20,000 (Commercial)</SelectItem>
                      <SelectItem value="RM 50,000+ (Enterprise)">RM 50,000+ (Enterprise)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground italic">AI uses this to calculate seeds and tool requirements.</p>
                 </div>
               )}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-2xl">Back</Button>
              <Button onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-primary">Next: Final Step</Button>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4 text-center py-6">
               <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle2 className="h-8 w-8 text-primary" />
               </div>
               <h3 className="text-xl font-bold">Ready for Deep Intelligence</h3>
               <p className="text-sm text-muted-foreground">Clicking below will trigger Gemini Pro to analyze your {formData.status === 'beginner' ? 'roadmap' : 'audit'}.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-2xl">Back</Button>
              <Button onClick={handleStartPlanning} disabled={loading} className="flex-1 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/20">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Generate AI Analysis"}
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Compass className="h-3.5 w-3.5" />
            AI Farmer Journey
          </div>
          <h2 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">Farm Intelligence Setup</h2>
          <p className="text-muted-foreground mt-2">Professional guidance for Pemula or high-fidelity audits for Existing Farms.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="rounded-[2rem] shadow-xl border-none bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b p-8">
              <div className="flex justify-between items-center mb-4">
                 <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                   <Map className="h-5 w-5" />
                   Journey Wizard
                 </CardTitle>
                 <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">Step {step}/5</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${(step/5) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-8">
               {renderStep()}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                <Sparkles className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold">AI is performing analysis...</h3>
                <p className="text-muted-foreground">Synthesizing local data, market prices, and risk metrics.</p>
              </div>
            </div>
          ) : result ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
              {/* Health Scores for Existing */}
              {result.healthReport && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[
                     { label: 'Productivity', val: `${result.healthReport.productivityScore}%`, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                     { label: 'Efficiency', val: `${result.healthReport.costEfficiency}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                     { label: 'Disease Risk', val: result.healthReport.diseaseRisk, icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50' },
                     { label: 'Water Risk', val: result.healthReport.waterRisk, icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                   ].map((item, i) => (
                     <Card key={i} className="rounded-3xl border-none shadow-sm p-4 text-center">
                        <div className={cn("h-10 w-10 mx-auto rounded-xl flex items-center justify-center mb-2", item.bg)}>
                          <item.icon className={cn("h-5 w-5", item.color)} />
                        </div>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest text-[10px]">{item.label}</div>
                        <div className="text-xl font-black text-slate-900 mt-1">{item.val}</div>
                     </Card>
                   ))}
                </div>
              )}

              {/* Beginner Financial Estimate */}
              {result.financialEstimate && (
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 border-l-8 border-l-primary">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-1">
                       <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <DollarSign className="h-3 w-3" /> Initial Modal
                       </Label>
                       <div className="text-2xl font-black text-primary">{result.financialEstimate.initialCapital}</div>
                    </div>
                    <div className="space-y-1">
                       <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <TrendingDown className="h-3 w-3" /> OpEx (Monthly)
                       </Label>
                       <div className="text-2xl font-black text-slate-800">{result.financialEstimate.operatingExpense}</div>
                    </div>
                    <div className="space-y-1">
                       <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <TrendingUp className="h-3 w-3" /> ROI Target
                       </Label>
                       <div className="text-2xl font-black text-emerald-600">{result.financialEstimate.expectedRoiTime}</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Motivation Card */}
              <Card className="rounded-[2.5rem] border-none bg-primary text-white p-10 relative overflow-hidden shadow-2xl">
                <Sparkles className="absolute top-4 right-4 h-24 w-24 opacity-10" />
                <div className="relative z-10 space-y-4">
                  <h3 className="text-3xl font-headline font-bold">Why become a farmer?</h3>
                  <p className="text-xl text-primary-foreground/80 leading-relaxed italic">
                    "{result.motivationAI}"
                  </p>
                </div>
              </Card>

              {/* Land Scouting Options */}
              {result.landOptions && result.landOptions.length > 0 && (
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                  <CardHeader className="bg-blue-50 p-8 border-b">
                     <CardTitle className="text-xl font-bold flex items-center gap-2 text-blue-900">
                        <MapPin className="h-5 w-5" />
                        AI Land Scouting results
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-3 gap-4">
                      {result.landOptions.map((land, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 group hover:border-blue-300 transition-colors">
                           <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">{land.location}</div>
                           <div className="text-lg font-black text-slate-800">{land.priceEstimate}</div>
                           <div className="text-[10px] text-muted-foreground">{land.size}</div>
                           <div className="pt-2 border-t mt-2">
                             <p className="text-[10px] italic leading-relaxed text-slate-500">
                               "{land.suitabilityReason}"
                             </p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 p-8 border-b">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Zap className="h-5 w-5" />
                    AI Action Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-xs">
                          {i + 1}
                        </div>
                        <p className="text-sm font-bold leading-relaxed text-slate-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Roadmap */}
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-emerald-50 p-8 border-b">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                    Pathfinder Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {result.roadmap.map((stepStr, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-black">
                          {i + 1}
                        </div>
                        <p className="text-sm font-medium leading-relaxed">{stepStr}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm border-2 border-dashed rounded-[3rem] p-12 text-center gap-6 shadow-sm">
              <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center animate-bounce">
                <Compass className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-bold">Unlock Farm Intelligence</h3>
                <p className="text-muted-foreground max-w-[400px] mx-auto text-sm">
                  Complete the wizard to generate a real-time health report or beginner roadmap based on ASEAN data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
