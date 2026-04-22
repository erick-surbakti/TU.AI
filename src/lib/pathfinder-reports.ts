// src/lib/pathfinder-reports.ts
// Persist, fetch, and manage Pathfinder AI report snapshots

import { createClient } from "@/supabase/client";
import type { FarmSetupInput, FarmSetupOutput } from "@/ai/flows/farm-setup-flow";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface PathfinderReport {
  id: string;
  user_id: string;
  farm_id: string | null;
  country_code: string | null;
  currency: string | null;
  input_snapshot: FarmSetupInput;
  output_snapshot: FarmSetupOutput;
  created_at: string;
}

export interface SaveReportParams {
  farmId?: string;
  countryCode?: string;
  currency?: string;
  input: FarmSetupInput;
  output: FarmSetupOutput;
}

// ─────────────────────────────────────────────
// Helper: wait for a valid authenticated session
// Supabase SSR sometimes needs a tick to hydrate
// ─────────────────────────────────────────────

async function getAuthenticatedClient() {
  const supabase = createClient();

  // First attempt
  let { data: { user } } = await supabase.auth.getUser();

  // If no user yet, wait briefly and retry once (handles SSR hydration lag)
  if (!user) {
    await new Promise((res) => setTimeout(res, 300));
    const retry = await supabase.auth.getUser();
    user = retry.data.user;
  }

  return { supabase, user };
}

// ─────────────────────────────────────────────
// Save a new report (called right after AI generation)
// ─────────────────────────────────────────────

export async function savePathfinderReport(
  params: SaveReportParams
): Promise<PathfinderReport | null> {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      console.warn("savePathfinderReport: no authenticated user");
      return null;
    }

    const { data, error } = await supabase
      .from("pathfinder_reports")
      .insert({
        user_id: user.id,
        farm_id: params.farmId ?? null,
        country_code: params.countryCode ?? null,
        currency: params.currency ?? null,
        input_snapshot: params.input as unknown as Record<string, unknown>,
        output_snapshot: params.output as unknown as Record<string, unknown>,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving pathfinder report:", error);
      return null;
    }

    return data as PathfinderReport;
  } catch (err) {
    console.error("Unexpected error saving pathfinder report:", err);
    return null;
  }
}

// ─────────────────────────────────────────────
// Fetch a single report by ID
// Waits for auth before querying so RLS works correctly
// ─────────────────────────────────────────────

export async function getPathfinderReport(
  id: string
): Promise<PathfinderReport | null> {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      console.warn("getPathfinderReport: no authenticated user for id", id);
      return null;
    }

    const { data, error } = await supabase
      .from("pathfinder_reports")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)   // explicit user_id guard on top of RLS
      .single();

    if (error) {
      console.error("Error fetching pathfinder report:", error.message, error.details);
      return null;
    }

    return data as PathfinderReport;
  } catch (err) {
    console.error("Unexpected error fetching pathfinder report:", err);
    return null;
  }
}

// ─────────────────────────────────────────────
// Fetch all reports for the current user (newest first)
// ─────────────────────────────────────────────

export async function getPathfinderReports(
  limit = 20
): Promise<PathfinderReport[]> {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      console.warn("getPathfinderReports: no authenticated user");
      return [];
    }

    const { data, error } = await supabase
      .from("pathfinder_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching pathfinder reports:", error.message);
      return [];
    }

    return (data ?? []) as PathfinderReport[];
  } catch (err) {
    console.error("Unexpected error fetching pathfinder reports:", err);
    return [];
  }
}

// ─────────────────────────────────────────────
// Delete a report (user_id guard ensures ownership)
// ─────────────────────────────────────────────

export async function deletePathfinderReport(id: string): Promise<boolean> {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!user) return false;

    const { error } = await supabase
      .from("pathfinder_reports")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);   // explicit ownership guard

    if (error) {
      console.error("Error deleting pathfinder report:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Unexpected error deleting pathfinder report:", err);
    return false;
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export function formatReportDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getReportTitle(report: PathfinderReport): string {
  const farmName = report.input_snapshot?.basicInfo?.farmName;
  const crop =
    report.input_snapshot?.targetCrop ??
    report.input_snapshot?.farmType ??
    "Farm";
  return farmName ? `${farmName} — ${crop}` : crop;
}