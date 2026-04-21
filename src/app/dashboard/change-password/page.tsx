"use client"

import * as React from "react"
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface PasswordStrength {
    score: number // 0-4
    feedback: string
    requirements: {
        minLength: boolean
        hasUppercase: boolean
        hasLowercase: boolean
        hasNumber: boolean
        hasSpecial: boolean
    }
}

export default function ChangePasswordPage() {
    const supabase = createClient()
    const { toast } = useToast()
    const router = useRouter()

    const [user, setUser] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isChanging, setIsChanging] = React.useState(false)

    const [currentPassword, setCurrentPassword] = React.useState("")
    const [newPassword, setNewPassword] = React.useState("")
    const [confirmPassword, setConfirmPassword] = React.useState("")

    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
    const [showNewPassword, setShowNewPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

    const [passwordStrength, setPasswordStrength] = React.useState<PasswordStrength>({
        score: 0,
        feedback: "Create a strong password",
        requirements: {
            minLength: false,
            hasUppercase: false,
            hasLowercase: false,
            hasNumber: false,
            hasSpecial: false,
        }
    })

    const [errors, setErrors] = React.useState<string[]>([])
    const [success, setSuccess] = React.useState(false)

    React.useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                router.push("/login")
            } else {
                setUser(user)
            }
            setIsLoading(false)
        })
    }, [router])

    React.useEffect(() => {
        evaluatePasswordStrength(newPassword)
    }, [newPassword])

    const evaluatePasswordStrength = (password: string): void => {
        const requirements = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        }

        const metRequirements = Object.values(requirements).filter(Boolean).length
        const score = Math.ceil((metRequirements / 5) * 4)

        let feedback = ""
        switch (score) {
            case 0:
                feedback = "Too weak"
                break
            case 1:
                feedback = "Weak"
                break
            case 2:
                feedback = "Fair"
                break
            case 3:
                feedback = "Good"
                break
            case 4:
                feedback = "Strong"
                break
        }

        setPasswordStrength({
            score,
            feedback,
            requirements,
        })
    }

    const validateInputs = (): boolean => {
        const newErrors: string[] = []

        if (!currentPassword.trim()) {
            newErrors.push("Current password is required")
        }

        if (!newPassword.trim()) {
            newErrors.push("New password is required")
        }

        if (!confirmPassword.trim()) {
            newErrors.push("Password confirmation is required")
        }

        if (newPassword !== confirmPassword) {
            newErrors.push("New passwords do not match")
        }

        if (currentPassword === newPassword) {
            newErrors.push("New password must be different from current password")
        }

        if (!passwordStrength.requirements.minLength) {
            newErrors.push("Password must be at least 8 characters long")
        }

        if (!passwordStrength.requirements.hasUppercase) {
            newErrors.push("Password must contain at least one uppercase letter")
        }

        if (!passwordStrength.requirements.hasLowercase) {
            newErrors.push("Password must contain at least one lowercase letter")
        }

        if (!passwordStrength.requirements.hasNumber) {
            newErrors.push("Password must contain at least one number")
        }

        if (!passwordStrength.requirements.hasSpecial) {
            newErrors.push("Password must contain at least one special character")
        }

        setErrors(newErrors)
        return newErrors.length === 0
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateInputs()) {
            return
        }

        setIsChanging(true)
        setSuccess(false)

        try {
            // First, verify the current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            })

            if (signInError) {
                setErrors(["Current password is incorrect"])
                setIsChanging(false)
                return
            }

            // Update the password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            })

            if (updateError) {
                console.error("Password update error:", updateError)
                toast({
                    variant: "destructive",
                    title: "Password Update Failed",
                    description: updateError.message || "Could not update your password. Please try again.",
                })
                setErrors([updateError.message || "Failed to update password"])
                setIsChanging(false)
                return
            }

            // Success
            setSuccess(true)
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setErrors([])

            toast({
                title: "Password Changed Successfully",
                description: "Your password has been updated. You may need to log in again.",
            })

            // Redirect after 2 seconds
            setTimeout(() => {
                router.push("/dashboard/settings")
            }, 2000)
        } catch (error: any) {
            console.error("Change password error:", error)
            setErrors([error.message || "An unexpected error occurred"])
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Could not change password",
            })
        } finally {
            setIsChanging(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Loading...</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 py-12 px-4">
            {/* Header */}
            <div className="space-y-4">
                <Link
                    href="/dashboard/settings"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Settings
                </Link>

                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                        <Lock className="h-3.5 w-3.5" />
                        Security
                    </div>
                    <h1 className="text-3xl md:text-4xl font-headline font-bold text-slate-900 leading-tight">Change Password</h1>
                    <p className="text-sm text-muted-foreground font-medium">Update your account password to keep your account secure.</p>
                </div>
            </div>

            {/* Main Card */}
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 p-8 border-b">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100">
                            <Lock className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800">Update Your Password</CardTitle>
                            <CardDescription className="text-xs font-medium">Keep your account secure with a strong password.</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8">
                    {/* Success Alert */}
                    {success && (
                        <Alert className="rounded-[1.5rem] p-4 bg-emerald-50 border-emerald-100 mb-6 animate-in fade-in duration-300">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <AlertTitle className="text-emerald-900 font-bold">Password Changed Successfully!</AlertTitle>
                            <AlertDescription className="text-emerald-800 text-sm mt-1">
                                Your password has been updated. You will be redirected to settings shortly.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Alerts */}
                    {errors.length > 0 && (
                        <Alert variant="destructive" className="rounded-[1.5rem] p-4 mb-6 animate-in fade-in duration-300">
                            <AlertCircle className="h-5 w-5" />
                            <AlertTitle>Password Change Failed</AlertTitle>
                            <AlertDescription className="mt-2 space-y-1">
                                {errors.map((error, idx) => (
                                    <p key={idx} className="text-sm flex items-start gap-2">
                                        <span className="text-lg leading-none mt-0.5">•</span>
                                        {error}
                                    </p>
                                ))}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-6">
                        {/* Current Password */}
                        <div className="space-y-3">
                            <Label htmlFor="current-password" className="text-xs font-black uppercase tracking-widest text-slate-500">
                                Current Password
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="current-password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    placeholder="Enter your current password"
                                    value={currentPassword}
                                    onChange={(e) => {
                                        setCurrentPassword(e.target.value)
                                        setErrors([])
                                    }}
                                    className="pl-12 pr-12 h-14 rounded-2xl bg-slate-50 border-none shadow-inner text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                                    disabled={isChanging || success}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                        {/* New Password */}
                        <div className="space-y-3">
                            <Label htmlFor="new-password" className="text-xs font-black uppercase tracking-widest text-slate-500">
                                New Password
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value)
                                        setErrors([])
                                    }}
                                    className="pl-12 pr-12 h-14 rounded-2xl bg-slate-50 border-none shadow-inner text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                                    disabled={isChanging || success}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {newPassword && (
                                <div className="space-y-2 mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-600">Password Strength</span>
                                        <span className={cn(
                                            "text-xs font-bold uppercase tracking-widest",
                                            passwordStrength.score === 0 && "text-slate-400",
                                            passwordStrength.score === 1 && "text-destructive",
                                            passwordStrength.score === 2 && "text-amber-500",
                                            passwordStrength.score === 3 && "text-blue-500",
                                            passwordStrength.score === 4 && "text-emerald-500"
                                        )}>
                                            {passwordStrength.feedback}
                                        </span>
                                    </div>

                                    {/* Strength Bar */}
                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all duration-300 rounded-full",
                                                passwordStrength.score === 0 && "w-0 bg-slate-400",
                                                passwordStrength.score === 1 && "w-1/4 bg-destructive",
                                                passwordStrength.score === 2 && "w-1/2 bg-amber-500",
                                                passwordStrength.score === 3 && "w-3/4 bg-blue-500",
                                                passwordStrength.score === 4 && "w-full bg-emerald-500"
                                            )}
                                        />
                                    </div>

                                    {/* Requirements */}
                                    <div className="space-y-2 mt-3 pt-3 border-t border-slate-200">
                                        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Requirements:</div>
                                        {[
                                            { label: "8+ characters", met: passwordStrength.requirements.minLength },
                                            { label: "Uppercase letter (A-Z)", met: passwordStrength.requirements.hasUppercase },
                                            { label: "Lowercase letter (a-z)", met: passwordStrength.requirements.hasLowercase },
                                            { label: "Number (0-9)", met: passwordStrength.requirements.hasNumber },
                                            { label: "Special character (!@#$%^&*)", met: passwordStrength.requirements.hasSpecial },
                                        ].map((req, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-all",
                                                    req.met
                                                        ? "bg-emerald-500 border-emerald-500"
                                                        : "bg-transparent border-slate-300"
                                                )}>
                                                    {req.met && <span className="text-white text-[10px] font-bold">✓</span>}
                                                </div>
                                                <span className={cn(
                                                    "text-xs",
                                                    req.met ? "text-emerald-600 font-medium" : "text-slate-500"
                                                )}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-3">
                            <Label htmlFor="confirm-password" className="text-xs font-black uppercase tracking-widest text-slate-500">
                                Confirm Password
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter your new password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value)
                                        setErrors([])
                                    }}
                                    className={cn(
                                        "pl-12 pr-12 h-14 rounded-2xl bg-slate-50 border-none shadow-inner text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all",
                                        confirmPassword && newPassword !== confirmPassword && "ring-2 ring-destructive/50 bg-destructive/5"
                                    )}
                                    disabled={isChanging || success}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-xs text-destructive font-medium flex items-center gap-1.5">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Passwords do not match
                                </p>
                            )}
                            {confirmPassword && newPassword === confirmPassword && (
                                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Passwords match
                                </p>
                            )}
                        </div>

                        {/* Info Alert */}
                        <Alert className="rounded-[1.5rem] p-4 bg-blue-50 border-blue-100 mt-6">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-900 font-semibold text-sm">Security Tips</AlertTitle>
                            <AlertDescription className="text-blue-800 text-xs mt-1 space-y-1">
                                <p>• Use a unique password you don't use elsewhere</p>
                                <p>• Never share your password with anyone, even TUAI staff</p>
                                <p>• Change your password regularly for better security</p>
                            </AlertDescription>
                        </Alert>

                        {/* Actions */}
                        <div className="flex gap-4 pt-6">
                            <Button
                                type="submit"
                                disabled={isChanging || success || !currentPassword || !newPassword || !confirmPassword}
                                className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                {isChanging ? (
                                    <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Updating...</>
                                ) : (
                                    <><Lock className="h-5 w-5 mr-2" /> Change Password</>
                                )}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => router.push("/dashboard/settings")}
                                disabled={isChanging}
                                variant="outline"
                                className="flex-1 h-14 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}