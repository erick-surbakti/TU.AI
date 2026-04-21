
"use client"

import * as React from "react"
import { Search, MapPin, Phone, Navigation, Loader2, Info, Navigation2, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { findSuppliers, type SupplierFinderOutput } from "@/ai/flows/supplier-finder-flow"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { createClient } from "@/supabase/client"
import { ASEAN_COUNTRIES } from "@/lib/localization"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { logSupplierSearch } from "@/lib/lib-activity-logger"

export default function SuppliersPage() {
  const [query, setQuery] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [results, setResults] = React.useState<SupplierFinderOutput | null>(null)
  const [location, setLocation] = React.useState<{lat: number, lng: number} | null>(null)
  const [locationLoading, setLocationLoading] = React.useState(false)
  const [groqKey, setGroqKey] = React.useState<string | null>(null)
  const [countryCode, setCountryCode] = React.useState<string>("MY")
  const [user, setUser] = React.useState<any>(null)
  const { toast } = useToast()
  const supabase = createClient()

  React.useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase.from('users').select('geminiApiKey, countryCode').eq('id', user.id).single()
        if (profile?.geminiApiKey) setGroqKey(profile.geminiApiKey)
        if (profile?.countryCode) setCountryCode(profile.countryCode)
      }
    }
    init()
  }, [])

  const fallbackKey = process.env.NEXT_PUBLIC_GROQ_API_KEY
  const activeKey = groqKey || fallbackKey

  const getUserLocation = React.useCallback(() => {
    setLocationLoading(true)
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation."
      })
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLocationLoading(false)
        toast({
          title: "Location detected!",
          description: "We are now finding suppliers nearest to you."
        })
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Location Denied",
          description: "Please enable location access to find nearest suppliers."
        })
        setLocationLoading(false)
      }
    )
  }, [toast])

  // Automatically get location on mount
  React.useEffect(() => {
    getUserLocation()
  }, [getUserLocation])
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return

    if (!activeKey) {
      toast({
        variant: "destructive",
        title: "Missing API Key",
        description: "Please add your Groq API Key in Settings to use the Supplier Finder."
      })
      return
    }

    setIsSearching(true)
    try {
      // Use detected location or fallback to Capital City of the user's country
      const config = ASEAN_COUNTRIES[countryCode] || ASEAN_COUNTRIES["MY"]
      const lat = location?.lat || config.capitalCoords.lat
      const lng = location?.lng || config.capitalCoords.lng
      
      const output = await findSuppliers({
        latitude: lat,
        longitude: lng,
        productType: query,
        countryCode: countryCode,
        apiKey: activeKey
      })
      setResults(output)
      await logSupplierSearch(query, output.suppliers?.length || 0, countryCode)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: "Could not retrieve suppliers at this time."
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-primary">Local Supplier Finder</h2>
          <p className="text-muted-foreground mt-2">AI finding authorized resources nearest to your current location.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className={cn(
              "rounded-xl border-primary transition-all",
              location ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "text-primary"
            )}
            onClick={getUserLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Navigation2 className={cn("h-4 w-4 mr-2", location && "fill-current")} />
            )}
            {location ? "Location Active" : "Detect Location"}
          </Button>
        </div>
      </div>

      {!activeKey && (
        <Alert variant="destructive" className="rounded-3xl bg-destructive/10 border-none p-6 animate-in slide-in-from-top-4 duration-500 max-w-4xl mx-auto">
           <AlertCircle className="h-5 w-5 text-destructive" />
           <AlertTitle className="text-destructive font-bold">Search Offline</AlertTitle>
           <AlertDescription className="text-destructive/80 text-xs">
             The Supplier Finder requires your own Groq API Key. 
             <Link href="/dashboard/settings" className="ml-2 underline font-bold">Go to Settings →</Link>
           </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-2xl mx-auto">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search e.g. 'Urea', 'Rice seeds'..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-16 rounded-[1.5rem] shadow-xl bg-white border-none text-lg focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
        <Button type="submit" className="h-16 px-10 rounded-[1.5rem] bg-primary text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30" disabled={isSearching}>
          {isSearching ? <Loader2 className="h-6 w-6 animate-spin" /> : "Search"}
        </Button>
      </form>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {!results && !isSearching && (
             <div className="h-[450px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm border-2 border-dashed rounded-[3rem] p-12 text-center gap-6 shadow-sm">
                <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center animate-bounce">
                  <MapPin className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-headline font-bold">What do you need today?</h3>
                   <p className="text-muted-foreground max-w-[320px] mx-auto text-sm">Our AI will scout verified suppliers within 50km of your detected location.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {['Fertilizer', 'Rice Seeds', 'Pesticides', 'Tractor Parts'].map(tag => (
                    <button 
                      key={tag} 
                      className="px-6 py-2.5 bg-white border rounded-full text-sm font-bold text-slate-600 hover:border-primary hover:text-primary hover:shadow-md transition-all"
                      onClick={() => {setQuery(tag); setTimeout(() => handleSearch(), 100);}}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
             </div>
          )}

          {isSearching && (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-white rounded-[2rem] border animate-pulse" />
              ))}
            </div>
          )}

          {results && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card className="rounded-[2rem] bg-secondary/10 border-none p-8 space-y-4 shadow-inner">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-foreground flex items-center gap-2">
                   <Sparkles className="h-4 w-4 fill-current" />
                   AI Supply Recommendation
                 </h4>
                 <p className="text-lg text-foreground/80 leading-relaxed font-medium italic">{results.summary}</p>
              </Card>

              <div className="grid gap-6">
                {results.suppliers.map((s, i) => (
                  <Card key={i} className="rounded-[2rem] border-none shadow-xl hover:shadow-2xl transition-all overflow-hidden bg-white group">
                    <CardContent className="p-8 space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                         <div className="space-y-3">
                           <div className="flex items-center gap-2">
                              <h3 className="text-2xl font-headline font-bold text-slate-800">{s.name}</h3>
                              <div className="h-2 w-2 rounded-full bg-emerald-500" />
                           </div>
                           <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                             <MapPin className="h-4 w-4 text-primary" />
                             {s.address}
                           </p>
                           <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100">
                                {s.distanceKm} km from you
                              </Badge>
                              <Badge variant="outline" className="border-primary/20 text-primary">
                                Verified Partner
                              </Badge>
                           </div>
                         </div>
                         <div className="flex gap-3 w-full md:w-auto">
                            <Button size="lg" variant="outline" className="flex-1 md:flex-none rounded-2xl h-14 border-primary text-primary hover:bg-primary hover:text-white font-bold transition-all shadow-md">
                               <Phone className="h-5 w-5 mr-2" /> Call
                            </Button>
                            <Button size="lg" className="flex-1 md:flex-none rounded-2xl h-14 bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform" asChild>
                               <a href={s.mapLink} target="_blank" rel="noopener noreferrer">
                                 <Navigation className="h-5 w-5 mr-2" /> Directions
                               </a>
                            </Button>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
           <Card className="rounded-[3rem] shadow-2xl border-none bg-primary h-[450px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/location-map/800/800')] bg-cover opacity-20 grayscale-0 blur-[2px] group-hover:blur-0 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center p-10 text-center flex-col gap-6 text-white">
                 <div className="h-24 w-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl border border-white/30 animate-pulse">
                   <Navigation className="h-10 w-10" />
                 </div>
                 <h3 className="text-3xl font-headline font-bold">Interactive Radar</h3>
                 <p className="text-primary-foreground/70 text-sm leading-relaxed">
                   AI-powered scanning of regional inventory levels. Your detected location: 
                   <br/><span className="font-mono text-xs mt-2 opacity-100">{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Detecting..."}</span>
                 </p>
                 <Button className="bg-white text-primary hover:bg-white/90 rounded-full font-bold px-10 h-14 shadow-2xl">Open Full Map</Button>
              </div>
           </Card>

           <Card className="rounded-[2.5rem] shadow-xl border-none bg-white p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-accent/50 rounded-2xl flex items-center justify-center">
                  <Info className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-headline font-bold text-xl text-slate-800">Verified Quality</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-loose">
                TUAI only lists suppliers verified by the Ministry of Agriculture. All inputs (Urea, Seeds, Pesticides) are audited for genuine quality to ensure your yield targets are met.
              </p>
           </Card>
        </div>
      </div>
    </div>
  )
}
