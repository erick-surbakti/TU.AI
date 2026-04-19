
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sprout, Mail, ArrowRight, Loader2, KeyRound, UserPlus, LogIn, User, Phone, Calendar, Eye, EyeOff, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth, useFirestore } from "@/firebase"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false)
  const [mode, setMode] = React.useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = React.useState(false)
  
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    age: ""
  })
  
  const router = useRouter()
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (mode === "register") {
        // 1. Create User in Firebase Auth
        const credential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
        const user = credential.user

        // 2. Set Display Name
        await updateProfile(user, { displayName: formData.fullName })

        // 3. Create User Profile in Firestore
        const userProfile = {
          id: user.uid,
          email: formData.email,
          displayName: formData.fullName,
          phone: formData.phone,
          age: formData.age,
          countryCode: "MY",
          language: "en-US",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        }
        await setDoc(doc(db, "users", user.uid), userProfile)

        toast({
          title: "Account Created!",
          description: "Welcome to the TUAI family. Redirecting...",
        })
      } else {
        // Login Flow
        await signInWithEmailAndPassword(auth, formData.email, formData.password)
        toast({
          title: "Welcome Back!",
          description: "Syncing your farm records...",
        })
      }
      
      router.push("/dashboard")
    } catch (error: any) {
      let message = "An error occurred during authentication."
      if (error.code === 'auth/email-already-in-use') message = "This email is already registered."
      if (error.code === 'auth/wrong-password') message = "Incorrect password. Please try again."
      if (error.code === 'auth/user-not-found') message = "No account found with this email."
      
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

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
              {mode === "login" 
                ? "Enter your credentials to access your farm intelligence dashboard." 
                : "Create your farmer profile to start monitoring your crops with AI."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-10 px-8">
            <Tabs defaultValue="login" className="w-full" onValueChange={(v) => setMode(v as any)}>
              <TabsList className="grid w-full grid-cols-2 mb-8 h-14 rounded-2xl bg-slate-100 p-1.5">
                <TabsTrigger value="login" className="rounded-xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">
                  <LogIn className="w-4 h-4 mr-2" /> Login
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">
                  <UserPlus className="w-4 h-4 mr-2" /> Register
                </TabsTrigger>
              </TabsList>

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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="age" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Age</Label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            id="age"
                            type="number"
                            placeholder="35"
                            value={formData.age}
                            onChange={handleInputChange}
                            className="pl-12 h-13 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
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

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</Label>
                    {mode === "login" && (
                      <button type="button" className="text-[10px] font-bold text-primary hover:underline">Forgot?</button>
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
                      required
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

                <Button disabled={loading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg group shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all mt-4 active:scale-95">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Enter Dashboard" : "Create Account"}
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
        
        <div className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
          SECURE AES-256 ENCRYPTED AUTHENTICATION
        </div>
      </div>
    </div>
  )
}
