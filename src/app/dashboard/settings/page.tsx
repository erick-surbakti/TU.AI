
"use client"

import * as React from "react"
import { Settings, Key, ShieldCheck, Save, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useFirestore, useUser, useDoc } from "@/firebase"
import { doc } from "firebase/firestore"
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SettingsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const userRef = React.useMemo(() => {
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
    if (!userRef) return
    
    setIsSaving(true)
    try {
      updateDocumentNonBlocking(userRef, {
        geminiApiKey: apiKey,
        updatedAt: new Date().toISOString()
      })
      
      toast({
        title: "Settings Saved",
        description: "Your Gemini API configuration has been updated successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "An error occurred while saving your settings.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Syncing Profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2 px-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
          <Settings className="h-3 w-3" />
          Account Control
        </div>
        <h2 className="text-3xl md:text-4xl font-headline font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-muted-foreground font-medium">Manage your TUAI integration keys and system preferences.</p>
      </div>

      <div className="grid gap-8">
        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 p-8 border-b">
             <div className="flex items-center gap-4">
               <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
                 <Key className="h-6 w-6 text-primary" />
               </div>
               <div>
                 <CardTitle className="text-xl font-bold text-slate-800">API Configuration</CardTitle>
                 <CardDescription className="text-xs font-medium">Connect your Gemini AI data provider.</CardDescription>
               </div>
             </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <Alert variant="default" className="bg-emerald-50 border-emerald-100 rounded-2xl mb-4">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <AlertTitle className="text-emerald-900 font-bold">Encrypted Storage</AlertTitle>
              <AlertDescription className="text-emerald-800/80 text-xs">
                Your keys are stored securely in your private Firestore profile and are only used for system communication.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Label htmlFor="geminiKey" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Gemini API Key</Label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  id="geminiKey"
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-slate-50 border-none shadow-inner text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-medium ml-1">
                Used to power your AI diagnostics, chat copilot, and risk intelligence.
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 p-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
               <ShieldCheck className="h-4 w-4 text-emerald-500" />
               Security Verified
             </div>
             <Button 
               onClick={handleSave} 
               disabled={isSaving}
               className="w-full md:w-auto h-14 rounded-2xl bg-primary text-white font-bold px-10 shadow-lg shadow-primary/20 active:scale-95 transition-all"
             >
               {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
               Save Changes
             </Button>
          </CardFooter>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-4 border-l-[12px] border-l-orange-500">
          <div className="flex items-start gap-4">
             <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
               <AlertCircle className="h-6 w-6 text-orange-600" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-800">Advanced System Access</h3>
               <p className="text-xs text-muted-foreground leading-relaxed mt-1 font-medium">
                 Your Gemini key enables autonomous analysis grounded in regional data. Keep this key private.
               </p>
             </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
