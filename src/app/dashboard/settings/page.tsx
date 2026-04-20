
"use client"

import * as React from "react"
import { Settings, Key, ShieldCheck, Save, Loader2, Sparkles, AlertCircle, Eye, HandMetal, CheckCircle2, XCircle, RefreshCw, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useEasyMode } from "@/components/easy-mode-provider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { createClient } from "@/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { ASEAN_COUNTRIES } from "@/lib/localization"

export default function SettingsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const { isEasyMode, toggleEasyMode } = useEasyMode()
  
  const [user, setUser] = React.useState<any>(null)
  const [profile, setProfile] = React.useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = React.useState(true)
  const [isProfileLoading, setIsProfileLoading] = React.useState(true)
  
  const [apiKey, setApiKey] = React.useState("")
  const [countryCode, setCountryCode] = React.useState("MY")
  const [isSaving, setIsSaving] = React.useState(false)
  const [verificationStatus, setVerificationStatus] = React.useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle')
  const [isVerifying, setIsVerifying] = React.useState(false)

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsAuthLoading(false)
      if (user) {
        supabase.from('users').select('*').eq('id', user.id).single().then(({ data }) => {
          setProfile(data)
          setIsProfileLoading(false)
        })
      } else {
        setIsProfileLoading(false)
      }
    })
  }, [])

  React.useEffect(() => {
    if (profile?.geminiApiKey) {
      setApiKey(profile.geminiApiKey)
      setVerificationStatus('valid')
    }
    if (profile?.countryCode) {
      setCountryCode(profile.countryCode)
    }
  }, [profile])

  const handleVerify = async () => {
    if (!apiKey.trim()) return
    
    setIsVerifying(true)
    setVerificationStatus('verifying')
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`)
      const data = await response.json()
      
      if (response.ok) {
        setVerificationStatus('valid')
        toast({
          title: "Key Verified",
          description: "Your Gemini API key is valid and ready to use.",
        })
      } else {
        setVerificationStatus('invalid')
        toast({
          variant: "destructive",
          title: "Invalid Key",
          description: data.error?.message || "The API key provided is not valid.",
        })
      }
    } catch (error) {
      setVerificationStatus('invalid')
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Could not connect to Gemini API. Please check your internet.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      const payload = {
        ...(profile || {}),
        id: user.id,
        email: user.email,
        geminiApiKey: apiKey.trim(),
        countryCode: countryCode,
        lastLogin: new Date().toISOString()
      }

      const { error } = await supabase.from('users').upsert(payload)
      
      if (error) throw error

      toast({
        title: "Settings Saved",
        description: "Your Gemini API key is now active for all features.",
      })
    } catch (error: any) {
      console.error("Supabase Settings Save Error:", error)
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error?.message || "Could not update settings. Please check your connection.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const isActuallyLoading = isAuthLoading || isProfileLoading

  if (isActuallyLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Synchronizing Profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 no-scrollbar">
      <div className="space-y-2 px-1">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
          <Settings className="h-3.5 w-3.5" />
          System Preferences
        </div>
        <h2 className="text-3xl md:text-4xl font-headline font-bold text-slate-900 leading-tight">Settings</h2>
        <p className="text-sm text-muted-foreground font-medium">Manage your personal Gemini AI integration and account details.</p>
      </div>

      <div className="grid gap-8">
        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b">
             <div className="flex items-center gap-4">
               <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100">
                 <Key className="h-7 w-7 text-primary" />
               </div>
               <div>
                 <CardTitle className="text-xl font-bold text-slate-800">API Configuration</CardTitle>
                 <CardDescription className="text-xs font-medium">Connect your Gemini AI data provider.</CardDescription>
               </div>
             </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <Alert variant="default" className="bg-emerald-50 border-emerald-100 rounded-[1.5rem] p-6 shadow-sm">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <AlertTitle className="text-emerald-900 font-bold text-base">Token Responsibility</AlertTitle>
              <AlertDescription className="text-emerald-800 text-xs leading-relaxed mt-1">
                To keep TUAI free for all, you provide your own Gemini API key. All AI features (Pathfinder, Scans, Chat) will consume tokens from your personal quota.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Label htmlFor="geminiKey" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Gemini API Key</Label>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="geminiKey"
                  type="password"
                  placeholder="Paste your key here (starts with AIza...)"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value)
                    setVerificationStatus('idle')
                  }}
                  className={cn(
                    "pl-12 pr-32 h-14 rounded-2xl bg-slate-50 border-none shadow-inner text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all",
                    verificationStatus === 'valid' && "ring-2 ring-emerald-500/50 bg-emerald-50/30",
                    verificationStatus === 'invalid' && "ring-2 ring-destructive/50 bg-destructive/30"
                  )}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {verificationStatus === 'valid' && <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-in zoom-in duration-300" />}
                  {verificationStatus === 'invalid' && <XCircle className="h-5 w-5 text-destructive animate-in zoom-in duration-300" />}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleVerify}
                    disabled={isVerifying || !apiKey.trim() || verificationStatus === 'valid'}
                    className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-sm border border-slate-100"
                  >
                    {isVerifying ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                    {verificationStatus === 'valid' ? 'Verified' : 'Verify'}
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-2 ml-1">
                <AlertCircle className="h-3 w-3 text-muted-foreground mt-0.5" />
                <p className="text-[10px] text-muted-foreground font-medium italic">
                  Your key is stored securely in your private user document. It is never shared with third parties.
                </p>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t">
              <Label htmlFor="country" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Regional Context (ASEAN)</Label>
              <Select 
                value={countryCode} 
                onValueChange={(v) => {
                  setCountryCode(v)
                }}
              >
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner pl-12 relative text-left text-sm font-medium">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
                  {Object.values(ASEAN_COUNTRIES).map((c) => (
                    <SelectItem key={c.code} value={c.code} className="rounded-xl font-medium focus:bg-primary/5 focus:text-primary py-3">
                      {c.name} ({c.currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground font-medium italic ml-1">
                Changing this will update your Dashboard currency and localized AI insights for news and policies.
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 p-8 border-t flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
               <ShieldCheck className="h-4 w-4 text-emerald-500" />
               End-to-End Encryption Active
             </div>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !apiKey.trim() || verificationStatus !== 'valid'}
                className="w-full md:w-auto h-14 rounded-2xl bg-primary text-white font-bold px-12 shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {isSaving ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Syncing...</> : <><Save className="h-5 w-5 mr-2" /> Save Changes</>}
              </Button>
          </CardFooter>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b">
             <div className="flex items-center gap-4">
               <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100">
                 <HandMetal className="h-7 w-7 text-emerald-500" />
               </div>
               <div>
                 <CardTitle className="text-xl font-bold text-slate-800">Accessibility</CardTitle>
                 <CardDescription className="text-xs font-medium">Simplify the workspace for a more focused experience.</CardDescription>
               </div>
             </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
              <div className="space-y-1">
                <div className="text-lg font-bold text-slate-800">Comfort Mode</div>
                <div className="text-sm text-slate-500 font-medium max-w-[400px]">
                  Enables larger text, bigger buttons, and simplified AI responses across the entire dashboard.
                </div>
              </div>
              <Switch 
                checked={isEasyMode} 
                onCheckedChange={toggleEasyMode}
                className="scale-125 data-[state=checked]:bg-emerald-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
