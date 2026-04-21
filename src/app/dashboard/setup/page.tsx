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
  MapPin,
  TrendingDown,
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
import { createClient } from "@/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

import { ASEAN_COUNTRIES, getRegionalContext } from "@/lib/localization"
import { logPathfinder } from "@/lib/lib-activity-logger"

type BudgetTier = "small" | "commercial" | "enterprise"

type BudgetRange = {
  small: { min: number; max: number }
  commercial: { min: number; max: number }
  enterprise: { min: number }
}

const BUDGET_RANGES: Record<string, BudgetRange> = {
  BN: {
    small: { min: 0, max: 200 },
    commercial: { min: 2000, max: 8000 },
    enterprise: { min: 20000 },
  },
  KH: {
    small: { min: 0, max: 600000 },
    commercial: { min: 6000000, max: 24000000 },
    enterprise: { min: 60000000 },
  },
  ID: {
    small: { min: 0, max: 2000000 },
    commercial: { min: 20000000, max: 80000000 },
    enterprise: { min: 200000000 },
  },
  LA: {
    small: { min: 0, max: 1000000 },
    commercial: { min: 10000000, max: 40000000 },
    enterprise: { min: 100000000 },
  },
  MY: {
    small: { min: 0, max: 500 },
    commercial: { min: 5000, max: 20000 },
    enterprise: { min: 50000 },
  },
  MM: {
    small: { min: 0, max: 100000 },
    commercial: { min: 1000000, max: 4000000 },
    enterprise: { min: 10000000 },
  },
  PH: {
    small: { min: 0, max: 6000 },
    commercial: { min: 60000, max: 240000 },
    enterprise: { min: 600000 },
  },
  SG: {
    small: { min: 0, max: 200 },
    commercial: { min: 2000, max: 8000 },
    enterprise: { min: 20000 },
  },
  TH: {
    small: { min: 0, max: 4000 },
    commercial: { min: 40000, max: 160000 },
    enterprise: { min: 400000 },
  },
  VN: {
    small: { min: 0, max: 3000000 },
    commercial: { min: 30000000, max: 120000000 },
    enterprise: { min: 300000000 },
  },
}

function getCountryCodeFromName(countryName: string): string {
  const found = Object.values(ASEAN_COUNTRIES).find((c) => c.name === countryName)
  return found?.code || "MY"
}

function getBudgetTier(value: string): BudgetTier {
  const normalized = value.toLowerCase()
  if (normalized.includes("enterprise")) return "enterprise"
  if (normalized.includes("commercial") || normalized.includes("com")) return "commercial"
  if (value.includes("50,000") || value.includes("50.000") || normalized.includes("50k")) return "enterprise"
  if (value.includes("5,000") || value.includes("5.000") || normalized.includes("5k")) return "commercial"
  return "small"
}

function formatBudgetAmount(amount: number, countryCode: string): string {
  const config = ASEAN_COUNTRIES[countryCode] || ASEAN_COUNTRIES["MY"]
  const formatted = amount.toLocaleString("en-US")
  return config.currency.symbolOnLeft
    ? `${config.currency.symbol} ${formatted}`
    : `${formatted} ${config.currency.symbol}`
}

function formatBudgetByTier(countryCode: string, tier: BudgetTier): string {
  const ranges = BUDGET_RANGES[countryCode] || BUDGET_RANGES.MY
  if (tier === "commercial") {
    return `${formatBudgetAmount(ranges.commercial.min, countryCode)}-${formatBudgetAmount(ranges.commercial.max, countryCode)} (Commercial)`
  }
  if (tier === "enterprise") {
    return `${formatBudgetAmount(ranges.enterprise.min, countryCode)}+ (Enterprise)`
  }
  return `${formatBudgetAmount(ranges.small.min, countryCode)}-${formatBudgetAmount(ranges.small.max, countryCode)} (Small Scale)`
}

export default function FarmSetupPage() {
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<FarmSetupOutput | null>(null)
  const [step, setStep] = React.useState(1)
  const [mounted, setMounted] = React.useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const [user, setUser] = React.useState<any>(null)
  const [geminiKey, setGeminiKey] = React.useState<string | null>(null)
  const [countryCode, setCountryCode] = React.useState<string>("MY")
  const currentCountryConfig = ASEAN_COUNTRIES[countryCode] || ASEAN_COUNTRIES["MY"]
  
  const [formErrors, setFormErrors] = React.useState({
    landArea: '',
    averageYield: '',
    feedUsage: ''
  })
  
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
    targetCrop: '',
    hasLand: false,
    motivation: '',
    goals: [] as string[],
    budget: formatBudgetByTier("MY", "small"),
    helpType: 'Daily alerts',
    sizeValueString: '', // For storing the string version
  })

  React.useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase.from('users').select('geminiApiKey, countryCode').eq('id', user.id).single()
        if (profile?.geminiApiKey) setGeminiKey(profile.geminiApiKey)
        if (profile?.countryCode) {
          const code = profile.countryCode
          setCountryCode(code)
          const config = ASEAN_COUNTRIES[code] || ASEAN_COUNTRIES["MY"]
          setFormData(prev => ({
            ...prev,
            basicInfo: {
              ...prev.basicInfo,
              country: config.name
            },
            budget: formatBudgetByTier(code, getBudgetTier(prev.budget))
          }))
        }
      }
      setMounted(true)
    }
    init()
  }, [])

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

  const validateNumericInput = (value: string, fieldName: 'landArea' | 'averageYield' | 'feedUsage') => {
    // Check if value is negative or starts with minus
    if (value.includes('-')) {
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: '❌ Negative values are not allowed. Enter 0 or higher.'
      }))
      // Return sanitized version without the minus
      return value.replace(/[^\d.]/g, '')
    }
    
    // Check for letters or invalid symbols (anything that's not digit or decimal point)
    if (/[^\d.]/.test(value) && value !== '') {
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: '❌ Only numbers (0-9) and decimal point are allowed.'
      }))
      // Return sanitized version
      return value.replace(/[^\d.]/g, '')
    }

    // Clear error if valid
    setFormErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }))
    
    return value
  }

  const handleStartPlanning = async () => {
    setLoading(true)
    if (!geminiKey) {
      toast({
        variant: "destructive",
        title: "Missing API Key",
        description: "Please add your Gemini API Key in Settings first."
      })
      setLoading(false)
      return
    }

    try {
      const output = await farmSetupGuide({ ...formData, apiKey: geminiKey, countryCode: countryCode })
      setResult(output)

      await logPathfinder(
        formData.basicInfo.farmName || "AI Planned Farm",
        formData.farmType || formData.targetCrop || "General farming",
        output.roadmap?.[0] || "Roadmap generated"
      )

      if (user) {
        supabase.from('farms').insert({
          user_id: user.id,
          name: formData.basicInfo.farmName || "AI Planned Farm",
          location: formData.basicInfo.region,
          croptype: formData.farmType || formData.targetCrop,
          data: {
            ...formData,
            aiAnalysis: output
          }
        }).then(({ error }) => {
          if (error) console.error("Error saving farm data", error)
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

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        // Basic info validation
        if (!formData.basicInfo.farmName.trim()) {
          toast({ variant: "destructive", title: "Farm Name is required" })
          return false
        }
        if (!formData.basicInfo.country.trim()) {
          toast({ variant: "destructive", title: "Country is required" })
          return false
        }
        if (!formData.basicInfo.region.trim()) {
          toast({ variant: "destructive", title: "Region/State is required" })
          return false
        }
        return true

      case 2:
        if (formData.status === 'existing') {
          // Existing farm validation
          if (!formData.farmType.trim()) {
            toast({ variant: "destructive", title: "Main Crop/Plant Type is required" })
            return false
          }
          if (formData.sizeValue <= 0) {
            toast({ variant: "destructive", title: "Land Area must be greater than 0" })
            return false
          }
          if (formData.hasLivestock && !formData.livestockDetails.trim()) {
            toast({ variant: "destructive", title: "Please specify your livestock details" })
            return false
          }
        } else {
          // New farmer validation
          if (!formData.targetCrop.trim()) {
            toast({ variant: "destructive", title: "Please specify what you want to plant/raise" })
            return false
          }
        }
        return true

      case 3:
        if (formData.status === 'existing') {
          // Existing farm: at least one problem must be selected
          if (formData.problems.length === 0) {
            toast({ variant: "destructive", title: "Please select at least one pain point" })
            return false
          }
        } else {
          // New farmer: motivation and at least one goal
          if (!formData.motivation.trim()) {
            toast({ variant: "destructive", title: "Please describe your farming motivation" })
            return false
          }
          if (formData.goals.length === 0) {
            toast({ variant: "destructive", title: "Please select at least one goal" })
            return false
          }
        }
        return true

      case 4:
        if (formData.status === 'existing') {
          // Existing farm: production data
          if (!formData.productionData.averageYield || Number(formData.productionData.averageYield) <= 0) {
            toast({ variant: "destructive", title: "Average Yield must be a positive number" })
            return false
          }
          if (!formData.productionData.feedUsage || Number(formData.productionData.feedUsage) <= 0) {
            toast({ variant: "destructive", title: "Monthly Usage must be a positive number" })
            return false
          }
        }
        return true

      default:
        return true
    }
  }

  if (!mounted) return null

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-6">
               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Select Your Path</Label>
                  <Tabs 
                    value={formData.status} 
                    onValueChange={(v) => setFormData(p => ({...p, status: v as any}))}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl bg-slate-100 p-1 shadow-inner">
                      <TabsTrigger value="beginner" className="rounded-xl font-bold text-xs">
                        New Farmer
                      </TabsTrigger>
                      <TabsTrigger value="existing" className="rounded-xl font-bold text-xs">
                        Existing Farm
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
               </div>
               <div className="space-y-2">
                 <Label className="font-bold text-slate-700">Farm Name</Label>
                 <Input 
                   placeholder="e.g. Green Fields Padi" 
                   value={formData.basicInfo.farmName}
                   onChange={(e) => setFormData(p => ({...p, basicInfo: {...p.basicInfo, farmName: e.target.value}}))}
                   className="rounded-xl h-12 bg-white border-slate-200"
                 />
               </div>
               <div className="grid grid-cols-1 gap-4">
                 <div className="space-y-2">
                   <Label className="font-bold text-slate-700">Country</Label>
                   <Select
                     value={formData.basicInfo.country}
                     onValueChange={(v) => {
                       const nextCode = getCountryCodeFromName(v)
                       const nextConfig = ASEAN_COUNTRIES[nextCode] || ASEAN_COUNTRIES["MY"]
                       setCountryCode(nextCode)
                       setFormData(p => ({
                         ...p,
                         basicInfo: { ...p.basicInfo, country: v },
                         budget: formatBudgetByTier(nextCode, getBudgetTier(p.budget)),
                       }))
                     }}
                   >
                     <SelectTrigger className="rounded-xl h-12 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                     <SelectContent>
                        {Object.values(ASEAN_COUNTRIES).map(c => (
                          <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                        ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label className="font-bold text-slate-700">Region/State</Label>
                   <Input 
                     placeholder="e.g. Kedah" 
                     value={formData.basicInfo.region}
                     onChange={(e) => setFormData(p => ({...p, basicInfo: {...p.basicInfo, region: e.target.value}}))}
                     className="rounded-xl h-12 bg-white border-slate-200"
                   />
                 </div>
               </div>
            </div>
            <Button onClick={() => validateStep(1) && nextStep()} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg active:scale-95 transition-all">
              Continue <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {formData.status === 'existing' ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Main Crop / Plant Type</Label>
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
                    <Label className="font-bold text-slate-700">Land Area</Label>
                    <Input 
                      type="text"
                      value={formData.sizeValueString}
                      onChange={(e) => {
                        const sanitized = validateNumericInput(e.target.value, 'landArea')
                        setFormData(p => ({...p, sizeValueString: sanitized, sizeValue: Number(sanitized) || 0}))
                      }}
                      className={`rounded-xl h-12 ${formErrors.landArea ? 'border-red-500 border-2' : ''}`}
                      placeholder="e.g. 5.5"
                    />
                    {formErrors.landArea && <p className="text-sm text-red-600 font-semibold">{formErrors.landArea}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Unit</Label>
                    <Select value={formData.sizeUnit} onValueChange={(v) => setFormData(p => ({...p, sizeUnit: v}))}>
                      <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hectares">Hectares</SelectItem>
                        <SelectItem value="acres">Acres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border">
                  <Label className="font-bold text-slate-700">Do you have Livestock?</Label>
                  <Tabs value={formData.hasLivestock ? "yes" : "no"} onValueChange={(v) => setFormData(p => ({...p, hasLivestock: v === "yes"}))}>
                    <TabsList className="grid grid-cols-2 h-10 bg-white border p-1 rounded-lg">
                      <TabsTrigger value="no" className="rounded-md">No</TabsTrigger>
                      <TabsTrigger value="yes" className="rounded-md">Yes</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {formData.hasLivestock && (
                    <Input 
                      placeholder="e.g. 50 Chickens, 5 Cows" 
                      value={formData.livestockDetails}
                      onChange={(e) => setFormData(p => ({...p, livestockDetails: e.target.value}))}
                      className="mt-2 rounded-xl bg-white h-12"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">What do you want to plant/raise?</Label>
                  <Input 
                    placeholder="e.g. Padi Grade A" 
                    value={formData.targetCrop}
                    onChange={(e) => setFormData(p => ({...p, targetCrop: e.target.value}))}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border">
                  <Label className="font-bold text-slate-700">Do you already have land?</Label>
                  <Tabs value={formData.hasLand ? "yes" : "no"} onValueChange={(v) => setFormData(p => ({...p, hasLand: v === "yes"}))}>
                    <TabsList className="grid grid-cols-2 h-10 bg-white border p-1 rounded-lg">
                      <TabsTrigger value="yes" className="rounded-md">Yes</TabsTrigger>
                      <TabsTrigger value="no" className="rounded-md">No (AI Scout)</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-2xl border bg-primary/5">
                   <Checkbox id="techInterest" checked={formData.techInterest} onCheckedChange={(v) => setFormData(p => ({...p, techInterest: !!v}))} className="mt-1" />
                   <Label htmlFor="techInterest" className="text-sm font-medium text-slate-700 leading-relaxed cursor-pointer">
                      <strong>AI Interest:</strong> Use robots to minimize labor.
                   </Label>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-2xl font-bold">Back</Button>
              <Button onClick={() => validateStep(2) && nextStep()} className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold">Next</Button>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {formData.status === 'existing' ? (
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Current Pain Points</Label>
                <div className="grid grid-cols-1 gap-2">
                  {['Crop disease', 'Low yield', 'Expensive fertilizer', 'Water issues', 'Labor shortage', 'High mortality'].map(p => (
                    <div key={p} className={cn(
                      "flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer",
                      formData.problems.includes(p) ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-slate-200"
                    )} onClick={() => handleProblemToggle(p)}>
                      <Checkbox 
                        id={p} 
                        checked={formData.problems.includes(p)}
                        onCheckedChange={() => handleProblemToggle(p)}
                      />
                      <Label htmlFor={p} className="text-sm font-bold text-slate-700 flex-1 cursor-pointer truncate">{p}</Label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Why start farming?</Label>
                  <Textarea 
                    placeholder="e.g. To secure food for my family..."
                    value={formData.motivation}
                    onChange={(e) => setFormData(p => ({...p, motivation: e.target.value}))}
                    className="rounded-xl h-24 resize-none"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Your Goals</Label>
                  <div className="grid grid-cols-1 gap-2">
                     {['Full time income', 'Side hustle', 'Food security', 'Sustainability'].map(g => (
                        <div key={g} className={cn(
                          "flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer",
                          formData.goals.includes(g) ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-slate-200"
                        )} onClick={() => handleGoalToggle(g)}>
                          <Checkbox checked={formData.goals.includes(g)} onCheckedChange={() => handleGoalToggle(g)} />
                          <Label className="text-sm font-bold text-slate-700 flex-1 cursor-pointer">{g}</Label>
                        </div>
                     ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-2xl font-bold">Back</Button>
              <Button onClick={() => validateStep(3) && nextStep()} className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold">Next</Button>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-5">
               {formData.status === 'existing' ? (
                 <div className="space-y-5">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Production Data</Label>
                   <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-600">Avg Yield (Kg/Metric Ton)</Label>
                        <Input 
                          placeholder="e.g. 5.5 tons/hectare"
                          value={formData.productionData.averageYield} 
                          onChange={(e) => {
                            const sanitized = validateNumericInput(e.target.value, 'averageYield')
                            setFormData(p => ({...p, productionData: {...p.productionData, averageYield: sanitized}}))
                          }} 
                          className={`rounded-xl h-12 ${formErrors.averageYield ? 'border-red-500 border-2' : ''}`}
                        />
                        {formErrors.averageYield && <p className="text-sm text-red-600 font-semibold">{formErrors.averageYield}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-600">Monthly Usage (Feed/Fertilizer)</Label>
                        <Input 
                          placeholder="e.g. 500kg NPK"
                          value={formData.productionData.feedUsage} 
                          onChange={(e) => {
                            const sanitized = validateNumericInput(e.target.value, 'feedUsage')
                            setFormData(p => ({...p, productionData: {...p.productionData, feedUsage: sanitized}}))
                          }} 
                          className={`rounded-xl h-12 ${formErrors.feedUsage ? 'border-red-500 border-2' : ''}`}
                        />
                        {formErrors.feedUsage && <p className="text-sm text-red-600 font-semibold">{formErrors.feedUsage}</p>}
                      </div>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-5">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Budget & Modal</Label>
                   <div className="space-y-3">
                     <Select value={formData.budget} onValueChange={(v) => setFormData(p => ({...p, budget: v}))}>
                      <SelectTrigger className="rounded-xl h-14 bg-white border-slate-200 px-4 font-bold text-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={formatBudgetByTier(countryCode, "small")}>{formatBudgetByTier(countryCode, "small")}</SelectItem>
                        <SelectItem value={formatBudgetByTier(countryCode, "commercial")}>{formatBudgetByTier(countryCode, "commercial")}</SelectItem>
                        <SelectItem value={formatBudgetByTier(countryCode, "enterprise")}>{formatBudgetByTier(countryCode, "enterprise")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground font-medium italic">
                      AI uses this to calculate seeds and tools.
                    </p>
                   </div>
                 </div>
               )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-2xl font-bold">Back</Button>
              <Button onClick={() => validateStep(4) && nextStep()} className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold">Review</Button>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-5 text-center py-8 bg-emerald-50/50 rounded-3xl border border-emerald-100">
               <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                 <CheckCircle2 className="h-8 w-8 text-white" />
               </div>
               <div className="space-y-2 px-4">
                 <h3 className="text-xl font-headline font-bold text-slate-900">Analysis Ready</h3>
                 <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    AI will now synthesize your data and generate your professional roadmap.
                 </p>
               </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-2xl font-bold">Back</Button>
              <Button onClick={handleStartPlanning} disabled={loading} className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold shadow-xl active:scale-95 transition-all">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Generate Report"
                )}
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 px-1">
      <div className="flex flex-col gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-3">
            <Compass className="h-3 w-3" />
            AI Pathfinder
          </div>
          <h2 className="text-3xl font-headline font-bold text-slate-900 leading-tight">Farm Intelligence</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium italic">Audit your farm or start a new path to zero dependency.</p>
        </div>
      </div>

      {!geminiKey && (
        <Alert variant="destructive" className="rounded-3xl bg-destructive/10 border-none p-6 animate-in slide-in-from-top-4 duration-500">
           <AlertCircle className="h-5 w-5 text-destructive" />
           <AlertTitle className="text-destructive font-bold">AI Engine Offline</AlertTitle>
           <AlertDescription className="text-destructive/80 text-xs">
             You need an active Gemini API Key to use the Pathfinder. 
             <Link href="/dashboard/settings" className="ml-2 underline font-bold">Go to Settings →</Link>
           </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <Card className="rounded-[2.5rem] shadow-2xl border-none bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b p-6 space-y-3">
              <div className="flex justify-between items-center">
                 <CardTitle className="text-lg font-headline font-bold text-primary flex items-center gap-2">
                   <Map className="h-5 w-5" />
                   Setup Wizard
                 </CardTitle>
                 <div className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                   Step {step}/5
                 </div>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-700 ease-in-out" 
                  style={{ width: `${(step/5) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
               {renderStep()}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6 animate-pulse bg-white/50 border-2 border-dashed rounded-[2.5rem] px-6">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                <Sparkles className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-headline font-bold text-slate-900">Analyzing Your Data...</h3>
                <p className="text-sm text-muted-foreground font-medium max-w-[350px] mx-auto leading-relaxed">
                  Synthesizing regional price shocks, production capacity, and supply chain risks.
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
              {result.healthReport && (
                <div className="grid grid-cols-2 gap-4">
                   {[
                     { label: 'Productivity', val: `${result.healthReport.productivityScore}%`, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                     { label: 'Cost Efficiency', val: `${result.healthReport.costEfficiency}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                     { label: 'Disease Risk', val: result.healthReport.diseaseRisk, icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50' },
                     { label: 'Water Risk', val: result.healthReport.waterRisk, icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                   ].map((item, i) => (
                     <Card key={i} className="rounded-3xl border-none shadow-xl p-6 text-center bg-white transition-transform hover:scale-[1.02]">
                        <div className={cn("h-12 w-12 mx-auto rounded-2xl flex items-center justify-center mb-3", item.bg)}>
                          <item.icon className={cn("h-6 w-6", item.color)} />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</div>
                        <div className="text-lg font-black text-slate-900 mt-1">{item.val}</div>
                     </Card>
                   ))}
                </div>
              )}

              {result.financialEstimate && (
                <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white p-8 border-l-[12px] border-l-primary relative overflow-hidden group">
                  <DollarSign className="absolute -right-8 -bottom-8 h-40 w-40 text-slate-50 group-hover:scale-110 transition-transform duration-1000" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <div className="space-y-1">
                       <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                         <DollarSign className="h-4 w-4" /> Capital Required
                       </Label>
                       <div className="text-2xl font-black text-primary leading-none">{result.financialEstimate.initialCapital}</div>
                    </div>
                    <div className="space-y-1">
                       <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                         <TrendingDown className="h-4 w-4" /> Monthly Opex
                       </Label>
                       <div className="text-2xl font-black text-slate-800 leading-none">{result.financialEstimate.operatingExpense}</div>
                    </div>
                    <div className="space-y-1">
                       <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                         <TrendingUp className="h-4 w-4" /> Est. ROI
                       </Label>
                       <div className="text-2xl font-black text-emerald-600 leading-none">{result.financialEstimate.expectedRoiTime}</div>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="rounded-[2.5rem] border-none bg-primary text-white p-10 relative overflow-hidden shadow-2xl">
                <Sparkles className="absolute -top-6 -right-6 h-32 w-32 opacity-10 animate-pulse" />
                <div className="relative z-10 space-y-5">
                  <h3 className="text-2xl font-headline font-bold">AI Motivation</h3>
                  <p className="text-lg text-primary-foreground font-medium leading-relaxed italic opacity-95">
                    "{result.motivationAI}"
                  </p>
                </div>
              </Card>

              {result.landOptions && (
                <Card className="rounded-[2.5rem] shadow-2xl border-none bg-white overflow-hidden">
                  <CardHeader className="bg-blue-50 p-8 border-b">
                     <CardTitle className="text-xl font-headline font-bold flex items-center gap-3 text-blue-900">
                        <MapPin className="h-6 w-6 text-blue-600" />
                        AI Land Scout
                     </CardTitle>
                     <CardDescription className="text-blue-800/70 font-medium">Recommended plots based on local soil data & market prices.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 gap-6">
                      {result.landOptions.map((land, i) => (
                        <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 hover:border-blue-300 hover:bg-white transition-all shadow-sm group">
                           <div className="flex justify-between items-start">
                             <div className="text-xs font-black text-blue-600 uppercase tracking-widest">{land.location}</div>
                             <Badge variant="outline" className="bg-white text-[10px] rounded-lg h-6 px-3">{land.size}</Badge>
                           </div>
                           <div className="text-2xl font-black text-slate-800">{land.priceEstimate}</div>
                           <p className="text-sm italic leading-relaxed text-slate-500 font-medium border-l-4 border-blue-100 pl-4">
                             {land.suitabilityReason}
                           </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="rounded-[2.5rem] shadow-2xl border-none bg-white overflow-hidden">
                <CardHeader className="bg-primary/5 p-8 border-b">
                  <CardTitle className="text-xl font-headline font-bold flex items-center gap-3 text-primary">
                    <Zap className="h-6 w-6" />
                    Key Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm text-base font-bold text-slate-700 leading-relaxed hover:bg-white transition-all">
                      <div className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 text-sm font-black">
                        {i + 1}
                      </div>
                      {rec}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] shadow-2xl border-none bg-white overflow-hidden">
                <CardHeader className="bg-emerald-500 p-8 border-b">
                  <CardTitle className="text-xl font-headline font-bold flex items-center gap-3 text-white">
                    <CheckCircle2 className="h-6 w-6" />
                    Production Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {result.roadmap.map((stepStr, i) => (
                    <div key={i} className="flex gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white transition-all shadow-sm">
                      <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-sm font-black shadow-lg">
                        {i + 1}
                      </div>
                      <p className="text-base font-bold text-slate-700 leading-relaxed group-hover:text-slate-900">
                        {stepStr}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm border-2 border-dashed rounded-[3rem] p-12 text-center gap-8 shadow-inner group">
              <div className="h-28 w-28 bg-primary/10 rounded-[2.5rem] flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-12 duration-500 shadow-2xl group-hover:bg-primary/20">
                <Compass className="h-14 w-14 text-primary" />
              </div>
              <div className="space-y-4 max-w-[350px]">
                <h3 className="text-2xl font-headline font-bold text-slate-900 leading-tight">Farm Intelligence Engine</h3>
                <p className="text-slate-500 text-base font-medium leading-relaxed italic">
                  Food security is national security. TUAI is more than a tool; it is a digital ecosystem designed to ensure the ASEAN region can feed its people regardless of global instability.
                </p>
              </div>
              <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-40">
                Grounded in ASEAN regional data
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
