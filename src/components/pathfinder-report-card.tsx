"use client";

// src/components/pathfinder-report-card.tsx
// Card shown in the report history list.
// FIX: delete button is separated from the navigation link so both work correctly.

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Leaf,
  TrendingUp,
  Calendar,
  ChevronRight,
  Trash2,
  Loader2,
} from "lucide-react";
import type { PathfinderReport } from "@/lib/pathfinder-reports";
import {
  formatReportDate,
  getReportTitle,
  deletePathfinderReport,
} from "@/lib/pathfinder-reports";

interface PathfinderReportCardProps {
  report: PathfinderReport;
  onDeleted?: (id: string) => void;
}

const RISK_TEXT: Record<string, string> = {
  Low: "text-emerald-600",
  Medium: "text-amber-600",
  High: "text-rose-600",
  Critical: "text-rose-800",
};

const PROFIT_TEXT: Record<string, string> = {
  "Very High": "text-emerald-600",
  High: "text-blue-600",
  Medium: "text-amber-600",
  Low: "text-rose-600",
};

export function PathfinderReportCard({
  report,
  onDeleted,
}: PathfinderReportCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState(false);

  const title = getReportTitle(report);
  const output = report.output_snapshot;
  const input = report.input_snapshot;
  const health = output.healthReport;

  // Navigate on card click (not wrapped in <Link> to avoid nesting with button)
  function handleCardClick() {
    router.push(`/dashboard/setup/reports/${report.id}`);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation(); // prevent card click
    if (!confirm("Delete this report? This cannot be undone.")) return;
    setDeleting(true);
    const ok = await deletePathfinderReport(report.id);
    if (ok) {
      onDeleted?.(report.id);
    } else {
      setDeleting(false);
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col gap-5 p-7 rounded-[2rem] bg-white border border-slate-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer select-none"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
              {title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatReportDate(report.created_at)}
            </p>
          </div>
        </div>

        {/* Status badge */}
        {input.status && (
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 flex-shrink-0">
            {input.status === "beginner" ? "New Farm" : "Existing"}
          </span>
        )}
      </div>

      {/* ── Region ── */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <MapPin className="h-3.5 w-3.5" />
        <span>
          {input.basicInfo?.region}, {input.basicInfo?.country}
        </span>
      </div>

      {/* ── Health metrics (existing farms only) ── */}
      {health && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-lg font-black text-primary">
              {health.productivityScore}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
              Productivity
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className={`text-xs font-black ${RISK_TEXT[health.diseaseRisk] ?? "text-slate-600"}`}>
              {health.diseaseRisk}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
              Disease Risk
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className={`text-xs font-black ${PROFIT_TEXT[health.profitPotential] ?? "text-slate-600"}`}>
              {health.profitPotential}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
              Profit
            </div>
          </div>
        </div>
      )}

      {/* ── Financial hint (beginners) ── */}
      {!health && output.financialEstimate && (
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-600 font-medium">
            ROI: {output.financialEstimate.expectedRoiTime}
          </span>
        </div>
      )}

      {/* ── Footer row ── */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-slate-400 font-medium">
          {output.recommendations?.length ?? 0} recommendations ·{" "}
          {output.roadmap?.length ?? 0} steps
        </span>

        <div className="flex items-center gap-2">
          {/* Delete button — stopPropagation prevents card navigation */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
            title="Delete report"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>

          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
}