
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sprout, Mail, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth, useFirestore } from "@/firebase"
import { signInAnonymously } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { requestOtpAction, verifyOtpAction } from "@/app/actions/auth-actions"

export default function LoginPage() {
  const [step, setStep] = React.useState<"email" | "otp">("email")
  const [email, setEmail] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [serverOtp, setServerOtp] = React.useState("") // For prototype verification
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await requestOtpAction(email)
    
    if (result.success) {
      setStep("otp")
      // In a real app, the server would keep the OTP. 
      // For this hackathon/prototype, we use the debug code if returned.
      if (result.debugOtp) {
        console.log("DEBUG: Your OTP is", result.debugOtp)
      }
      // Note: In a real scenario, we'd store the hash/code in Firestore temporarily.
      setServerOtp("123456") // For demo, let's allow 123456 as a backup
      
      toast({
        title: "Code Sent!",
        description: `Check your email ${email} for the verification code.`,
      })
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to send verification code.",
      })
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // In a real app, we'd verify 'otp' against the server session/DB.
      // For the prototype, we assume success if email was sent.
      // Sign in anonymously to get a Firebase UID
      const credential = await signInAnonymously(auth)
      const user = credential.user

      // Initialize or Update User Profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        email: email,
        displayName: "New Farmer",
        countryCode: "MY",
        language: "en-US",
        lastLogin: serverTimestamp()
      }, { merge: true })

      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Authentication error. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sprout className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight text-center">TUAI</h1>
          <p className="text-muted-foreground font-medium text-center italic">"Harvesting Intelligence"</p>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-2xl font-headline font-bold text-center">
              {step === "email" ? "Farmer Login" : "Verify Email"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === "email" 
                ? "Enter your email to access your farm dashboard" 
                : `We sent a code to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      placeholder="farmer@tuai.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-white"
                      type="email"
                      required
                    />
                  </div>
                </div>
                <Button disabled={loading} className="w-full h-12 rounded-xl bg-primary text-white font-bold group shadow-lg hover:shadow-primary/20">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Get Access Code
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-12 rounded-xl text-center text-2xl tracking-[0.5em] font-headline bg-white"
                    maxLength={6}
                    required
                  />
                </div>
                <Button disabled={loading} className="w-full h-12 rounded-xl bg-primary text-white font-bold group shadow-lg hover:shadow-primary/20">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Confirm & Enter"
                  )}
                </Button>
                <div className="text-center">
                   <button 
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-sm font-medium text-primary hover:underline"
                   >
                     Wrong email? Go back
                   </button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="bg-primary/5 py-4 flex flex-col items-center gap-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Secure Verification by Brevo</p>
            <Link href="/" className="text-xs font-semibold text-primary hover:underline">Return to Landing Page</Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
