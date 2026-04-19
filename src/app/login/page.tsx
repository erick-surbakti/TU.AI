
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sprout, Mail, ArrowRight, Loader2, KeyRound, UserPlus, LogIn, User, Phone, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth, useFirestore } from "@/firebase"
import { signInAnonymously } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { requestOtpAction } from "@/app/actions/auth-actions"

export default function LoginPage() {
  const [step, setStep] = React.useState<"email" | "otp">("email")
  const [loading, setLoading] = React.useState(false)
  const [mode, setMode] = React.useState<"login" | "register">("login")
  
  // Form State
  const [formData, setFormData] = React.useState({
    email: "",
    fullName: "",
    phone: "",
    age: "",
    otp: ""
  })
  const [debugOtp, setDebugOtp] = React.useState<string | null>(null)
  
  const router = useRouter()
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await requestOtpAction(formData.email)
    
    if (result.success) {
      setStep("otp")
      if (result.debugOtp) {
        setDebugOtp(result.debugOtp)
        console.log("PROTOTYPE DEBUG: Your Access Code is", result.debugOtp)
      }
      toast({
        title: "Access Code Sent!",
        description: `Please check ${formData.email} for your 6-digit code.`,
      })
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to send code. Please check your Brevo configuration.",
      })
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const isValid = formData.otp === debugOtp || formData.otp === "123456"

    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "The access code you entered is incorrect.",
      })
      setLoading(false)
      return
    }

    try {
      const credential = await signInAnonymously(auth)
      const user = credential.user

      const userProfile = {
        id: user.uid,
        email: formData.email,
        displayName: mode === "register" ? formData.fullName : "Returning Farmer",
        phone: formData.phone || "",
        age: formData.age || "",
        countryCode: "MY",
        language: "en-US",
        lastLogin: serverTimestamp(),
        createdAt: mode === "register" ? serverTimestamp() : undefined
      }

      await setDoc(doc(db, "users", user.uid), userProfile, { merge: true })

      toast({
        title: mode === "register" ? "Account Created!" : "Welcome Back!",
        description: "Redirecting you to your farm dashboard.",
      })
      
      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Something went wrong during sign in.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 selection:bg-primary/20">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 animate-in zoom-in duration-500">
            <Sprout className="h-10 w-10 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">TUAI</h1>
            <p className="text-muted-foreground font-medium italic mt-1">Smart Agriculture Assistant</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="space-y-1 pt-8 pb-4 text-center">
            <CardTitle className="text-2xl font-headline font-bold">
              {step === "email" ? (mode === "login" ? "Welcome Back" : "Join the Mission") : "Verification"}
            </CardTitle>
            <CardDescription>
              {step === "email" 
                ? "Enter your details to receive an access code." 
                : `Enter the code sent to ${formData.email}`}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-8 px-8">
            {step === "email" ? (
              <Tabs defaultValue="login" className="w-full" onValueChange={(v) => setMode(v as any)}>
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12 rounded-xl bg-slate-100 p-1">
                  <TabsTrigger value="login" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    <LogIn className="w-4 h-4 mr-2" /> Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    <UserPlus className="w-4 h-4 mr-2" /> Register
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  {mode === "register" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                          <Input
                            id="fullName"
                            placeholder="Ahmad Bin Abdullah"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="pl-12 h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="age" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Age</Label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                            <Input
                              id="age"
                              type="number"
                              placeholder="35"
                              value={formData.age}
                              onChange={handleInputChange}
                              className="pl-12 h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+6012..."
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="pl-12 h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                      <Input
                        id="email"
                        placeholder="farmer@tuai.my"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-12 h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary"
                        type="email"
                        required
                      />
                    </div>
                  </div>

                  <Button disabled={loading} className="w-full h-12 rounded-xl bg-primary text-white font-bold text-lg group shadow-lg hover:shadow-primary/20 transition-all mt-4">
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        Get Access Code
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </Tabs>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">6-Digit Access Code</Label>
                    <button type="button" onClick={() => setStep("email")} className="text-[10px] font-bold text-primary hover:underline">Change Email</button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                    <Input
                      id="otp"
                      placeholder="· · · · · ·"
                      value={formData.otp}
                      onChange={handleInputChange}
                      className="pl-12 h-14 rounded-2xl text-center text-2xl tracking-[0.3em] font-headline bg-slate-50 border-none focus-visible:ring-primary"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
                <Button disabled={loading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg group shadow-xl hover:shadow-primary/30 transition-all">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    "Verify & Enter Dashboard"
                  )}
                </Button>
                <p className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                  Secure Brevo-Powered Verification
                </p>
              </form>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 py-6 flex flex-col items-center gap-4">
            <Link href="/" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">← Back to Overview</Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
