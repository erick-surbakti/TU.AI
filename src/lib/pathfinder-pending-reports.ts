import type { FarmSetupInput, FarmSetupOutput } from "@/ai/flows/farm-setup-flow"

const PENDING_REPORTS_KEY = "tuai:pathfinder:pending-reports:v1"

export interface PendingPathfinderReport {
  id: string
  created_at: string
  country_code: string | null
  input_snapshot: FarmSetupInput
  output_snapshot: FarmSetupOutput
}

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

function makePendingId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `pending_${crypto.randomUUID()}`
  }

  const fallback = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  return `pending_${fallback}`
}

function readPendingReports(): PendingPathfinderReport[] {
  if (!isBrowser()) return []

  try {
    const raw = window.localStorage.getItem(PENDING_REPORTS_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writePendingReports(items: PendingPathfinderReport[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(items))
}

export function isPendingReportId(id: string): boolean {
  return id.startsWith("pending_")
}

export function createPendingPathfinderReport(params: {
  countryCode?: string
  input: FarmSetupInput
  output: FarmSetupOutput
}): PendingPathfinderReport {
  const next: PendingPathfinderReport = {
    id: makePendingId(),
    created_at: new Date().toISOString(),
    country_code: params.countryCode ?? null,
    input_snapshot: params.input,
    output_snapshot: params.output,
  }

  const current = readPendingReports()
  writePendingReports([next, ...current])
  return next
}

export function getPendingPathfinderReports(limit?: number): PendingPathfinderReport[] {
  const items = readPendingReports().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  if (typeof limit === "number") {
    return items.slice(0, limit)
  }

  return items
}

export function getPendingPathfinderReport(id: string): PendingPathfinderReport | null {
  const found = readPendingReports().find((item) => item.id === id)
  return found ?? null
}

export function deletePendingPathfinderReport(id: string): boolean {
  const current = readPendingReports()
  const next = current.filter((item) => item.id !== id)
  if (next.length === current.length) return false
  writePendingReports(next)
  return true
}
