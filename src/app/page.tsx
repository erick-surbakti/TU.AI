"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Leaf } from "lucide-react";

export default function TUAIUltraClean() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  const handleRedirectToLogin = () => {
    router.push("/login");
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* ULTRA MINIMAL HEADER */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-card/80 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-primary to-secondary rounded-md flex items-center justify-center flex-shrink-0">
              <Leaf className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:inline text-foreground">
              tuai
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition hidden sm:block"
            >
              Sign in
            </Link>
            <button 
              onClick={handleRedirectToLogin}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs sm:text-sm font-medium rounded-full hover:shadow-lg hover:shadow-primary/20 transition flex-shrink-0"
            >
              Start
            </button>
          </div>
        </div>
      </header>

      <main className="pt-0">
        {/* HERO SECTION WITH BACKGROUND VIDEO/GIF EFFECT */}
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary via-secondary to-primary">
          {/* Background with animated farm field effect */}
          <div className="absolute inset-0 w-full h-full">
            {/* Simulated video background - animated gradient mimicking farm fields */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary via-[hsl(174,57%,35%)] to-secondary" />

            {/* Animated film grain / field texture effect */}
            <svg
              className="absolute inset-0 w-full h-full opacity-30"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <filter id="noise">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.9"
                    numOctaves="4"
                    result="noise"
                    seed="2"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="80"
                  />
                </filter>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="#16a34a"
                opacity="0.1"
                filter="url(#noise)"
              />
            </svg>

            {/* Moving wave pattern - simulates field rows */}
            <div className="absolute inset-0 opacity-20">
              <svg
                className="w-full h-full"
                viewBox="0 0 1200 600"
                preserveAspectRatio="none"
              >
                <defs>
                  <pattern
                    id="fieldRows"
                    x="0"
                    y="0"
                    width="80"
                    height="600"
                    patternUnits="userSpaceOnUse"
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="600"
                      stroke="rgba(34,197,94,0.3)"
                      strokeWidth="2"
                    />
                  </pattern>
                </defs>
                <rect width="1200" height="600" fill="url(#fieldRows)" />
              </svg>
            </div>

            {/* Animated light rays */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 animate-pulse" />

            {/* Floating organic shapes for depth */}
            <div className="absolute top-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 left-20 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
          </div>

          {/* Content - Ultra Minimal */}
          <div className="relative z-10 w-full px-6 sm:px-8 lg:px-12 py-20">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6 sm:space-y-8">
                {/* Main Heading - LARGE AND SIMPLE */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-tight text-primary-foreground">
                  Grow smarter.
                  <br />
                  <span className="font-semibold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                    Harvest better.
                  </span>
                </h1>

                {/* Subheading */}
                <p className="text-base sm:text-lg md:text-xl text-primary-foreground/85 font-light leading-relaxed max-w-xl">
                  Real-time crop intelligence for every ASEAN farmer.
                </p>

                {/* CTA Buttons - Simple */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button 
                    onClick={handleRedirectToLogin}
                    className="px-6 sm:px-8 py-3 bg-card text-primary font-semibold rounded-full hover:bg-card/80 transition text-sm sm:text-base w-full sm:w-auto"
                  >
                    Get started
                  </button>
                  <button 
                    onClick={handleRedirectToLogin}
                    className="px-6 sm:px-8 py-3 border border-primary-foreground/30 text-primary-foreground font-medium rounded-full hover:bg-primary-foreground/10 transition text-sm sm:text-base w-full sm:w-auto"
                  >
                    Learn more
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20">
            <svg
              className="w-6 h-6 text-primary-foreground/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="w-full px-6 sm:px-8 lg:px-12 py-16 sm:py-20 md:py-28 bg-background"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-3 tracking-tight text-foreground">
              Built for farmers.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-light mb-10 md:mb-16">
              Everything you need to grow better.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Disease Detection",
                  desc: "Upload a photo. Get instant diagnosis and treatment.",
                },
                {
                  title: "Market Prices",
                  desc: "Track prices across ASEAN. Know when to sell.",
                },
                {
                  title: "Weather Forecast",
                  desc: "Hyper-local predictions for your exact location.",
                },
                {
                  title: "AI Assistant",
                  desc: "Ask in your language. Available 24/7.",
                },
                {
                  title: "Yield Tracking",
                  desc: "Monitor harvests, costs, and profits.",
                },
                {
                  title: "Supplier Network",
                  desc: "Connect with certified seed and equipment providers.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl border border-border bg-gradient-to-br from-accent to-card hover:border-accent transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* STORIES */}
        <section
          id="stories"
          className="w-full px-6 sm:px-8 lg:px-12 py-16 sm:py-20 md:py-28 bg-background"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-3 tracking-tight text-foreground">
              From ASEAN farmers.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-light mb-10 md:mb-16">
              Real results from real farmers.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  name: "Budi Santoso",
                  location: "Central Java",
                  story:
                    "Early disease detection saved my entire harvest. +28% yield this season.",
                },
                {
                  name: "Maria Santos",
                  location: "Mindanao",
                  story:
                    "Market price alerts helped me sell at the perfect time. +32% revenue.",
                },
                {
                  name: "Nguyen Duc Hieu",
                  location: "Mekong Delta",
                  story:
                    "Weather forecasts optimized my irrigation perfectly. -25% water usage.",
                },
                {
                  name: "Somchai Ruamchai",
                  location: "Bangkok",
                  story:
                    "Supplier network improved my crop quality. +18% quality grade.",
                },
              ].map((story, i) => (
                <div
                  key={i}
                  className="p-6 md:p-8 bg-gradient-to-br from-accent to-card rounded-xl border border-border hover:border-secondary transition-colors"
                >
                  <p className="font-semibold text-foreground mb-1">
                    {story.name}
                  </p>
                  <p className="text-xs text-primary font-medium mb-4">
                    {story.location}
                  </p>
                  <p className="text-base text-foreground font-light leading-relaxed">
                    "{story.story}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* STATS */}
        <section className="w-full px-6 sm:px-8 lg:px-12 py-16 sm:py-20 md:py-28 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 sm:p-12 md:p-16 text-primary-foreground">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-3 tracking-tight leading-tight">
                Growing across ASEAN.
              </h2>
              <p className="text-lg font-light text-primary-foreground/80 mb-12 max-w-2xl">
                Thousands of farmers already using TUAI.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { number: "9.2M+", label: "Farmers" },
                  { number: "28%", label: "Yield increase" },
                  { number: "$6.4B", label: "Impact" },
                  { number: "10", label: "ASEAN nations" },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-light">
                      {stat.number}
                    </p>
                    <p className="text-xs sm:text-sm text-primary-foreground/80 mt-2">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* HOW IT WORKS */}
        <section
          id="how"
          className="w-full px-6 sm:px-8 lg:px-12 py-16 sm:py-20 md:py-28"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-3 tracking-tight">
              Get started in minutes.
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-light mb-10 md:mb-16">
              4 simple steps.
            </p>

            <div className="space-y-8 md:space-y-12">
              {[
                {
                  step: "01",
                  title: "Download",
                  desc: "Get the app on iOS or Android.",
                },
                {
                  step: "02",
                  title: "Set up farm",
                  desc: "Tell us about your crops and location.",
                },
                {
                  step: "03",
                  title: "Get insights",
                  desc: "Upload photos, check prices, chat with AI.",
                },
                {
                  step: "04",
                  title: "Earn more",
                  desc: "Better decisions. Higher yields. More profit.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-6 md:gap-12 items-start group hover:bg-gray-50 p-4 rounded-lg transition"
                >
                  <div className="text-4xl md:text-5xl font-light text-gray-300 group-hover:text-green-300 transition w-20 flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl md:text-2xl font-semibold mb-1 text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 font-light">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-green-200/40 to-transparent" />

        {/* PRICING */}
        <section
          id="pricing"
          className="w-full px-6 sm:px-8 lg:px-12 py-16 sm:py-20 md:py-28"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-3 tracking-tight">
              Simple pricing.
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-light mb-10 md:mb-16">
              Start free. Scale as you grow.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Starter",
                  price: "Free",
                  features: [
                    "Disease detection",
                    "Basic weather",
                    "Community support",
                  ],
                },
                {
                  name: "Professional",
                  price: "₱299/mo",
                  features: [
                    "Everything in Starter",
                    "Market alerts",
                    "Yield tracking",
                    "Priority support",
                  ],
                  highlight: true,
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  features: [
                    "Everything in Pro",
                    "Custom integration",
                    "Dedicated support",
                  ],
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`p-6 md:p-8 rounded-xl border transition-colors ${
                    plan.highlight
                      ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-3xl md:text-4xl font-light mb-6">
                    {plan.price}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, j) => (
                      <li
                        key={j}
                        className="text-sm text-gray-700 font-light flex gap-2"
                      >
                        <span className="text-green-600 flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleRedirectToLogin}
                    className={`w-full py-3 rounded-full font-medium transition text-sm ${
                      plan.highlight
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "border border-gray-300 text-gray-900 hover:border-green-500"
                    }`}
                  >
                    Get started
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-green-200/40 to-transparent" />

        {/* Final CTA */}
        <section className="w-full px-6 sm:px-8 lg:px-12 py-16 sm:py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-4 tracking-tight">
              Start today.
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-light mb-8">
              7 days free. No credit card. Support in 12 languages.
            </p>

            <button 
              onClick={handleRedirectToLogin}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-green-600/30 transition"
            >
              Get started free
            </button>
          </div>
        </section>
      </main>

      {/* MINIMAL FOOTER */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8 md:mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-sm">tuai</span>
              </div>
              <p className="text-xs text-gray-600 font-light">
                Intelligent farming for ASEAN.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-3">Product</p>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>
                  <Link href="#" className="hover:text-green-700 transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-green-700 transition">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold mb-3">Company</p>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>
                  <Link href="#" className="hover:text-green-700 transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-green-700 transition">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold mb-3">Support</p>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>
                  <Link href="#" className="hover:text-green-700 transition">
                    Help
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-green-700 transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold mb-3">Legal</p>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>
                  <Link href="#" className="hover:text-green-700 transition">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-green-700 transition">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <p>© 2026 TUAI. Powering ASEAN agriculture.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-green-700 transition">
                Privacy
              </Link>
              <Link href="#" className="hover:text-green-700 transition">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
