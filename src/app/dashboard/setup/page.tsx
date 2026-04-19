"use client"

import * as React from "react"
import { 
  Compass, 
  Map, 
  Sprout, 
  Calculator, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  Landmark, 
  Globe,
  Coins,
  ChevronRight,
  ChevronLeft,
  Activity,
  ShieldAlert,
  TrendingUp,
  Droplets,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
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
    farmType: '',
    sizeValue: 0,
    sizeUnit: 'hectares',
    problems: [] as string[],
    operations: {
      trackingMethod: 'no system',
      useSensors: false,
      useMachinery: false,
    },
    productionData: {
      cropType: '',
      lastPlantingDate: '',
      averageYield: '',
      fertilizerUsage: '',
      livestockType: '',
      livestockCount: 0,
    },
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

      // Save to Firestore
      if (db && user) {
        const farmsRef = collection(db, "farms")
        addDocumentNonBlocking(farmsRef, {
          ...formData,
          userId: user.uid,
          aiReport: output.healthReport,
          createdAt: serverTimestamp()
        })
      }

      toast({
        title: "Intelligence Generated!",
        description: "Your farm roadmap and health report are ready."
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
                      <TabsTrigger value="beginner" className="rounded-xl font-bold">New Farmer</TabsTrigger>
                      <TabsTrigger value="existing" className="rounded-xl font-bold">Existing Farm</TabsTrigger>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Farm Type</Label>
                <Select value={formData.farmType} onValueChange={(v) => setFormData(p => ({...p, farmType: v}))}>
                  <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {['Rice / Padi', 'Poultry', 'Dairy', 'Vegetables', 'Fruits', 'Palm Oil'].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Land Area</Label>
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
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-2xl">Back</Button>
              <Button onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-primary">Next: Operations</Button>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Problems</Label>
              <div className="grid grid-cols-1 gap-3">
                {['Crop disease', 'Low yield', 'Expensive fertilizer', 'Water issues', 'Pest attack', 'Labor shortage'].map(p => (
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
            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-2xl">Back</Button>
              <Button onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-primary">Next: Goals</Button>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Future Goals</Label>
              <div className="grid grid-cols-1 gap-3">
                {['Increase yield', 'Reduce cost', 'Detect disease early', 'Improve automation', 'Better profit', 'Sustainability score'].map(g => (
                  <div key={g} className="flex items-center space-x-3 p-4 rounded-xl border bg-slate-50">
                    <Checkbox 
                      id={g} 
                      checked={formData.goals.includes(g)}
                      onCheckedChange={() => handleGoalToggle(g)}
                    />
                    <Label htmlFor={g} className="text-sm font-medium">{g}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-2xl">Back</Button>
              <Button onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-primary">Next: Budget</Button>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
               <div className="space-y-2">
                  <Label>Budget Readiness (Per Season)</Label>
                  <Select value={formData.budget} onValueChange={(v) => setFormData(p => ({...p, budget: v}))}>
                    <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RM 0–500">RM 0–500</SelectItem>
                      <SelectItem value="RM 500–2,000">RM 500–2,000</SelectItem>
                      <SelectItem value="RM 2,000–10,000">RM 2,000–10,000</SelectItem>
                      <SelectItem value="Enterprise budget">Enterprise budget</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label>Preferred Help Type</Label>
                  <Select value={formData.helpType} onValueChange={(v) => setFormData(p => ({...p, helpType: v}))}>
                    <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="One-time AI audit">One-time AI audit</SelectItem>
                      <SelectItem value="Daily alerts">Daily alerts</SelectItem>
                      <SelectItem value="Consultant call">Consultant call</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-2xl">Back</Button>
              <Button onClick={handleStartPlanning} disabled={loading} className="flex-1 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/20">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Run AI Farm Audit"}
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
          <p className="text-muted-foreground mt-2">Deep audit for existing farms or roadmap for beginners.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="rounded-[2rem] shadow-xl border-none bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b p-8">
              <div className="flex justify-between items-center mb-4">
                 <CardTitle className="text-xl font-bold flex items-center gap-2">
                   <Map className="h-5 w-5 text-primary" />
                   Audit Wizard
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
                <h3 className="text-2xl font-bold">AI is performing deep audit...</h3>
                <p className="text-muted-foreground">Analyzing operational efficiency and risk stressors.</p>
              </div>
            </div>
          ) : result ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
              {/* Health Scores */}
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

              {/* Motivation Card */}
              <Card className="rounded-[2.5rem] border-none bg-primary text-white p-10 relative overflow-hidden shadow-2xl">
                <Sparkles className="absolute top-4 right-4 h-24 w-24 opacity-10" />
                <div className="relative z-10 space-y-4">
                  <h3 className="text-3xl font-headline font-bold">Why become a farmer?</h3>
                  <p className="text-xl text-primary-foreground/80 leading-relaxed italic">
                    "{result.motivation}"
                  </p>
                </div>
              </Card>

              {/* Recommendations */}
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 p-8 border-b">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    AI Recommendations
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
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Pathfinder Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {result.roadmap.map((step, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-black">
                          {i + 1}
                        </div>
                        <p className="text-sm font-medium leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm border-2 border-dashed rounded-[3rem] p-12 text-center gap-6 shadow-sm">
              <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center animate-bounce">
                <Globe className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-bold">Unlock Farm Intelligence</h3>
                <p className="text-muted-foreground max-w-[400px] mx-auto text-sm">
                  Complete the audit wizard to generate a real-time health report and roadmap based on ASEAN data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
