
"use client";

// src/components/saved-report-cta.tsx
// Drop this below the inline Pathfinder preview on /dashboard/setup.
// It appears once savedReportId is set after generation.

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavedReportCtaProps {
  reportId: string;
}

export function SavedReportCta({ reportId }: SavedReportCtaProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-6 rounded-[2rem] bg-primary/5 border border-primary/15">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <p className="font-bold text-slate-800">Report saved successfully!</p>
        </div>
        <p className="text-sm text-slate-500">
          Your Pathfinder plan is stored permanently — revisit, compare, or download it as PDF any time.
        </p>
      </div>
      <div className="flex gap-3 flex-shrink-0">
        <Link href="/dashboard/setup/reports">
          <Button variant="outline" className="rounded-full font-bold gap-2 border-slate-200 hover:border-primary/30">
            <BookOpen className="h-4 w-4" />
            All Reports
          </Button>
        </Link>
        <Link href={`/dashboard/setup/reports/${reportId}`}>
          <Button className="rounded-full font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 gap-2">
            <ExternalLink className="h-4 w-4" />
            View Full Report & PDF
          </Button>
        </Link>
      </div>
    </div>
  );
}