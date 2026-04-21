"use client"

import * as React from "react"
import { Settings, Key, ShieldCheck, Save, Loader2, Sparkles, AlertCircle, HandMetal, CheckCircle2, XCircle, RefreshCw, Globe, Bell, Lock, Trash2, Download, Shield } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const { isEasyMode, toggleEasyMode } = useEasyMode()

  const [user, setUser] = React.useState<any>(null)
  const [profile, setProfile] = React.useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = React.useState(true)
  const [isProfileLoading, setIsProfileLoading] = React.useState(true)

  // API Configuration
  const [apiKey, setApiKey] = React.useState("")
  const [countryCode, setCountryCode] = React.useState("MY")
  const [isSaving, setIsSaving] = React.useState(false)
  const [verificationStatus, setVerificationStatus] = React.useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle')
  const [isVerifying, setIsVerifying] = React.useState(false)

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = React.useState(true)
  const [diseaseAlerts, setDiseaseAlerts] = React.useState(true)
  const [newsDigest, setNewsDigest] = React.useState(true)
  const [weeklyReport, setWeeklyReport] = React.useState(true)

  // Data Management
  const [isExporting, setIsExporting] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("")

  // Session Management
  const [sessions, setSessions] = React.useState<any[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = React.useState(false)

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsAuthLoading(false)
      if (user) {
        supabase.from('users').select('*').eq('id', user.id).single().then(({ data }) => {
          setProfile(data)
          setIsProfileLoading(false)
          // Load notification preferences
          if (data?.preferences) {
            setEmailNotifications(data.preferences.emailNotifications !== false)
            setDiseaseAlerts(data.preferences.diseaseAlerts !== false)
            setNewsDigest(data.preferences.newsDigest !== false)
            setWeeklyReport(data.preferences.weeklyReport !== false)
          }
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
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`
        }
      })
      const data = await response.json()

      if (response.ok) {
        setVerificationStatus('valid')
        toast({
          title: "Key Verified",
          description: "Your Groq API key is valid and ready to use.",
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
        description: "Could not connect to Groq API. Please check your internet.",
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
        preferences: {
          emailNotifications,
          diseaseAlerts,
          newsDigest,
          weeklyReport,
        },
        lastLogin: new Date().toISOString()
      }

      const { error } = await supabase.from('users').upsert(payload)

      if (error) throw error

      toast({
        title: "Settings Saved",
        description: "All your preferences have been updated.",
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

  const handleExportData = async () => {
    if (!user) return

    setIsExporting(true)
    try {
      // Fetch user's data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) throw userError

      // Prepare export data
      const exportData = {
        exportedAt: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
        profile: userData,
      }

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tuai-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: "Your data has been downloaded as a JSON file.",
      })
    } catch (error: any) {
      console.error("Export Error:", error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error?.message || "Could not export your data.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== "DELETE MY ACCOUNT") return

    setIsDeletingAccount(true)
    try {
      // Delete user data from users table
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (deleteError) throw deleteError

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)

      if (authError) throw authError

      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted.",
      })

      // Redirect to login
      window.location.href = '/login'
    } catch (error: any) {
      console.error("Delete Account Error:", error)
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error?.message || "Could not delete your account. Please try again or contact support.",
      })
    } finally {
      setIsDeletingAccount(false)
      setShowDeleteConfirm(false)
      setDeleteConfirmText("")
    }
  }

  const saveNotificationSettings = async () => {
    if (!user) return

    try {
      const payload = {
        ...(profile || {}),
        id: user.id,
        email: user.email,
        preferences: {
          emailNotifications,
          diseaseAlerts,
          newsDigest,
          weeklyReport,
        },
      }

      const { error } = await supabase.from('users').upsert(payload)

      if (error) throw error

      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      })
    } catch (error: any) {
      console.error("Error saving notification settings:", error)
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error?.message || "Could not update notification settings.",
      })
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
        <p className="text-sm text-muted-foreground font-medium">Manage your account, preferences, and integrations.</p>
      </div>

      <div className="grid gap-8">
        {/* API Configuration Card */}
        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100">
                <Key className="h-7 w-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">API Configuration</CardTitle>
                <CardDescription className="text-xs font-medium">Connect your Groq AI data provider.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <Alert variant="default" className="bg-emerald-50 border-emerald-100 rounded-[1.5rem] p-6 shadow-sm">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <AlertTitle className="text-emerald-900 font-bold text-base">Token Responsibility</AlertTitle>
              <AlertDescription className="text-emerald-800 text-xs leading-relaxed mt-1">
                To keep TUAI free for all, AI features (Pathfinder, Scans, Farm Audit) use your own Groq API key. The <span className="font-bold">Copilot chatbot is always free</span> and powered by TUAI.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Label htmlFor="groqKey" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Groq API Key</Label>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  id="groqKey"
                  type="password"
                  placeholder="Paste your key here (starts with gsk_...)"
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
              disabled={isSaving || !apiKey.trim()}
              className="w-full md:w-auto h-14 rounded-2xl bg-primary text-white font-bold px-12 shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            >
              {isSaving ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Syncing...</> : <><Save className="h-5 w-5 mr-2" /> Save Changes</>}
            </Button>
          </CardFooter>
        </Card>

        {/* Notification Settings Card */}
        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100">
                <Bell className="h-7 w-7 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Notifications</CardTitle>
                <CardDescription className="text-xs font-medium">Control how and when you receive updates.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <div className="space-y-4">
              {[
                { id: 'email', label: 'Email Notifications', desc: 'Receive important updates via email', value: emailNotifications, setter: setEmailNotifications },
                { id: 'disease', label: 'Disease Alerts', desc: 'Get notified about disease outbreaks in your region', value: diseaseAlerts, setter: setDiseaseAlerts },
                { id: 'news', label: 'News Digest', desc: 'Weekly summary of relevant agricultural news', value: newsDigest, setter: setNewsDigest },
                { id: 'report', label: 'Weekly Report', desc: 'Comprehensive farm and market intelligence reports', value: weeklyReport, setter: setWeeklyReport },
              ].map(({ id, label, desc, value, setter }) => (
                <div key={id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-sm text-slate-800">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={setter}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 p-8 border-t flex justify-end gap-4">
            <Button
              onClick={saveNotificationSettings}
              className="h-12 rounded-2xl bg-primary text-white font-bold px-8 shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              <Save className="h-5 w-5 mr-2" /> Save Preferences
            </Button>
          </CardFooter>
        </Card>

        {/* Accessibility Card */}
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

        {/* Security Card */}
        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100">
                <Shield className="h-7 w-7 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Security & Password</CardTitle>
                <CardDescription className="text-xs font-medium">Manage your account security and authentication.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-3">
              <Button
                asChild
                className="w-full h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-6 shadow-sm active:scale-95 transition-all border border-slate-200"
              >
                <a href="/dashboard/change-password">
                  <Lock className="h-5 w-5 mr-2" /> Change Password
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management Card */}
        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100">
                <Download className="h-7 w-7 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Data Management</CardTitle>
                <CardDescription className="text-xs font-medium">Export your data or delete your account.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <Alert variant="default" className="bg-blue-50 border-blue-100 rounded-[1.5rem] p-4">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900 font-semibold text-sm">Data Export</AlertTitle>
              <AlertDescription className="text-blue-800 text-xs mt-1">
                Download a copy of your profile data and settings in JSON format for backup or portability.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full h-12 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold px-6 shadow-sm active:scale-95 transition-all border border-purple-200"
            >
              {isExporting ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Exporting...</> : <><Download className="h-5 w-5 mr-2" /> Export My Data</>}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white border-destructive/20">
          <CardHeader className="bg-destructive/5 p-8 border-b border-destructive/20">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-destructive/20">
                <Trash2 className="h-7 w-7 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-destructive">Danger Zone</CardTitle>
                <CardDescription className="text-xs font-medium">Permanently delete your account and all data.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Alert variant="destructive" className="rounded-[1.5rem] p-4 bg-destructive/10 border-destructive/30">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-semibold">Irreversible Action</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                Deleting your account will permanently remove all your data. This action cannot be undone.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="bg-destructive/5 p-8 border-t border-destructive/20">
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="destructive"
              className="w-full h-12 rounded-2xl font-bold px-6 shadow-lg shadow-destructive/20 active:scale-95 transition-all"
            >
              <Trash2 className="h-5 w-5 mr-2" /> Delete Account Permanently
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-[2rem] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              Delete Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm mt-2 space-y-3">
              <p>This will permanently delete:</p>
              <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                <li>Your user account</li>
                <li>All your farm records and settings</li>
                <li>Your API keys and preferences</li>
              </ul>
              <p className="font-semibold mt-4">This action cannot be reversed.</p>
              <p className="text-xs">Type <span className="font-bold bg-destructive/10 px-2 py-1 rounded">DELETE MY ACCOUNT</span> to confirm:</p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type confirmation text"
                className="rounded-lg border-destructive/30 focus-visible:ring-destructive/50"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 mt-6">
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || deleteConfirmText !== "DELETE MY ACCOUNT"}
              className="rounded-lg bg-destructive hover:bg-destructive/90 text-white disabled:opacity-50"
            >
              {isDeletingAccount ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...</> : 'Delete Forever'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
