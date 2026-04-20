'use server';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sprout, ShieldCheck, MapPin, Zap, ArrowRight, MessageCircle, ClipboardList, BarChart3, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

export default async function LandingPage() {
  const heroImageUrl = "https://media.istockphoto.com/id/1328004520/photo/healthy-young-soybean-crop-in-field-at-dawn.jpg?b=1&s=170667a&w=0&k=20&c=nb9fxR6z4ztjH_Ov-3NCHPd0O5SpBwxWXmKeEd4W9pc=";

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-primary/20 scroll-smooth">
      {/* Navigation */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between sticky top-0 bg-white/70 backdrop-blur-xl z-50 border-b border-gray-100">
        <Link className="flex items-center justify-center gap-2 group" href="/">
          <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <Sprout className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-headline font-black text-primary tracking-tighter">TUAI</span>
        </Link>

        <nav className="hidden md:flex gap-10">
          <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="#features">Features</Link>
          <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="#mission">Mission</Link>
          <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="#impact">Impact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="font-bold hover:bg-primary/5">Login</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-primary hover:bg-primary/90 rounded-full px-8 font-bold shadow-md hover:shadow-lg transition-all">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-28 overflow-hidden">
          <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold w-fit mx-auto lg:mx-0 border border-emerald-100">
                <Zap className="h-3.5 w-3.5 fill-emerald-700" />
                <span className="uppercase tracking-wider">Next-Gen AgTech for ASEAN</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-headline font-bold text-slate-900 leading-[1.05] tracking-tight">
                Farm with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                  Intelligence.
                </span>
              </h1>
              <p className="text-xl text-slate-600 max-w-[550px] mx-auto lg:mx-0 leading-relaxed font-medium">
                TUAI moves beyond simple advice. Our AI agents monitor global risks, diagnose crop diseases, and execute action plans to secure your harvest.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 rounded-full text-lg h-16 px-10 shadow-xl shadow-primary/20 group font-bold w-full sm:w-auto"
                  >
                    Start Your Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="rounded-full text-lg h-16 px-10 border-2 border-slate-200 hover:border-primary hover:text-primary font-bold transition-all w-full sm:w-auto">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-emerald-200/20 rounded-[40px] blur-2xl group-hover:blur-3xl transition-all opacity-70" />
              <div className="relative aspect-video w-full rounded-[32px] overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src={heroImageUrl}
                  alt="Lush green farm fields"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  unoptimized={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Floating UI Element */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl flex items-center gap-5 border border-white/50 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                  <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                    <ShieldCheck className="text-white h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-800 uppercase tracking-wide">System Status: Active</div>
                    <div className="text-xs text-slate-500 font-bold italic">Monitoring 42 Hectares in Kedah, MY</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 bg-slate-50/50">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-3xl mb-20">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4">The Platform</h2>
              <h3 className="text-4xl lg:text-5xl font-headline font-bold text-slate-900 mb-6">
                Everything you need to <br /> scale your production.
              </h3>
              <p className="text-xl text-slate-500 font-medium">
                Built on Google Cloud & Vertex AI to provide enterprise-grade insights for local farms.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Crop Disease AI", desc: "Upload a photo and let our vision agents diagnose issues in seconds using Gemini Flash.", icon: Sprout, color: "bg-emerald-500", link: "/dashboard/disease-scan" },
                { title: "Risk Advisor", desc: "Autonomous monitoring of global news and commodity prices to predict supply shocks.", icon: ShieldCheck, color: "bg-blue-500", link: "/dashboard/risk-intel" },
                { title: "Farmer Copilot", desc: "Ask anything. Our LLM-powered assistant retrieves policy and weather data for real answers.", icon: MessageCircle, color: "bg-cyan-500", link: "/dashboard/chat" },
                { title: "Supplier Finder", desc: "Instant location-based searching for fertilizer, seeds, and equipment.", icon: MapPin, color: "bg-orange-500", link: "/dashboard/suppliers" },
                { title: "Records Ledger", desc: "Keep all your harvest and treatment data secure and accessible anywhere.", icon: ClipboardList, color: "bg-purple-500", link: "/dashboard/records" },
                { title: "Smart Alerts", desc: "Push notifications for localized weather risks and market fluctuations.", icon: Zap, color: "bg-yellow-500", link: "/dashboard" }
              ].map((f, i) => (
                <Link href={f.link} key={i}>
                  <div
                    className="p-10 rounded-[32px] bg-white border border-slate-100 hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/5 group cursor-pointer h-full"
                  >
                    <div className={`h-12 w-12 ${f.color} rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-black/10 group-hover:-rotate-6 transition-transform`}>
                      <f.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-900">{f.title}</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="py-32 bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4">
            <Globe className="w-[600px] h-[600px]" />
          </div>
          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl lg:text-6xl font-bold mb-8">Our Mission: Resilient ASEAN Agriculture</h2>
                <p className="text-xl text-primary-foreground/80 leading-relaxed mb-8 font-medium">
                  We believe that technology shouldn't just be for big corporations. TUAI was founded to bring the power of Generative AI to every smallholder farmer in Southeast Asia, ensuring food security for the next generation.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="lg" className="rounded-full font-bold px-8">Read Our Whitepaper</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-headline font-bold text-primary">TUAI Vision 2026</DialogTitle>
                      <DialogDescription className="text-lg font-medium">The Roadmap to Zero Export Dependency</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4 text-slate-700 leading-relaxed">
                      <p className="font-bold text-xl">1. The Crisis of Dependency</p>
                      <p>ASEAN nations, while fertile, remain heavily dependent on volatile global supply chains for fertilizers and machinery. Geopolitical shocks (e.g., Eastern European conflicts) directly impact the cost of Padi production in Kedah and Selangor.</p>

                      <p className="font-bold text-xl">2. AI as a Sovereign Shield</p>
                      <p>TUAI implements locally-grounded LLMs (Gemini Pro) to monitor these global shocks 24/7. By providing farmers with real-time risk assessments, we allow them to stockpile resources or shift strategies before the market crashes.</p>

                      <p className="font-bold text-xl">3. The Future of Smallholder Farms</p>
                      <p>Our roadmap includes the integration of autonomous drone spraying and AI soil sensors, traditionally reserved for massive estates, making them accessible to farmers with less than 5 hectares.</p>

                      <div className="space-y-6">
                        <p>Food security is national security. TUAI is more than a tool; it is a digital ecosystem designed to ensure the ASEAN region can feed its people regardless of global instability.</p>
                        <p>Built for the farmers of Southeast Asia.</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-8 border border-white/20">
                <div className="space-y-6">
                  {[
                    { label: "Data-Driven Decisions", val: "100%" },
                    { label: "Localization Support", val: "ASEAN-wide" },
                    { label: "AI Response Time", val: "< 2.0s" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-end border-b border-white/10 pb-4">
                      <span className="font-bold text-lg">{item.label}</span>
                      <span className="text-3xl font-black text-emerald-400">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-4xl font-bold mb-16">Creating Real Impact</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="text-5xl font-black text-primary">15k+</div>
                <div className="font-bold text-slate-600 uppercase tracking-widest text-sm">Farmers Empowered</div>
              </div>
              <div className="space-y-4">
                <div className="text-5xl font-black text-primary">30%</div>
                <div className="font-bold text-slate-600 uppercase tracking-widest text-sm">Yield Increase</div>
              </div>
              <div className="space-y-4">
                <div className="text-5xl font-black text-primary">24/7</div>
                <div className="font-bold text-slate-600 uppercase tracking-widest text-sm">AI Monitoring</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Sprout className="h-8 w-8 text-primary" />
                <span className="text-2xl font-black text-white tracking-tighter">TUAI</span>
              </div>
              <p className="max-w-xs font-medium">
                Leading the digital transformation of agriculture across the ASEAN region.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="flex flex-col gap-4">
                <span className="text-white font-bold">Product</span>
                <Link href="#features" className="text-left hover:text-primary transition-colors">Features</Link>
                <Link href="/login" className="text-left hover:text-primary transition-colors">Pricing</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-white font-bold">Company</span>
                <Link href="#mission" className="text-left hover:text-primary transition-colors">About Us</Link>
                <Dialog>
                  <DialogTrigger className="text-left hover:text-primary transition-colors">Careers</DialogTrigger>
                  <DialogContent className="rounded-3xl">
                    <DialogHeader>
                      <DialogTitle>Join the TUAI Team</DialogTitle>
                      <DialogDescription>
                        We are currently looking for agricultural engineers and AI specialists to help secure the future of farming in ASEAN.
                      </DialogDescription>
                    </DialogHeader>
                    <p className="text-sm font-medium">Email your CV to careers@tuai.my</p>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-white font-bold">Legal</span>
                <Dialog>
                  <DialogTrigger className="text-left hover:text-primary transition-colors">Privacy</DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto rounded-3xl">
                    <DialogHeader>
                      <DialogTitle>Privacy Policy</DialogTitle>
                      <DialogDescription>How TUAI protects your farm data.</DialogDescription>
                    </DialogHeader>
                    <div className="text-sm space-y-4">
                      <p>At TUAI, we prioritize the confidentiality of your agricultural data. All uploaded images and farm records are encrypted and used solely for providing AI-driven insights to your account.</p>
                      <p>We do not sell your personal or farm-specific data to third parties. Data is aggregated anonymously to improve regional crop performance models.</p>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger className="text-left hover:text-primary transition-colors">Terms</DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto rounded-3xl">
                    <DialogHeader>
                      <DialogTitle>Terms of Service</DialogTitle>
                      <DialogDescription>Your agreement with TUAI Agriculture.</DialogDescription>
                    </DialogHeader>
                    <div className="text-sm space-y-4">
                      <p>By using TUAI, you agree to provide accurate information regarding your farming operations to ensure the best possible AI results.</p>
                      <p>The advice provided by the AI Copilot is grounded in regional data but should be verified with local agricultural authorities for critical decisions.</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2026 TUAI Agriculture. All rights reserved. Malaysia-first.</p>
            <div className="flex gap-6">
              <Link href="https://x.com" target="_blank" className="hover:text-primary transition-colors uppercase tracking-widest font-black text-[10px]">X.com</Link>
              <Link href="https://linkedin.com" target="_blank" className="hover:text-primary transition-colors uppercase tracking-widest font-black text-[10px]">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
