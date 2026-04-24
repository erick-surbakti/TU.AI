"use client";
export const dynamic = 'force-dynamic';
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Leaf,
  Mail,
  ArrowRight,
  Loader2,
  KeyRound,
  UserPlus,
  LogIn,
  User,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Turnstile } from "@marsidev/react-turnstile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASEAN_COUNTRIES } from "@/lib/localization";

export default function LoginPage() {
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [mode, setMode] = React.useState<
    "login" | "register" | "forgot" | "verify-otp"
  >("login");
  const [showPassword, setShowPassword] = React.useState(false);
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const [otp, setOtp] = React.useState("");
  const [verifyEmail, setVerifyEmail] = React.useState("");
  const [resendCooldown, setResendCooldown] = React.useState(0);
  // Stores form data while waiting for OTP — so we can create the profile after verify
  const [pendingProfile, setPendingProfile] = React.useState<any>(null);

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    birthday: "",
    countryCode: "MY",
  });

  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getAgeGroup = (age: number) => {
    if (age < 36) return "Young Farmer";
    if (age < 50) return "Mid Career";
    if (age < 60) return "Senior Active";
    if (age < 70) return "Easy Mode";
    return "Assisted Mode";
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        // Validate birthday and age
        if (!formData.birthday) {
          toast({
            variant: "destructive",
            title: "Birthday Required",
            description: "Please enter your birthday.",
          });
          setLoading(false);
          return;
        }

        const age = calculateAge(formData.birthday);
        if (age < 15) {
          toast({
            variant: "destructive",
            title: "Age Requirement",
            description: "You must be at least 15 years old to register.",
          });
          setLoading(false);
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast({
            variant: "destructive",
            title: "Invalid Email",
            description:
              "Please enter a valid email address (e.g., name@domain.com)",
          });
          setLoading(false);
          return;
        }

        const uppercaseRegExp = /(?=.*?[A-Z])/;
        const lowercaseRegExp = /(?=.*?[a-z])/;
        const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/;

        let passErr = "";
        if (formData.password.length < 8)
          passErr = "Password must be at least 8 characters.";
        else if (!uppercaseRegExp.test(formData.password))
          passErr = "Password must contain an uppercase letter.";
        else if (!lowercaseRegExp.test(formData.password))
          passErr = "Password must contain a lowercase letter.";
        else if (!specialCharRegExp.test(formData.password))
          passErr = "Password must contain a special character (#?!@$%^&*-).";

        if (passErr) {
          toast({
            variant: "destructive",
            title: "Weak Password",
            description: passErr,
          });
          setLoading(false);
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: formData.email,
            password: formData.password,
            options: {
              captchaToken: captchaToken || undefined,
              data: {
                display_name: formData.fullName,
              },
            },
          },
        );

        if (authError) throw authError;

        if (authData.session && authData.user) {
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
            language: "en-US",
          };

          const { error: dbError } = await supabase
            .from("users")
            .insert(userProfile);
          if (dbError) throw dbError;

          await supabase.auth.signOut();

          toast({
            title: "Account Created!",
            description: "Registration complete. Please log in.",
          });
          setMode("login");
          setFormData((prev) => ({ ...prev, password: "" }));
          return;
        } else {
          // Email confirm ON — save pending profile to create after OTP verify
          const ageNum = calculateAge(formData.birthday);
          const ageGroup = getAgeGroup(ageNum);
          setPendingProfile({
            email: formData.email,
            displayName: formData.fullName,
            phone: formData.phone,
            birth_date: formData.birthday,
            age: ageNum.toString(),
            age_group: ageGroup,
            easy_mode_enabled: ageNum >= 60,
            countryCode: formData.countryCode,
            language: "en-US",
          });
          toast({
            title: "Registration Successful",
            description: "Please check your email to complete the sign up!",
          });
          setVerifyEmail(formData.email);
          setResendCooldown(0);
          setMode("verify-otp");
          return;
        }
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          formData.email,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          },
        );
        if (error) throw error;
        toast({
          title: "Reset Link Sent",
          description: "Check your email for the recovery link.",
        });
        setMode("login");
        return;
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        toast({
          title: "Welcome Back!",
          description: "Syncing your farm records...",
        });
      }

      router.push("/dashboard");
    } catch (error: any) {
      let message = error.message || "An error occurred during authentication.";
      if (message.includes("already registered"))
        message = "This email is already registered.";
      if (message.includes("Invalid login credentials"))
        message = "Incorrect email or password.";

      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!otp || otp.length !== 8) {
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: "OTP must be 8 digits long.",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: verifyEmail,
        token: otp,
        type: "email",
      });

      if (error) throw error;

      if (data.session && data.user) {
        // Create user profile in DB now that email is confirmed
        if (pendingProfile) {
          const { error: dbError } = await supabase.from("users").insert({
            id: data.user.id,
            ...pendingProfile,
          });
          if (dbError) {
            console.error("Profile insert after OTP failed:", JSON.stringify(dbError));
            toast({
              variant: "destructive",
              title: "Profile Setup Warning",
              description: "Email verified but profile setup had an issue. Please re-register.",
            });
          } else {
            setPendingProfile(null);
          }
        }

        toast({
          title: "Email Verified!",
          description: "Welcome to TUAI. Logging you in...",
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push("/dashboard");
      }
    } catch (error: any) {
      let message = error.message || "OTP verification failed.";
      if (message.includes("invalid") || message.includes("expired")) {
        message =
          "Invalid or expired OTP. Please check your email and try again.";
      }

      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: verifyEmail,
      });

      if (error) throw error;

      toast({
        title: "OTP Resent",
        description: "Check your email for the new verification code.",
      });

      setResendCooldown(60);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Resend Failed",
        description: error.message || "Could not resend OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToAuth = () => {
    setOtp("");
    setVerifyEmail("");
    setResendCooldown(0);
    setMode("login");
    setFormData((prev) => ({ ...prev, password: "" }));
  };

  const handleGoogleAuth = async () => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white text-gray-900 overflow-x-hidden relative">
      {/* Background sevibes landing page */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="noise-login">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="4"
                result="noise"
                seed="2"
              />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="80" />
            </filter>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="#16a34a"
            opacity="0.1"
            filter="url(#noise-login)"
          />
        </svg>
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-green-600/5 to-teal-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header link */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <div className="w-5 h-5 bg-gradient-to-br from-green-600 to-emerald-600 rounded-md flex items-center justify-center">
            <Leaf className="w-3 h-3 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900 hidden sm:inline">
            tuai
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Heading sevibes landing - jika bukan OTP mode */}
        {mode !== "verify-otp" && (
          <div className="flex flex-col items-center mb-8 gap-3">
            <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-gray-900 text-center">
              {mode === "login"
                ? "Welcome back."
                : mode === "register"
                  ? "Get started."
                  : "Reset password."}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-light text-center">
              {mode === "login" && "Access your farm intelligence dashboard."}
              {mode === "register" &&
                "Join thousands of ASEAN farmers using AI."}
              {mode === "forgot" &&
                "We'll send you a link to reset your password."}
            </p>
          </div>
        )}

        {/* Card */}
        <div
          className={`${mode === "verify-otp" ? "bg-white/60" : "bg-white/60"} backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 sm:p-10 shadow-lg shadow-gray-200/20`}
        >
          {mode === "verify-otp" ? (
            <>
              {/* OTP Heading */}
              <div className="mb-8 text-center">
                <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-gray-900 mb-2">
                  Verify your email.
                </h2>
                <p className="text-base sm:text-lg text-gray-600 font-light">
                  We've sent an 8-digit code to{" "}
                  <span className="font-semibold text-gray-900">
                    {verifyEmail}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                {/* OTP Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="otp"
                    className="text-xs font-semibold uppercase tracking-wider text-gray-600"
                  >
                    Verification Code
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="otp"
                      placeholder="00000000"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))
                      }
                      maxLength={8}
                      className="pl-11 h-14 rounded-lg bg-gray-50 border border-gray-200 focus-visible:ring-2 focus-visible:ring-green-500/30 focus-visible:border-green-400 transition-all text-center text-2xl font-bold tracking-widest"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the 8-digit code from your email
                  </p>
                </div>

                {/* Verify Button */}
                <Button
                  disabled={loading || otp.length !== 8}
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-base group shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Verify Email
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                {/* Resend OTP */}
                <div className="flex items-center gap-2 text-sm justify-center">
                  <span className="text-gray-600">
                    Didn't receive the code?
                  </span>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading || resendCooldown > 0}
                    className={`font-semibold transition-all ${
                      resendCooldown > 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-green-600 hover:text-green-700"
                    }`}
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend OTP"}
                  </button>
                </div>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBackToAuth}
                  className="w-full text-gray-600 hover:text-gray-900 text-sm font-semibold transition-colors py-2"
                >
                  Back to Login
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-8 border-t border-gray-200 flex justify-center">
                <Link
                  href="/"
                  className="text-xs font-semibold text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2"
                >
                  <Leaf className="h-4 w-4" /> Return to Website
                </Link>
              </div>
            </>
          ) : (
            <>
              <Tabs
                defaultValue="login"
                className="w-full"
                onValueChange={(v) => setMode(v as any)}
              >
                {/* Tab Buttons */}
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12 rounded-xl bg-gray-100 p-1 gap-2">
                  <TabsTrigger
                    value="login"
                    className="rounded-lg font-semibold text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md transition-all"
                  >
                    <LogIn className="w-4 h-4 mr-2" /> Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="rounded-lg font-semibold text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md transition-all"
                  >
                    <UserPlus className="w-4 h-4 mr-2" /> Register
                  </TabsTrigger>
                </TabsList>

                {/* Google Auth */}
                <div className="space-y-4 mb-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleAuth}
                    className="w-full h-11 rounded-lg border border-gray-300 shadow-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                      or
                    </span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                </div>

                {/* Auth Form */}
                <form onSubmit={handleAuth} className="space-y-5">
                  {mode === "register" && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <Label
                          htmlFor="fullName"
                          className="text-xs font-semibold uppercase tracking-wider text-gray-600"
                        >
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="fullName"
                            placeholder="Ahmad Bin Abdullah"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="pl-11 h-11 rounded-lg bg-gray-50 border border-gray-200 focus-visible:ring-2 focus-visible:ring-green-500/30 focus-visible:border-green-400 transition-all"
                            required={mode === "register"}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="country"
                          className="text-xs font-semibold uppercase tracking-wider text-gray-600"
                        >
                          Home Country (ASEAN)
                        </Label>
                        <Select
                          value={formData.countryCode}
                          onValueChange={(v) =>
                            setFormData((prev) => ({ ...prev, countryCode: v }))
                          }
                        >
                          <SelectTrigger className="h-11 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500/30 transition-all pl-11 relative text-left">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-xl border-gray-100">
                            {Object.values(ASEAN_COUNTRIES).map((c) => (
                              <SelectItem
                                key={c.code}
                                value={c.code}
                                className="rounded-lg font-medium focus:bg-green-500/5 focus:text-green-700 py-2"
                              >
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="birthday"
                            className="text-xs font-semibold uppercase tracking-wider text-gray-600"
                          >
                            Birthday
                          </Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="birthday"
                              type="date"
                              value={formData.birthday}
                              onChange={handleInputChange}
                              className="pl-11 pr-3 h-11 rounded-lg bg-gray-50 border border-gray-200 focus-visible:ring-2 focus-visible:ring-green-500/30 focus-visible:border-green-400 transition-all"
                              required={mode === "register"}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="text-xs font-semibold uppercase tracking-wider text-gray-600"
                          >
                            Phone
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+60..."
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="pl-11 h-11 rounded-lg bg-gray-50 border border-gray-200 focus-visible:ring-2 focus-visible:ring-green-500/30 focus-visible:border-green-400 transition-all"
                              required={mode === "register"}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-semibold uppercase tracking-wider text-gray-600"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        placeholder="farmer@tuai.my"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-11 h-11 rounded-lg bg-gray-50 border border-gray-200 focus-visible:ring-2 focus-visible:ring-green-500/30 focus-visible:border-green-400 transition-all"
                        type="email"
                        required
                      />
                    </div>
                  </div>

                  {(mode === "login" || mode === "register") && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label
                          htmlFor="password"
                          className="text-xs font-semibold uppercase tracking-wider text-gray-600"
                        >
                          Password
                        </Label>
                        {mode === "login" && (
                          <button
                            type="button"
                            onClick={() => setMode("forgot")}
                            className="text-xs font-semibold text-green-600 hover:text-green-700 transition"
                          >
                            Forgot?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-11 pr-11 h-11 rounded-lg bg-gray-50 border border-gray-200 focus-visible:ring-2 focus-visible:ring-green-500/30 focus-visible:border-green-400 transition-all"
                          required={mode === "login" || mode === "register"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === "register" && turnstileKey && (
                    <div className="flex justify-center pt-2 animate-in fade-in zoom-in duration-500">
                      <Turnstile
                        siteKey={turnstileKey}
                        onSuccess={(token) => setCaptchaToken(token)}
                        onError={(err) =>
                          toast({
                            variant: "destructive",
                            title: "Human Verification Failed",
                            description: `Cloudflare Error: ${err}`,
                          })
                        }
                      />
                    </div>
                  )}

                  <Button
                    disabled={loading}
                    className="w-full h-11 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-base group shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all mt-6 active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
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

              {/* Footer */}
              <div className="mt-8 pt-8 border-t border-gray-200 flex justify-center">
                <Link
                  href="/"
                  className="text-xs font-semibold text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2"
                >
                  <Leaf className="h-4 w-4" /> Return to Website
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
