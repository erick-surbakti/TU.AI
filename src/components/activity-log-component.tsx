"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Sprout,
    TrendingUp,
    Compass,
    Loader2,
    AlertCircle,
    Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/supabase/client"
import { getRecentActivities, subscribeToActivities } from "@/lib/lib-activity-logger"
import Link from "next/link"
import * as React from "react"

interface Activity {
    id: string
    user_id: string
    activity_type: string
    title: string
    result: string | null
    icon_type: string
    metadata: Record<string, any> | null
    createdAt: string
}

const ICON_MAP: Record<string, React.ReactNode> = {
    scan: <Sprout className="h-7 w-7 text-primary" />,
    market: <TrendingUp className="h-7 w-7 text-orange-500" />,
    setup: <Compass className="h-7 w-7 text-blue-500" />,
    weather: <Zap className="h-7 w-7 text-yellow-500" />,
    fertilizer: <Sprout className="h-7 w-7 text-green-600" />,
}

const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface ActivityLogProps {
    limit?: number
    showFullLog?: boolean
}

export function ActivityLog({ limit = 3, showFullLog = false }: ActivityLogProps) {
    const [activities, setActivities] = React.useState<Activity[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        setIsLoading(true)
        setError(null)

        // Try real-time subscription first
        let unsubscribe = () => { }

        const setupSubscription = async () => {
            try {
                unsubscribe = await subscribeToActivities((data) => {
                    setActivities(data)
                    setIsLoading(false)
                }, limit)
            } catch (err) {
                console.error("Failed to setup real-time subscription:", err)

                // Fallback to regular fetch
                try {
                    const data = await getRecentActivities(limit)
                    setActivities(data)
                    setIsLoading(false)
                } catch (fetchErr) {
                    setError("Failed to load activities")
                    setIsLoading(false)
                }
            }
        }

        setupSubscription()

        return () => unsubscribe()
    }, [limit])

    if (isLoading) {
        return (
            <Card className="rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden">
                <CardHeader className="p-8 md:p-10 pb-4">
                    <CardTitle className="text-2xl font-headline font-bold text-slate-900">Recent AI Activities</CardTitle>
                    <CardDescription className="text-lg font-medium text-slate-500">Historical records of your farm actions and AI diagnostics</CardDescription>
                </CardHeader>
                <CardContent className="px-8 md:p-10 pt-0 flex items-center justify-center min-h-[200px]">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground font-medium">Loading activities...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden">
                <CardHeader className="p-8 md:p-10 pb-4">
                    <CardTitle className="text-2xl font-headline font-bold text-slate-900">Recent AI Activities</CardTitle>
                </CardHeader>
                <CardContent className="px-8 md:p-10 pt-0">
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-destructive">{error}</p>
                            <p className="text-xs text-muted-foreground mt-1">Please refresh the page to try again.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden">
            <CardHeader className="p-8 md:p-10 pb-4">
                <CardTitle className="text-2xl font-headline font-bold text-slate-900">Recent AI Activities</CardTitle>
                <CardDescription className="text-lg font-medium text-slate-500">
                    {showFullLog ? "Complete" : "Latest"} records of your farm actions and AI diagnostics
                </CardDescription>
            </CardHeader>
            <CardContent className="px-8 md:p-10 pt-0">
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-center">
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-slate-600">No activities yet</p>
                                <p className="text-xs text-muted-foreground">
                                    Start by running a disease scan or setting up your farm with AI Pathfinder!
                                </p>
                            </div>
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group cursor-pointer shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center gap-5 flex-1">
                                    {/* Activity Icon */}
                                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                                        {ICON_MAP[activity.icon_type] || ICON_MAP.setup}
                                    </div>

                                    {/* Activity Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-lg font-bold text-slate-800 truncate">
                                            {activity.title}
                                        </div>
                                        <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">
                                            {formatTimeAgo(activity.createdAt)}
                                        </div>

                                        {/* Activity Metadata (if available) */}
                                        {activity.metadata && (
                                            <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                                                {activity.metadata.disease && (
                                                    <div>Disease: <span className="font-bold">{activity.metadata.disease}</span></div>
                                                )}
                                                {activity.metadata.confidence && (
                                                    <div>Confidence: <span className="font-bold">{Math.round(activity.metadata.confidence)}%</span></div>
                                                )}
                                                {activity.metadata.item && (
                                                    <div>Item: <span className="font-bold">{activity.metadata.item}</span></div>
                                                )}
                                                {activity.metadata.farm_name && (
                                                    <div>Farm: <span className="font-bold">{activity.metadata.farm_name}</span></div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Activity Result Badge */}
                                {activity.result && (
                                    <div className="hidden sm:block text-xs font-black px-4 py-2 rounded-full bg-white text-slate-600 border shadow-sm uppercase tracking-wider flex-shrink-0 text-right">
                                        {activity.result.length > 30 ? activity.result.substring(0, 27) + "..." : activity.result}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* View Full Log Button (if not already on full log page) */}
                {!showFullLog && activities.length > 0 && (
                    <Link href="/dashboard/activity">
                        <Button variant="ghost" className="w-full mt-10 h-14 rounded-2xl text-primary font-black text-lg hover:bg-primary/5">
                            VIEW FULL ACTIVITY LOG
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    )
}

export default ActivityLog