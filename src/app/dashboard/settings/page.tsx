
"use client"

import * as React from "react"
import { Settings, Key, ShieldCheck, Save, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SettingsPage() {
  const { user, isUserLoading: isAuthLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef)
  
  const [apiKey, setApiKey] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (profile?.geminiApiKey) {
      setApiKey(profile.geminiApiKey)
    }
  }, [profile])

  const handleSave = async () => {
    if (!user || !db) return
    
    setIsSaving(true)
    try {
      // Must include the 'id' field to satisfy Firestore Security Rules
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        geminiApiKey: apiKey.trim(),
        updatedAt: new Date().toISOString()
      }, { merge: true })
      
      toast({
        title: "Settings Saved",
        description: "Your Gemini API key is now active for all features.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not update settings. Check your connection.",
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
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-slate-50 border-none shadow-inner text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              <div className="flex items-start gap-2 ml-1">
                <AlertCircle className="h-3 w-3 text-muted-foreground mt-0.5" />
                <p className="text-[10px] text-muted-foreground font-medium italic">
                  Your key is stored securely in your private user document. It is never shared with third parties.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 p-8 border-t flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
               <ShieldCheck className="h-4 w-4 text-emerald-500" />
               End-to-End Encryption Active
             </div>
             <Button 
               onClick={handleSave} 
               disabled={isSaving || !apiKey.trim()}
               className="w-full md:w-auto h-14 rounded-2xl bg-primary text-white font-bold px-12 shadow-lg shadow-primary/20 active:scale-95 transition-all"
             >
               {isSaving ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Syncing...</> : <><Save className="h-5 w-5 mr-2" /> Save Changes</>}
             </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
