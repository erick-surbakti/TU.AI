
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sprout, Mail, ArrowRight, Loader2, KeyRound, UserPlus, LogIn, User, Phone, Calendar, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Turnstile } from "@marsidev/react-turnstile"
import { Globe } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { ASEAN_COUNTRIES } from "@/lib/localization"

export default function LoginPage() {
  const [mounted, setMounted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [mode, setMode] = React.useState<"login" | "register" | "forgot">("login")
  const [showPassword, setShowPassword] = React.useState(false)
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null)

  
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    birthday: "",
    countryCode: "MY"
  })
  
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  
  const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }

  const getAgeGroup = (age: number) => {
    if (age < 36) return "Young Farmer";
    if (age < 50) return "Mid Career";
    if (age < 60) return "Senior Active";
    if (age < 70) return "Easy Mode";
    return "Assisted Mode";
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const origin = window.location.origin

      if (mode === "register") {
        // Validate birthday and age
        if (!formData.birthday) {
          toast({ variant: "destructive", title: "Birthday Required", description: "Please enter your birthday." })
          setLoading(false)
          return
        }

        const age = calculateAge(formData.birthday)
        if (age < 15) {
          toast({ 
            variant: "destructive", 
            title: "Age Requirement", 
            description: "You must be at least 15 years old to register." 
          })
          setLoading(false)
          return
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          toast({ 
            variant: "destructive", 
            title: "Invalid Email", 
            description: "Please enter a valid email address (e.g., name@domain.com)" 
          })
          setLoading(false)
          return
        }

        const uppercaseRegExp   = /(?=.*?[A-Z])/;
        const lowercaseRegExp   = /(?=.*?[a-z])/;
        const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/;
        
        let passErr = "";
        if (formData.password.length < 8) passErr = "Password must be at least 8 characters.";
        else if (!uppercaseRegExp.test(formData.password)) passErr = "Password must contain an uppercase letter.";
        else if (!lowercaseRegExp.test(formData.password)) passErr = "Password must contain a lowercase letter.";
        else if (!specialCharRegExp.test(formData.password)) passErr = "Password must contain a special character (#?!@$%^&*-).";
        
        if (passErr) {
          toast({ variant: "destructive", title: "Weak Password", description: passErr })
          setLoading(false)
          return
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            captchaToken: captchaToken || undefined,
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
              display_name: formData.fullName,
            }
          }
        });

        if (authError) throw authError;

        if (authData.session && authData.user) {
          // If Confirm Email is OFF in Supabase, they normally log in immediately. We force them out!
          const ageNum = calculateAge(formData.birthday);
          const ageGroup = getAgeGroup(ageNum);
          const easyModeEnabled = ageNum >= 60;

          const userProfile = {
            id: authData.user.id,
            email: formData.email,
            displayName: formData.fullName,
            phone: formData.phone,
            birth_date: formData.birthday,
            age: ageNum.toString(),
            age_group: ageGroup,
            easy_mode_enabled: easyModeEnabled,
            countryCode: formData.countryCode,
            language: "en-US"
          };

          const { error: dbError } = await supabase.from('users').insert(userProfile);
          if (dbError) throw dbError;
          
          await supabase.auth.signOut(); // Force logout to deliberately drag them to login screen
          
          toast({ title: "Account Created!", description: "Registration complete. Please log in." })
          setMode("login")
          setFormData(prev => ({...prev, password: ""}))
          return
        } else {
          // If Confirm Email is ON, tell them to check their email
          toast({ title: "Registration Successful", description: "PLEASE CHECK YOUR EMAIL TO COMPLETE THE SIGN UP" })
          setMode("login")
          return
        }
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${origin}/reset-password`
        })
        if (error) throw error
        toast({ title: "Reset Link Sent", description: "Check your email for the recovery link." })
        setMode("login")
        return
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (authError) throw authError;

        toast({
          title: "Welcome Back!",
          description: "Syncing your farm records...",
        })
      }
      
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Auth flow error", { mode, error })

      let message = error?.message || "An error occurred during authentication."
      if (message.includes('already registered')) message = "This email is already registered."
      if (message.includes('Invalid login credentials')) message = "Incorrect email or password."
      if (mode === "register" && message.includes('Error sending confirmation email')) {
        message = "Unable to send confirmation email. Check Supabase Auth email provider/SMTP settings and allowed redirect URLs."
      }
      if (mode === "forgot" && message.includes('Error sending recovery email')) {
        message = "Unable to send reset email. Check Supabase Auth email provider/SMTP settings and allowed redirect URLs."
      }
      
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 selection:bg-primary/20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10 gap-4">
          <div className="h-16 w-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/30 animate-in zoom-in duration-700">
            <Sprout className="h-9 w-9 text-white" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">TUAI</h1>
            <p className="text-muted-foreground font-medium text-sm uppercase tracking-[0.2em]">Intelligent Agriculture</p>
          </div>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-2 pt-10 pb-6 text-center">
            <CardTitle className="text-3xl font-headline font-bold text-slate-800">
              {mode === "login" ? "Welcome Back" : "Join TUAI"}
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium px-4">
              {mode === "login" && "Enter your credentials to access your farm intelligence dashboard."}
              {mode === "register" && "Create your farmer profile to start monitoring your crops with AI."}
              {mode === "forgot" && "Enter your email and we'll send you a password reset link."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-10 px-8">
            <Tabs defaultValue="login" className="w-full" onValueChange={(v) => setMode(v as any)}>
              <TabsList className="grid w-full grid-cols-2 mb-8 h-14 rounded-2xl bg-slate-100 p-1.5">
                <TabsTrigger value="login" className="rounded-xl font-bold text-[10px] sm:text-xs data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">
                  <LogIn className="w-3.5 h-3.5 mr-1.5" /> Login
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl font-bold text-[10px] sm:text-xs data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Register
                </TabsTrigger>
              </TabsList>

              <div className="space-y-4 mb-8">
                <Button 
                   type="button" 
                   variant="outline" 
                   onClick={handleGoogleAuth}
                   className="w-full h-13 rounded-2xl border-slate-200 shadow-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">or</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                {mode === "register" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="fullName"
                          placeholder="Ahmad Bin Abdullah"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="pl-12 h-13 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                          required={mode === "register"}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Home Country (ASEAN)</Label>
                      <Select 
                        value={formData.countryCode} 
                        onValueChange={(v) => setFormData(prev => ({...prev, countryCode: v}))}
                      >
                        <SelectTrigger className="h-13 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner pl-12 relative text-left">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
                          {Object.values(ASEAN_COUNTRIES).map((c) => (
                            <SelectItem key={c.code} value={c.code} className="rounded-xl font-medium focus:bg-primary/5 focus:text-primary py-3">
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="birthday" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Birthday</Label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            id="birthday"
                            type="date"
                            value={formData.birthday}
                            onChange={handleInputChange}
                            className="pl-12 pr-4 h-13 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                            required={mode === "register"}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+60..."
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="pl-12 h-13 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                            required={mode === "register"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      placeholder="farmer@tuai.my"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-12 h-13 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                      type="email"
                      required
                    />
                  </div>
                </div>

                {(mode === "login" || mode === "register") && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" suppressHydrationWarning className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</Label>
                    {mode === "login" && (
                      <button type="button" onClick={() => setMode("forgot")} suppressHydrationWarning className="text-[10px] font-bold text-primary hover:underline">Forgot?</button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-12 pr-12 h-13 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                      required={mode === "login" || mode === "register"}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                )}



                {mode === "register" && turnstileKey && (
                  <div className="flex justify-center pt-2 animate-in fade-in zoom-in duration-500">
                    <Turnstile 
                      siteKey={turnstileKey} 
                      onSuccess={(token) => setCaptchaToken(token)} 
                      onError={(err) => toast({ variant: "destructive", title: "Human Verification Failed", description: `Cloudflare Error: ${err}` })}
                    />
                  </div>
                )}

                <Button disabled={loading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg group shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all mt-4 active:scale-95">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      {mode === "login" && "Enter Dashboard"}
                      {mode === "register" && "Create Account"}
                      {mode === "forgot" && "Send Reset Link"}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="bg-slate-50/50 py-8 flex flex-col items-center gap-4 border-t">
            <Link href="/" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
              <Sprout className="h-4 w-4" /> Return to Website
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
