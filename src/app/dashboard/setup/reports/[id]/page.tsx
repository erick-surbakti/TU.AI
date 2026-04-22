"use client";

// src/app/dashboard/setup/reports/[id]/page.tsx

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Download, Loader2, AlertCircle, Leaf, MapPin,
  TrendingUp, ShieldCheck, Droplets, CheckCircle2, ListChecks,
  Lightbulb, DollarSign, Home, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPathfinderReport, formatReportDate, getReportTitle,
  type PathfinderReport,
} from "@/lib/pathfinder-reports";
import { exportElementAsPdf } from "@/lib/pdf-export";
import {
  getPendingPathfinderReport,
  isPendingReportId,
  type PendingPathfinderReport,
} from "@/lib/pathfinder-pending-reports";

// ── colour maps ─────────────────────────────────────────────────────────────
const RISK_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  Low:      { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Medium:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"   },
  High:     { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200"    },
  Critical: { bg: "bg-rose-100",   text: "text-rose-900",    border: "border-rose-400"    },
};
const PROFIT_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  "Very High": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  High:        { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"    },
  Medium:      { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"   },
  Low:         { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200"    },
};

// ── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ value, label, color = "#16a34a" }: { value: number; label: string; color?: string }) {
  const r = 36, circ = 2 * Math.PI * r;
  const progress = Math.min(100, Math.max(0, value));
  const dash = (progress / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 88 88" fill="none">
          <circle cx="44" cy="44" r={r} stroke="#e2e8f0" strokeWidth="8" />
          <circle cx="44" cy="44" r={r} stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-slate-800">{progress}</span>
        </div>
      </div>
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function PathfinderReportDetailPage() {
  const params = useParams();
  const reportId = params?.id as string;

  const [report, setReport] = React.useState<(PathfinderReport | PendingPathfinderReport) | null>(null);
  const [isPendingReport, setIsPendingReport] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pdfState, setPdfState] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const reportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!reportId) {
      setError("Invalid report ID.");
      setLoading(false);
      return;
    }

    if (isPendingReportId(reportId)) {
      const pending = getPendingPathfinderReport(reportId);
      if (pending) {
        setReport(pending);
        setIsPendingReport(true);
        setLoading(false);
        return;
      }

      setError("Pending report not found.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      // Retry up to 4 times with backoff — handles auth hydration delay on page load
      for (let attempt = 0; attempt < 4; attempt++) {
        if (attempt > 0) {
          await new Promise((res) => setTimeout(res, attempt * 400));
        }
        const r = await getPathfinderReport(reportId);
        if (cancelled) return;
        if (r) {
          setReport(r);
          setIsPendingReport(false);
          setLoading(false);
          return;
        }
      }
      if (!cancelled) {
        setError("Report not found or access denied.");
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [reportId]);

  async function handleDownloadPdf() {
    if (!reportRef.current || !report) return;
    await exportElementAsPdf({
      element: reportRef.current,
      filename: `pathfinder-${report.input_snapshot?.basicInfo?.farmName?.replace(/\s+/g, "-").toLowerCase() ?? "report"}`,
      scale: 2,
      onStart: () => setPdfState("loading"),
      onSuccess: () => { setPdfState("success"); setTimeout(() => setPdfState("idle"), 3000); },
      onError: () => { setPdfState("error"); setTimeout(() => setPdfState("idle"), 4000); },
    });
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-slate-500 font-medium">Loading report…</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 px-6">
        <div className="flex items-start gap-3 p-6 rounded-2xl bg-rose-50 border border-rose-200 max-w-md">
          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-700">{error}</p>
            <p className="text-sm text-rose-500 mt-1">
              The report may have been deleted or your session is not yet ready. Try refreshing.
            </p>
          </div>
        </div>
        <Link href="/dashboard/setup/reports">
          <Button variant="ghost" className="gap-2 font-bold">
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Button>
        </Link>
      </div>
    );
  }

  const { input_snapshot: input, output_snapshot: output } = report;
  const health = output.healthReport;
  const title = isPendingReport
    ? getReportTitle({
        ...report,
        user_id: "local",
        farm_id: null,
        currency: null,
      } as PathfinderReport)
    : getReportTitle(report as PathfinderReport);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ── Sticky action bar ── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 md:px-10 lg:px-16 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link href="/dashboard/setup/reports">
            <Button variant="ghost" size="sm" className="gap-2 font-bold text-slate-600 hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">All Reports</span>
            </Button>
          </Link>

          <Button
            onClick={handleDownloadPdf}
            disabled={pdfState === "loading"}
            className={`rounded-full px-6 h-10 font-bold gap-2 text-sm shadow-sm transition-all ${
              pdfState === "success" ? "bg-emerald-500 hover:bg-emerald-500"
              : pdfState === "error" ? "bg-rose-500 hover:bg-rose-500"
              : "bg-primary hover:bg-primary/90 shadow-primary/20"
            }`}
          >
            {pdfState === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
            : pdfState === "success" ? <><CheckCircle2 className="h-4 w-4" /> Downloaded!</>
            : pdfState === "error"   ? <><AlertCircle className="h-4 w-4" /> Try Again</>
            : <><Download className="h-4 w-4" /> Download PDF</>}
          </Button>
        </div>
      </div>

      {/* ── Report body (snapshotted for PDF) ── */}
      <div ref={reportRef} className="max-w-5xl mx-auto px-4 md:px-10 py-12 space-y-10 bg-white">

        {/* Header */}
        <div className="flex flex-col gap-6 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight leading-tight">{title}</h1>
              <p className="text-slate-400 font-medium mt-1 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {input.basicInfo?.region}, {input.basicInfo?.country} · {formatReportDate(report.created_at)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
              {input.status === "beginner" ? "New Farm" : "Existing Farm"}
            </span>
            {isPendingReport && (
              <span className="px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-black uppercase tracking-widest border border-amber-200">
                Pending Save
              </span>
            )}
            {input.budget && (
              <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest">
                Budget: {input.budget}
              </span>
            )}
            {(input.targetCrop || input.farmType) && (
              <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest">
                {input.targetCrop ?? input.farmType}
              </span>
            )}
          </div>
        </div>

        {/* Health Report */}
        {health && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-slate-800">Farm Health Report</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <ScoreRing value={health.productivityScore} label="Productivity" color="#16a34a" />
              <ScoreRing value={health.costEfficiency} label="Cost Efficiency" color="#2563eb" />
              <div className="flex flex-col items-center gap-2">
                <div className={`h-24 w-24 rounded-full flex items-center justify-center border-4 ${RISK_CONFIG[health.diseaseRisk]?.border ?? "border-slate-200"} ${RISK_CONFIG[health.diseaseRisk]?.bg ?? "bg-slate-50"}`}>
                  <div className={`text-sm font-black ${RISK_CONFIG[health.diseaseRisk]?.text ?? ""}`}>{health.diseaseRisk}</div>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Disease Risk</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`h-24 w-24 rounded-full flex items-center justify-center border-4 ${PROFIT_CONFIG[health.profitPotential]?.border ?? "border-slate-200"} ${PROFIT_CONFIG[health.profitPotential]?.bg ?? "bg-slate-50"}`}>
                  <div className={`text-sm font-black ${PROFIT_CONFIG[health.profitPotential]?.text ?? ""}`}>{health.profitPotential}</div>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Profit Potential</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-slate-500 font-medium">Water Risk:</span>
              <span className={`text-sm font-bold ${RISK_CONFIG[health.waterRisk]?.text ?? ""}`}>{health.waterRisk}</span>
            </div>
          </section>
        )}

        {/* Motivation */}
        {output.motivationAI && (
          <section className="rounded-[2rem] bg-gradient-to-br from-primary/5 to-emerald-50 border border-primary/10 p-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-slate-800">Your AI Message</h2>
            </div>
            <p className="text-slate-700 leading-relaxed font-medium italic">"{output.motivationAI}"</p>
          </section>
        )}

        {/* Recommendations */}
        {output.recommendations && output.recommendations.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-bold text-slate-800">AI Recommendations</h2>
            </div>
            <div className="space-y-3">
              {output.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <div className="h-7 w-7 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 font-black text-amber-800 text-xs">{i + 1}</div>
                  <p className="text-slate-700 font-medium leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Roadmap */}
        {output.roadmap && output.roadmap.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <ListChecks className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-800">Action Roadmap</h2>
            </div>
            <div className="relative">
              <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-blue-100 hidden md:block" />
              <div className="space-y-4">
                {output.roadmap.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="relative z-10 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white font-black text-sm shadow-md shadow-blue-500/25">{i + 1}</div>
                    <div className="flex-1 p-5 rounded-2xl bg-blue-50/50 border border-blue-100 mt-1">
                      <p className="text-slate-700 font-medium leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Land Options */}
        {output.landOptions && output.landOptions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Home className="h-5 w-5 text-purple-500" />
              <h2 className="text-xl font-bold text-slate-800">Suggested Land Options</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {output.landOptions.map((land, i) => (
                <div key={i} className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    <span className="font-bold text-slate-800">{land.location}</span>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p><span className="font-semibold">Size:</span> {land.size}</p>
                    <p><span className="font-semibold">Est. Price:</span> {land.priceEstimate}</p>
                    <p className="text-slate-500 mt-2 leading-relaxed">{land.suitabilityReason}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Financial Estimate */}
        {output.financialEstimate && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <h2 className="text-xl font-bold text-slate-800">Financial Estimate</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Initial Capital",    value: output.financialEstimate.initialCapital,    icon: DollarSign,   color: "bg-emerald-50 border-emerald-100", textColor: "text-emerald-700" },
                { label: "Operating Expense",  value: output.financialEstimate.operatingExpense,  icon: TrendingUp,   color: "bg-blue-50 border-blue-100",       textColor: "text-blue-700"    },
                { label: "Expected ROI",       value: output.financialEstimate.expectedRoiTime,   icon: CheckCircle2, color: "bg-amber-50 border-amber-100",     textColor: "text-amber-700"   },
              ].map(({ label, value, icon: Icon, color, textColor }) => (
                <div key={label} className={`p-6 rounded-2xl border ${color}`}>
                  <Icon className={`h-5 w-5 ${textColor} mb-3`} />
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{label}</div>
                  <div className={`text-lg font-bold ${textColor}`}>{value}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer watermark */}
        <div className="flex items-center justify-center pt-6 pb-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-300">
            <Leaf className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              TUAI · Pathfinder Report · {formatReportDate(report.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}