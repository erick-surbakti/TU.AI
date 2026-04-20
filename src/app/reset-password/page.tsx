"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, KeyRound, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function ResetPasswordPage() {
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  React.useEffect(() => {
    setMounted(true)
    // Optional: Check if user is actually authenticated from the recovery link
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        toast({
          variant: "destructive",
          title: "Invalid Link",
          description: "This password recovery link is expired or invalid."
        })
        router.push("/login")
      }
    })
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please make sure both passwords are the exactly the same.",
      })
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      toast({
        title: "Password Updated",
        description: "Your new password has been securely saved.",
      })
      
      // Send them to their dashboard
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update password. Try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 selection:bg-primary/20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="w-full max-w-md">
        
        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 pt-10 pb-6 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center shadow-inner">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl font-headline font-bold text-slate-800">
                Secure Recovery
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium px-4 mt-2">
                Create a strong new password for your TUAI account below.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pb-10 px-8">
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              
              <div className="space-y-1.5">
                <Label htmlFor="password" suppressHydrationWarning className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">New Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-13 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" suppressHydrationWarning className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 h-13 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              <Button disabled={loading || password.length < 6} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg group shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all mt-4 active:scale-95">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Save New Password
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
