'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sprout, ShieldCheck, MapPin, Zap, ArrowRight, MessageCircle, ClipboardList, BarChart3, Globe, Sparkles, TrendingUp, Users, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculateTilt = (element: HTMLElement | null) => {
    if (!element || !hoveredCard) return { rotateX: 0, rotateY: 0 };
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateY = ((mousePos.x - centerX) / (rect.width / 2)) * 5;
    const rotateX = ((centerY - mousePos.y) / (rect.height / 2)) * 5;
    
    return { rotateX, rotateY };
  };
  const heroImageUrl = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop";

  const aseanCountries = [
    { name: 'Indonesia', flag: '🇮🇩', farmers: '2.4M', crops: 'Rice, Cocoa, Rubber' },
    { name: 'Philippines', flag: '🇵🇭', farmers: '1.8M', crops: 'Coconut, Rice, Corn' },
    { name: 'Vietnam', flag: '🇻🇳', farmers: '1.6M', crops: 'Rice, Coffee, Cashew' },
    { name: 'Thailand', flag: '🇹🇭', farmers: '1.2M', crops: 'Rice, Cassava, Rubber' },
    { name: 'Myanmar', flag: '🇲🇲', farmers: '900K', crops: 'Rice, Beans, Sesame' },
    { name: 'Malaysia', flag: '🇲🇾', farmers: '450K', crops: 'Palm Oil, Rubber, Cocoa' },
    { name: 'Cambodia', flag: '🇰🇭', farmers: '680K', crops: 'Rice, Cassava, Maize' },
    { name: 'Laos', flag: '🇱🇦', farmers: '520K', crops: 'Rice, Corn, Coffee' },
    { name: 'Singapore', flag: '🇸🇬', farmers: '12K', crops: 'Urban Farming, Tech Hub' },
    { name: 'Brunei', flag: '🇧🇳', farmers: '5K', crops: 'Rice, Vegetables' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-primary/20 scroll-smooth">
      <style>{`
        .tilt-card {
          transition: transform 0.2s ease-out;
          transform-style: preserve-3d;
        }
        
        .tilt-card:hover {
          will-change: transform;
        }
        
        .cursor-glow {
          position: fixed;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: -1;
          filter: blur(40px);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .tilt-card {
            transform: none !important;
          }
        }
      `}</style>
      
      {/* Cursor Glow Effect */}
      <div 
        className="cursor-glow fixed pointer-events-none z-0 opacity-30" 
        style={{
          left: `${mousePos.x - 200}px`,
          top: `${mousePos.y - 200}px`,
          transform: 'translate3d(0, 0, 0)',
          transition: 'left 0.1s ease-out, top 0.1s ease-out',
        }}
      />
      
      {/* Navigation */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between sticky top-0 bg-white/70 backdrop-blur-xl z-50 border-b border-gray-100">
        <Link className="flex items-center justify-center gap-2 group" href="/">
          <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-headline font-black text-primary tracking-tighter">TUAI</span>
        </Link>

        <nav className="hidden md:flex gap-10">
          <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="#features">Features</Link>
          <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="#coverage">ASEAN Coverage</Link>
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
        <section className="relative w-full h-screen min-h-[600px] overflow-hidden flex items-center">
          <Image
            src={heroImageUrl}
            alt="Lush green farm fields across ASEAN"
            fill
            className="object-cover absolute inset-0"
            priority
            unoptimized={true}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

          <div className="relative z-10 container mx-auto px-6 lg:px-12">
            <div className="flex flex-col gap-8 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/20 backdrop-blur-sm text-white text-xs font-bold w-fit mx-auto lg:mx-0 border border-emerald-200/30">
                <Globe className="h-3.5 w-3.5" />
                <span className="uppercase tracking-wider">Serving All 10 ASEAN Nations</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-headline font-bold text-white leading-[1.05] tracking-tight">
                Transform <br />
                <span className="text-emerald-300">
                  ASEAN Farms.
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-white/90 max-w-[550px] mx-auto lg:mx-0 leading-relaxed font-medium">
                One AI platform uniting farmers across Indonesia, Philippines, Vietnam, Thailand, Myanmar, Malaysia, Cambodia, Laos, Singapore, and Brunei with real-time crop intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 rounded-full text-lg h-16 px-10 shadow-xl shadow-primary/20 group font-bold transition-all"
                  >
                    Start Your Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#coverage" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full rounded-full text-lg h-16 px-10 bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 font-bold transition-all backdrop-blur-sm">
                    See ASEAN Coverage
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ASEAN Coverage Section */}
        <section id="coverage" className="py-32 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-3xl mb-20">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4">Our Reach</h2>
              <h3 className="text-4xl lg:text-5xl font-headline font-bold text-slate-900 mb-6">
                Uniting farmers across <br /> Southeast Asia.
              </h3>
              <p className="text-xl text-slate-500 font-medium">
                From island rice paddies to mountain plantations, TUAI serves every agricultural region of ASEAN.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {aseanCountries.map((country, i) => {
                const cardId = `country-${i}`;
                const tilt = hoveredCard === cardId ? calculateTilt(document.getElementById(cardId)) : { rotateX: 0, rotateY: 0 };
                
                return (
                  <div
                    key={i}
                    id={cardId}
                    className="p-6 rounded-[24px] bg-white border border-slate-100 hover:border-primary/20 transition-all group cursor-pointer tilt-card relative"
                    onMouseEnter={() => setHoveredCard(cardId)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                      boxShadow: hoveredCard === cardId 
                        ? '0 20px 40px rgba(16, 185, 129, 0.2), 0 0 30px rgba(16, 185, 129, 0.1)' 
                        : '0 4px 6px rgba(0, 0, 0, 0.07)'
                    }}
                  >
                    <div className="text-4xl mb-4 inline-block group-hover:scale-125 transition-transform duration-300">{country.flag}</div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{country.name}</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold text-primary">{country.farmers}</span> farmers
                      </div>
                      <div className="text-xs text-slate-500 leading-relaxed">
                        {country.crops}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 bg-slate-50/50">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-3xl mb-20">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4">The Platform</h2>
              <h3 className="text-4xl lg:text-5xl font-headline font-bold text-slate-900 mb-6">
                Intelligence built for <br /> ASEAN farmers.
              </h3>
              <p className="text-xl text-slate-500 font-medium">
                Multilingual support, localized crop varieties, regional weather patterns, and ASEAN commodity markets.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Crop Disease AI", desc: "Identify rice blast, coconut bud rot, coffee leaf rust. Upload a photo—get instant diagnosis.", icon: Sprout, color: "bg-emerald-500", link: "/dashboard/disease-scan" },
                { title: "Regional Risk Intel", desc: "Track weather across ASEAN, commodity prices from Bangkok to Jakarta, supply chain threats.", icon: ShieldCheck, color: "bg-blue-500", link: "/dashboard/risk-intel" },
                { title: "Multilingual Copilot", desc: "Ask in Indonesian, Vietnamese, Thai, Tagalog, or English. Get policy and weather answers instantly.", icon: MessageCircle, color: "bg-cyan-500", link: "/dashboard/chat" },
                { title: "Local Supplier Network", desc: "Find certified seed suppliers, fertilizer dealers, and equipment vendors in your province.", icon: MapPin, color: "bg-orange-500", link: "/dashboard/suppliers" },
                { title: "Harvest Ledger", desc: "Track yields, costs, and profits. Export certifications for regional export buyers.", icon: ClipboardList, color: "bg-purple-500", link: "/dashboard/records" },
                { title: "Market Pulse", desc: "Real-time ASEAN futures prices, buyer networks, and seasonal demand forecasts.", icon: TrendingUp, color: "bg-yellow-500", link: "/dashboard" }
              ].map((f, i) => {
                const cardId = `feature-${i}`;
                const tilt = hoveredCard === cardId ? calculateTilt(document.getElementById(cardId)) : { rotateX: 0, rotateY: 0 };
                
                return (
                  <div
                    key={i}
                    id={cardId}
                    className="p-10 rounded-[32px] bg-white border border-slate-100 hover:border-primary/20 transition-all group cursor-pointer h-full tilt-card relative"
                    onMouseEnter={() => setHoveredCard(cardId)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                      boxShadow: hoveredCard === cardId 
                        ? '0 25px 50px rgba(16, 185, 129, 0.2), 0 0 40px rgba(16, 185, 129, 0.1)' 
                        : '0 4px 15px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    <Link href={f.link} className="block h-full">
                      <div className={`h-12 w-12 ${f.color} rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-black/10 group-hover:-rotate-6 transition-all duration-300 group-hover:scale-110`}>
                        <f.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-primary transition-colors">{f.title}</h3>
                      <p className="text-slate-500 leading-relaxed font-medium group-hover:text-slate-600 transition-colors">{f.desc}</p>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Regional Impact Section */}
        <section id="impact" className="py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <div className="max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">Transforming ASEAN agriculture</h2>
              <p className="text-lg text-slate-600 font-medium">
                One digital season at a time across all 10 nations.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: "9.2M+", label: "ASEAN Farmers Reached", desc: "Across all 10 member nations" },
                { value: "28%", label: "Avg Yield Increase", desc: "Verified across rice, palm, coconut" },
                { value: "6.4B", label: "USD Value Added", desc: "Regional farm revenue impact" },
                { value: "12", label: "Languages Supported", desc: "Local & national dialects" }
              ].map((stat, i) => {
                const cardId = `stat-${i}`;
                const tilt = hoveredCard === cardId ? calculateTilt(document.getElementById(cardId)) : { rotateX: 0, rotateY: 0 };
                
                return (
                  <div 
                    key={i}
                    id={cardId}
                    className="space-y-4 p-8 rounded-[24px] bg-slate-50 border border-slate-100 tilt-card relative cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredCard(cardId)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                      boxShadow: hoveredCard === cardId 
                        ? '0 20px 40px rgba(16, 185, 129, 0.15), 0 0 30px rgba(16, 185, 129, 0.1)' 
                        : '0 4px 6px rgba(0, 0, 0, 0.07)'
                    }}
                  >
                    <div className="text-5xl font-black text-primary group-hover:scale-110 transition-transform">{stat.value}</div>
                    <div className="font-bold text-slate-600 uppercase tracking-widest text-sm">{stat.label}</div>
                    <p className="text-xs text-slate-500">{stat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary via-primary to-emerald-400">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
              Join the ASEAN agricultural revolution.
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium">
              Start with a free trial. No credit card. Instant access to crop AI, market data, and a network of 9.2M+ farmers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-white hover:bg-gray-100 text-primary rounded-full text-lg h-16 px-10 font-bold shadow-xl transition-all"
                >
                  Start Your Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#coverage" className="w-full sm:w-auto">
                <Button size="lg" className="w-full rounded-full text-lg h-16 px-10 bg-white/20 hover:bg-white/30 text-white border border-white/40 hover:border-white/60 font-bold transition-all">
                  Explore Regions
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Leaf className="h-8 w-8 text-primary" />
                <span className="text-2xl font-black text-white tracking-tighter">TUAI</span>
              </div>
              <p className="max-w-xs font-medium">
                Uniting farmers across Indonesia, Philippines, Vietnam, Thailand, Myanmar, Malaysia, Cambodia, Laos, Singapore, and Brunei with intelligent agricultural technology.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                <div className="space-y-2 text-sm">
                  <p><Link href="/dashboard/disease-scan" className="hover:text-primary transition-colors">Disease Detection</Link></p>
                  <p><Link href="/dashboard/risk-intel" className="hover:text-primary transition-colors">Risk Intelligence</Link></p>
                  <p><Link href="/dashboard/suppliers" className="hover:text-primary transition-colors">Supplier Network</Link></p>
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">ASEAN</h4>
                <div className="space-y-2 text-sm">
                  <p>Serving all 10 member nations</p>
                  <p>Multi-language support</p>
                  <p>Localized for each region</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2026 TUAI Agriculture. Building Southeast Asia's food future.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}