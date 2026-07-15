"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import WeeklySchedule from "@/components/shifts/WeeklySchedule";
import ShiftCalendar from "@/components/shifts/ShiftCalendar";
import { getWeeklySchedule } from "@/services/shift.service";
import { EmployeeShift } from "@/types/shift";

export default function ShiftSchedulePage() {
  const [assignments, setAssignments] = React.useState<EmployeeShift[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = React.useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getWeeklySchedule();
      setAssignments(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load shift rosters.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/shifts">
            <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">Shift Schedules & Rosters</h2>
              <Button
                variant="ghost"
                size="icon"
                disabled={loading || refreshing}
                onClick={() => {
                  loadData(true);
                  toast.success("Shift rosters refreshed.");
                }}
                className="h-8 w-8 hover:bg-slate-100 text-slate-500 rounded-lg mt-1"
                title="Refresh Data"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Roster planner displaying weekly shift distributions.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-8">
          <WeeklySchedule assignments={assignments} />
          <ShiftCalendar assignments={assignments} />
        </div>
      )}
    </div>
  );
}
