"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Thermometer,
    CloudRain,
    Globe,
    Loader2,
    AlertCircle,
    Zap
} from "lucide-react"
import { useEasyMode } from "@/components/easy-mode-provider"
import { createClient } from "@/supabase/client"
import { ASEAN_COUNTRIES } from "@/lib/localization"
import * as React from "react"
import { cn } from "@/lib/utils"

// Country-specific weather profiles based on ASEAN climate data
const COUNTRY_WEATHER_PROFILES = {
    MY: { // Malaysia
        temp: 32,
        humidity: 75,
        condition: "Hot & Humid",
        insight: "Monitor moisture levels. Potential dry spell starting Tuesday.",
        seasonal: "Year-round tropical. Rainy season Oct-Dec (west coast)."
    },
    ID: { // Indonesia
        temp: 31,
        humidity: 78,
        condition: "Warm & Wet",
        insight: "High rainfall expected. Optimal conditions for padi. Check drainage.",
        seasonal: "Monsoon Oct-Apr. Typically 25-35°C year-round."
    },
    TH: { // Thailand
        temp: 30,
        humidity: 72,
        condition: "Tropical Hot",
        insight: "Heat stress warning. Increase irrigation frequency.",
        seasonal: "Rainy Jun-Oct. Cool season Nov-Feb (20-25°C)."
    },
    VN: { // Vietnam
        temp: 28,
        humidity: 70,
        condition: "Warm & Seasonal",
        insight: "Monsoon patterns shifting. Monitor wind direction.",
        seasonal: "Wet Jul-Aug (north), Aug-Nov (center). 22-28°C typical."
    },
    PH: { // Philippines
        temp: 29,
        humidity: 76,
        condition: "Tropical Humid",
        insight: "Typhoon season Jun-Nov. Secure equipment before storms.",
        seasonal: "Year-round 25-35°C. Dry Jan-Mar recommended planting."
    },
    SG: { // Singapore
        temp: 31,
        humidity: 79,
        condition: "Very Humid",
        insight: "High humidity supports padi growth. Drainage critical.",
        seasonal: "Equatorial climate, rain year-round. 26.7°C average."
    },
    BN: { // Brunei
        temp: 30,
        humidity: 77,
        condition: "Warm & Wet",
        insight: "High rainfall. Focus on fungal disease prevention.",
        seasonal: "Tropical. October-March heaviest rainfall period."
    },
    KH: { // Cambodia
        temp: 30,
        humidity: 74,
        condition: "Hot & Monsoon",
        insight: "Mekong flooding patterns affecting irrigation.",
        seasonal: "Rainy May-Oct. Hot Apr-May (24-28°C range)."
    },
    LA: { // Laos
        temp: 28,
        humidity: 71,
        condition: "Seasonal Tropical",
        insight: "Cooler mountain regions. Monitor altitude variations.",
        seasonal: "Monsoon May-Nov. Cool Nov-Jan (15-25°C)."
    },
    MM: { // Myanmar
        temp: 29,
        humidity: 73,
        condition: "Warm & Dry",
        insight: "Southwest monsoon May-Oct. Northeast wind Nov-Mar.",
        seasonal: "Three seasons: hot (Mar-May), rainy (Jun-Oct), cool (Nov-Feb)."
    }
}

interface LocalRadarProps {
    countryCode?: string
    apiKey?: string
    showInsightOnly?: boolean
}

export function LocalRadar({
    countryCode = "MY",
    apiKey = "",
    showInsightOnly = false
}: LocalRadarProps) {
    const { isEasyMode } = useEasyMode()
    const [weather, setWeather] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [hasApiKey, setHasApiKey] = React.useState(!!apiKey)
    const [isMockData, setIsMockData] = React.useState(true)

    // Fetch real weather estimate from Groq if API key is available
    React.useEffect(() => {
        const fetchWeather = async () => {
            if (!apiKey?.trim() || !countryCode) {
                // Use mock data
                const profile = COUNTRY_WEATHER_PROFILES[countryCode as keyof typeof COUNTRY_WEATHER_PROFILES]
                setWeather(profile || COUNTRY_WEATHER_PROFILES.MY)
                setIsMockData(true)
                return
            }

            setIsLoading(true)
            setHasApiKey(true)

            try {
                const countryName = ASEAN_COUNTRIES[countryCode]?.name || countryCode
                const prompt = `
You are a farming weather AI assistant. Based on current date (${new Date().toLocaleDateString()}), provide weather estimate for ${countryName}.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "temp": number (celsius),
  "humidity": number (0-100),
  "condition": "short description",
  "insight": "one sentence farming tip",
  "seasonal": "one sentence seasonal note"
}

Make realistic estimates for ${countryName} based on typical ASEAN climate patterns.`

                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey.trim()}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "mixtral-8x7b-32768",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.7,
                        max_tokens: 200
                    })
                })

                if (response.ok) {
                    const data = await response.json()
                    const content = data.choices?.[0]?.message?.content

                    if (content) {
                        // Clean up potential markdown formatting
                        const cleanJson = content.replace(/```json\n?|```\n?/g, '').trim()
                        const parsed = JSON.parse(cleanJson)
                        setWeather(parsed)
                        setIsMockData(false)
                    } else {
                        throw new Error("No content received")
                    }
                } else {
                    // Fallback to mock data if API fails
                    const profile = COUNTRY_WEATHER_PROFILES[countryCode as keyof typeof COUNTRY_WEATHER_PROFILES]
                    setWeather(profile || COUNTRY_WEATHER_PROFILES.MY)
                    setIsMockData(true)
                }
            } catch (error) {
                // Fallback to mock data on any error
                console.log("Weather fetch failed, using mock data:", error)
                const profile = COUNTRY_WEATHER_PROFILES[countryCode as keyof typeof COUNTRY_WEATHER_PROFILES]
                setWeather(profile || COUNTRY_WEATHER_PROFILES.MY)
                setIsMockData(true)
            } finally {
                setIsLoading(false)
            }
        }

        fetchWeather()
    }, [apiKey, countryCode])

    if (!weather && isLoading) {
        return (
            <Card className="rounded-[3rem] border-none shadow-xl bg-white overflow-hidden flex flex-col">
                <CardHeader className="bg-accent/30 pb-4">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Local Radar
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 space-y-8 flex-1 flex flex-col justify-center items-center min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground font-medium">Estimating local weather...</p>
                </CardContent>
            </Card>
        )
    }

    if (!weather) return null

    return (
        <Card className="rounded-[3rem] border-none shadow-xl bg-white overflow-hidden flex flex-col relative overflow-hidden group">
            {/* Animated background gradient based on condition */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                style={{
                    background: weather.humidity > 75 ? 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%)' : 'radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%)'
                }}
            />

            <CardHeader className="bg-accent/30 pb-4 relative z-10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Local Radar
                    </CardTitle>
                    {isMockData && hasApiKey && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Estimated</span>
                        </div>
                    )}
                    {!isMockData && hasApiKey && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                            <Zap className="h-3 w-3 text-emerald-600" />
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Live AI</span>
                        </div>
                    )}
                    {!hasApiKey && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Estimated</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-8 space-y-6 flex-1 flex flex-col justify-center relative z-10">
                {/* Main metrics */}
                <div className={cn(
                    "grid gap-6",
                    showInsightOnly ? "grid-cols-1" : "grid-cols-2"
                )}>
                    {!showInsightOnly && (
                        <>
                            {/* Temperature */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-inner border border-orange-100">
                                        <Thermometer className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-slate-800 tracking-tighter">
                                            {Math.round(weather.temp)}°C
                                        </div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Temperature</div>
                                    </div>
                                </div>
                            </div>

                            {/* Humidity */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-inner border border-blue-100">
                                        <CloudRain className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-slate-800 tracking-tighter">
                                            {Math.round(weather.humidity)}%
                                        </div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Humidity</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Condition badge */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 border border-slate-200 w-fit">
                    <div className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        weather.humidity > 75 ? "bg-blue-500" : "bg-orange-500"
                    )} />
                    <span className="text-xs font-bold text-slate-700">{weather.condition}</span>
                </div>

                {/* AI Insight - always shown */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-600 leading-relaxed shadow-sm hover:shadow-md transition-all hover:border-primary/30">
                    <div className="flex gap-2">
                        <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                            <strong>AI Insight:</strong> {weather.insight}
                        </span>
                    </div>
                </div>

                {/* Seasonal note - compact */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 text-xs text-slate-600 italic leading-relaxed">
                    <span className="font-bold text-primary">Season:</span> {weather.seasonal}
                </div>

                {/* Data source indicator */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {isMockData && hasApiKey && "Live estimation pending"}
                        {isMockData && !hasApiKey && `${ASEAN_COUNTRIES[countryCode]?.name || countryCode} baseline`}
                        {!isMockData && "AI-estimated weather"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}

export default LocalRadar