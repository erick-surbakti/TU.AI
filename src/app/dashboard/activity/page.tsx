"use client"

import * as React from "react"
import { ActivityLog } from "@/components/activity-log-component"

export default function ActivityPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 md:pb-8">
      <div className="space-y-2 px-1">
        <h2 className="text-3xl font-headline font-bold text-primary">AI Activity Log</h2>
        <p className="text-sm text-muted-foreground font-medium">
          Complete timeline of your AI actions and diagnostics.
        </p>
      </div>

      <ActivityLog limit={100} showFullLog />
    </div>
  )
}
