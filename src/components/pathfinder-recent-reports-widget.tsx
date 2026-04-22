"use client";

// src/components/pathfinder-recent-reports-widget.tsx
// Small dashboard widget: 3 most recent Pathfinder reports + "View all" link.
// Drop this into your main dashboard page alongside other cards.

import * as React from "react";
import Link from "next/link";
import {
  Compass,
  Leaf,
  Calendar,
  ChevronRight,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getPathfinderReports,
  formatReportDate,
  getReportTitle,
  type PathfinderReport,
} from "@/lib/pathfinder-reports";

export function PathfinderRecentReportsWidget() {
  const [reports, setReports] = React.useState<PathfinderReport[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getPathfinderReports(3)
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden">
      <CardHeader className="p-8 md:p-10 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-headline font-bold text-slate-900">
              Pathfinder Reports
            </CardTitle>
            <CardDescription className="text-lg font-medium text-slate-500 mt-1">
              Your recent AI farm plans
            </CardDescription>
          </div>
          <Link href="/dashboard/setup">
            <Button
              size="sm"
              className="rounded-full bg-primary hover:bg-primary/90 font-bold gap-1.5 shadow-md shadow-primary/20 flex-shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="px-8 md:p-10 pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Compass className="h-7 w-7 text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600">No reports yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Run AI Pathfinder to generate your first farm plan.
              </p>
            </div>
            <Link href="/dashboard/setup">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full font-bold gap-1.5"
              >
                <Compass className="h-3.5 w-3.5" />
                Open Pathfinder
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/setup/reports/${report.id}`}
              >
                <div className="group flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">
                      {getReportTitle(report)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {formatReportDate(report.created_at)}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}

            {/* View all */}
            <Link href="/dashboard/setup/reports">
              <Button
                variant="ghost"
                className="w-full mt-4 h-12 rounded-2xl text-primary font-black hover:bg-primary/5"
              >
                VIEW ALL REPORTS
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PathfinderRecentReportsWidget;
