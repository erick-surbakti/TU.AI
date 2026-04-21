// lib/activity-logger-polling.ts
// Ultra-safe polling-only version - no realtime subscriptions
// Use this if you keep getting realtime errors

import { createClient } from "@/supabase/client"

export type ActivityType =
    | "disease_scan"
    | "pathfinder"
    | "price_check"
    | "weather_check"
    | "fertilizer_recommendation"
    | "farm_setup"
    | "market_alert"

export type IconType = "scan" | "setup" | "market" | "weather" | "fertilizer"

interface LogActivityParams {
    activity_type: ActivityType
    title: string
    result?: string
    icon_type: IconType
    metadata?: Record<string, any>
}

/**
 * Log an activity to the database
 * Call this after any significant user action
 */
export async function logActivity({
    activity_type,
    title,
    result,
    icon_type,
    metadata = {}
}: LogActivityParams) {
    try {
        const supabase = createClient()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.warn("No authenticated user found")
            return null
        }

        // Insert activity log
        const { data, error } = await supabase
            .from("activity_logs")
            .insert({
                user_id: user.id,
                activity_type,
                title,
                result: result || null,
                icon_type,
                metadata: Object.keys(metadata).length > 0 ? metadata : null
            })
            .select()
            .single()

        if (error) {
            console.error("Error logging activity:", error)
            return null
        }

        console.log("Activity logged:", data)
        return data
    } catch (err) {
        console.error("Unexpected error logging activity:", err)
        return null
    }
}

/**
 * Log a disease scan activity
 */
export async function logDiseaseScan(
    disease: string,
    confidence: number,
    recommendation: string,
    scanId: string
) {
    return logActivity({
        activity_type: "disease_scan",
        title: `Disease Scan: ${disease}`,
        result: `Detection: ${disease} (${Math.round(confidence)}% confidence)`,
        icon_type: "scan",
        metadata: {
            disease,
            confidence,
            recommendation,
            scan_id: scanId
        }
    })
}

/**
 * Log a pathfinder/farm setup activity
 */
export async function logPathfinder(
    farmName: string,
    cropType: string,
    strategy: string
) {
    return logActivity({
        activity_type: "pathfinder",
        title: `AI Pathfinder: ${farmName} Strategy Generated`,
        result: "Strategy Active",
        icon_type: "setup",
        metadata: {
            farm_name: farmName,
            crop_type: cropType,
            strategy
        }
    })
}

/**
 * Log a price check activity
 */
export async function logPriceCheck(
    item: string,
    price: number,
    currency: string
) {
    return logActivity({
        activity_type: "price_check",
        title: `Price Check: ${item}`,
        result: `${currency} ${price.toFixed(2)}`,
        icon_type: "market",
        metadata: {
            item,
            price,
            currency
        }
    })
}

/**
 * Log a weather check activity
 */
export async function logWeatherCheck(
    region: string,
    temperature: number,
    humidity: number
) {
    return logActivity({
        activity_type: "weather_check",
        title: `Weather Check: ${region}`,
        result: `${temperature}°C, ${humidity}% humidity`,
        icon_type: "weather",
        metadata: {
            region,
            temperature,
            humidity
        }
    })
}

/**
 * Log a fertilizer recommendation activity
 */
export async function logFertilizerRecommendation(
    cropType: string,
    recommendation: string,
    dosage: string
) {
    return logActivity({
        activity_type: "fertilizer_recommendation",
        title: `Fertilizer: ${cropType} Analysis`,
        result: `${dosage} recommended`,
        icon_type: "fertilizer",
        metadata: {
            crop_type: cropType,
            recommendation,
            dosage
        }
    })
}

/**
 * Fetch recent activities for the current user
 */
export async function getRecentActivities(limit: number = 10) {
    try {
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from("activity_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("createdAt", { ascending: false })
            .limit(limit)

        if (error) {
            console.error("Error fetching activities:", error)
            return []
        }

        return data || []
    } catch (err) {
        console.error("Unexpected error fetching activities:", err)
        return []
    }
}

/**
 * Subscribe to activities using polling (safe, no realtime issues)
 * Polls every 5 seconds for new activities
 */
export async function subscribeToActivities(
    callback: (activities: any[]) => void,
    limit: number = 10
) {
    try {
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.warn("No user found")
            return () => { }
        }

        // Fetch initial data
        const initialData = await getRecentActivities(limit)
        callback(initialData)

        console.log("📋 Activity polling started (5s interval)")

        let lastId = initialData[0]?.id || null

        // Poll every 5 seconds for new activities
        const pollInterval = setInterval(async () => {
            try {
                const fresh = await getRecentActivities(limit)

                // Only trigger callback if there's new data
                if (fresh.length > 0 && fresh[0].id !== lastId) {
                    lastId = fresh[0].id
                    callback(fresh)
                }
            } catch (err) {
                console.error("Polling error:", err)
            }
        }, 5000)

        // Return cleanup function
        return () => {
            clearInterval(pollInterval)
            console.log("📋 Activity polling stopped")
        }
    } catch (err) {
        console.error("Error setting up activity subscription:", err)
        return () => { }
    }
}