
import Link from 'next/link';
import Image from 'next/image';
import { Sprout, ShieldCheck, MapPin, Zap, ArrowRight, MessageCircle, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-farm');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <header className="px-4 lg:px-8 h-20 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b">
        <Link className="flex items-center justify-center gap-2" href="/">
          <Sprout className="h-8 w-8 text-primary" />
          <span className="text-2xl font-headline font-bold text-primary tracking-tight">TUAI</span>
        </Link>
        <nav className="hidden md:flex gap-8">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">Features</Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#about">Mission</Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#impact">Impact</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-bold">Login</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-primary hover:bg-primary/90 rounded-full px-6 font-bold">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-accent/20 to-white">
          <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold w-fit mx-auto lg:mx-0">
                <Zap className="h-4 w-4" />
                <span>Next-Gen AgTech for ASEAN</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-headline font-bold text-foreground leading-[1.1]">
                Empowering Farmers with <span className="text-primary">Intelligence.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px] mx-auto lg:mx-0 leading-relaxed">
                TUAI moves beyond simple advice. Our AI agents monitor global risks, diagnose crop diseases, and execute action plans to secure your harvest.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full text-lg h-14 px-10 shadow-lg shadow-primary/20 group font-bold">
                    Start Your Trial 
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="rounded-full text-lg h-14 px-10 border-primary text-primary font-bold">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-square lg:aspect-auto h-[500px] lg:h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill
                  className="object-cover"
                  priority
                  data-ai-hint="green farm"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
              {/* Floating badges */}
              <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Sprout className="text-primary h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Disease Identified</div>
                  <div className="text-xs text-muted-foreground">Confidence: 98%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-headline font-bold text-foreground">The TUAI Intelligence Stack</h2>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                Built on Google Cloud & Vertex AI to provide enterprise-grade insights for local farms.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Crop Disease AI",
                  desc: "Upload a photo and let our vision agents diagnose issues in seconds using Gemini Flash.",
                  icon: Sprout,
                  color: "bg-emerald-50 text-emerald-600"
                },
                {
                  title: "Risk Advisor",
                  desc: "Autonomous monitoring of global news and commodity prices to predict supply shocks.",
                  icon: ShieldCheck,
                  color: "bg-blue-50 text-blue-600"
                },
                {
                  title: "Farmer Copilot",
                  desc: "Ask anything. Our LLM-powered assistant retrieves policy and weather data for real answers.",
                  icon: MessageCircle,
                  color: "bg-cyan-50 text-cyan-600"
                },
                {
                  title: "Supplier Finder",
                  desc: "Instant location-based searching for fertilizer, seeds, and equipment.",
                  icon: MapPin,
                  color: "bg-orange-50 text-orange-600"
                },
                {
                  title: "Records Ledger",
                  desc: "Keep all your harvest and treatment data secure and accessible anywhere.",
                  icon: ClipboardList,
                  color: "bg-purple-50 text-purple-600"
                },
                {
                  title: "Smart Alerts",
                  desc: "Push notifications for localized weather risks and market fluctuations.",
                  icon: Zap,
                  color: "bg-yellow-50 text-yellow-600"
                }
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-3xl border border-border hover:border-primary/30 transition-all hover:shadow-xl group">
                  <div className={`h-14 w-14 ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold mb-4">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#F0F4F6] border-t py-12">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-2xl font-headline font-bold text-primary tracking-tight">TUAI</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 TUAI Agriculture. All rights reserved. Malaysia-first.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Privacy</Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Terms</Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
