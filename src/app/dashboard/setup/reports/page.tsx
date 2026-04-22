"use client";

// src/app/dashboard/setup/reports/page.tsx

import * as React from "react";
import Link from "next/link";
import { Compass, Plus, Loader2, FileSearch, AlertCircle, Calendar, Leaf, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PathfinderReportCard } from "@/components/pathfinder-report-card";
import { formatReportDate, getPathfinderReports, getReportTitle, type PathfinderReport } from "@/lib/pathfinder-reports";
import {
  deletePendingPathfinderReport,
  getPendingPathfinderReports,
  type PendingPathfinderReport,
} from "@/lib/pathfinder-pending-reports";

export default function PathfinderReportsPage() {
  const [reports, setReports] = React.useState<PathfinderReport[]>([]);
  const [pendingReports, setPendingReports] = React.useState<PendingPathfinderReport[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getPathfinderReports(50)
      .then(setReports)
      .catch(() => setError("Failed to load reports."))
      .finally(() => {
        setPendingReports(getPendingPathfinderReports(50));
        setLoading(false);
      });
  }, []);

  function handleDeleted(id: string) {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  function handleDeletePending(id: string) {
    if (!confirm("Delete this pending report? This cannot be undone.")) return;
    const ok = deletePendingPathfinderReport(id);
    if (ok) {
      setPendingReports((prev) => prev.filter((p) => p.id !== id));
    }
  }

  const mergedReports = React.useMemo(() => {
    const synced = reports.map((report) => ({
      kind: "synced" as const,
      id: report.id,
      created_at: report.created_at,
      report,
    }));

    const pending = pendingReports.map((report) => ({
      kind: "pending" as const,
      id: report.id,
      created_at: report.created_at,
      report,
    }));

    return [...synced, ...pending].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [reports, pendingReports]);

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-10 md:px-10 lg:px-16">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Compass className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">
                Pathfinder Reports
              </h1>
              <p className="text-slate-500 font-medium mt-0.5">
                Your saved AI farm plans and strategies
              </p>
            </div>
          </div>

          <Link href="/dashboard/setup">
            <Button className="rounded-full px-7 h-12 font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 gap-2">
              <Plus className="h-4 w-4" />
              New Report
            </Button>
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-slate-500 font-medium">Loading reports…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-start gap-3 p-6 rounded-2xl bg-rose-50 border border-rose-200 max-w-lg mx-auto mt-10">
            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-700">{error}</p>
              <p className="text-sm text-rose-500 mt-1">Please refresh the page to try again.</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && mergedReports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
            <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center">
              <FileSearch className="h-10 w-10 text-slate-300" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-700">No reports yet</p>
              <p className="text-slate-400 mt-2 max-w-sm">
                Generate your first AI Pathfinder plan to see it saved here automatically.
              </p>
            </div>
            <Link href="/dashboard/setup">
              <Button className="rounded-full px-8 h-12 font-bold bg-primary hover:bg-primary/90 mt-2">
                Create Your First Report
              </Button>
            </Link>
          </div>
        )}

        {/* List */}
        {!loading && !error && mergedReports.length > 0 && (
          <>
            <p className="text-sm text-slate-400 font-medium mb-6">
              {mergedReports.length} report{mergedReports.length !== 1 ? "s" : ""} available
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mergedReports.map((item) => {
                if (item.kind === "synced") {
                  return (
                    <PathfinderReportCard
                      key={item.id}
                      report={item.report}
                      onDeleted={handleDeleted}
                    />
                  );
                }

                const title = getReportTitle({
                  ...item.report,
                  user_id: "local",
                  farm_id: null,
                  currency: null,
                } as PathfinderReport);

                return (
                  <Link
                    key={item.id}
                    href={`/dashboard/setup/reports/${item.id}`}
                    className="group relative flex flex-col gap-5 p-7 rounded-[2rem] bg-amber-50/40 border border-amber-200 hover:border-amber-300 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Leaf className="h-5 w-5 text-amber-700" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatReportDate(item.report.created_at)}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex-shrink-0">
                        Pending Save
                      </span>
                    </div>

                    <p className="text-xs text-amber-800 font-medium">
                      Saved locally while cloud sync is unavailable.
                    </p>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeletePending(item.id);
                      }}
                      className="absolute top-5 right-5 h-8 w-8 rounded-full flex items-center justify-center text-amber-600 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Delete pending report"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}