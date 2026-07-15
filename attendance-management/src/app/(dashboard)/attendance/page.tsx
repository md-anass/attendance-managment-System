"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Calendar, History, LogIn, RefreshCw } from "lucide-react";
import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import AttendanceFilters from "@/components/attendance/AttendanceFilters";
import { getDailyAttendance, getDailyAttendanceSummary } from "@/services/attendance.service";
import { getDepartments } from "@/services/employee.service";
import { Attendance, AttendanceSummary as SummaryType, AttendanceFilters as FilterType } from "@/types/attendance";
import { Department } from "@/types/employee";

export default function DailyAttendancePage() {
  const [records, setRecords] = React.useState<Attendance[]>([]);
  const [filteredRecords, setFilteredRecords] = React.useState<Attendance[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [summary, setSummary] = React.useState<SummaryType | null>(null);
  const [filters, setFilters] = React.useState<FilterType>({});
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const todayStr = React.useMemo(() => new Date().toISOString().split("T")[0], []);

  const loadData = React.useCallback(async (showRefreshingIndicator = false) => {
    if (showRefreshingIndicator) setRefreshing(true);
    else setLoading(true);
    
    try {
      const [logs, stats, deptList] = await Promise.all([
        getDailyAttendance(todayStr),
        getDailyAttendanceSummary(todayStr),
        getDepartments(),
      ]);
      setRecords(logs);
      setSummary(stats);
      setDepartments(deptList);
    } catch (e) {
      console.error("Failed to load daily attendance", e);
      toast.error("Unable to load today's attendance logs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [todayStr]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply filters client-side reactively
  React.useEffect(() => {
    let result = [...records];
    if (filters.status) {
      const s = filters.status.toLowerCase();
      if (s === "present") {
        result = result.filter(
          (r) => r.status.toLowerCase() === "on time" || r.status.toLowerCase() === "present"
        );
      } else if (s === "leave") {
        result = result.filter(
          (r) => r.status.toLowerCase() === "on leave" || r.status.toLowerCase() === "leave"
        );
      } else {
        result = result.filter((r) => r.status.toLowerCase() === s);
      }
    }
    if (filters.departmentId) {
      result = result.filter((r) => r.employees?.department_id === Number(filters.departmentId));
    }
    if (filters.employeeId) {
      result = result.filter((r) => r.employee_id === Number(filters.employeeId));
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.employees?.first_name.toLowerCase().includes(s) ||
          r.employees?.last_name.toLowerCase().includes(s) ||
          r.employees?.employee_code.toLowerCase().includes(s)
      );
    }
    setFilteredRecords(result);
  }, [filters, records]);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Daily Attendance</h2>
            <Button
              variant="ghost"
              size="icon"
              disabled={loading || refreshing}
              onClick={() => {
                loadData(true);
                toast.success("Daily attendance data refreshed.");
              }}
              className="h-8 w-8 hover:bg-slate-100 text-slate-500 rounded-lg mt-1"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/attendance/check-in">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
              <LogIn className="mr-2 h-4 w-4" /> Check In/Out
            </Button>
          </Link>
          <Link href="/attendance/history">
            <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 font-medium">
              <History className="mr-2 h-4 w-4" /> View History
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {summary && <AttendanceSummary summary={summary} />}
          
          {/* Filters */}
          <AttendanceFilters
            departments={departments}
            onFilterChange={setFilters}
            hideDate={true}
          />

          {/* Table */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-500" /> Today's Logs
            </h3>
            <AttendanceTable data={filteredRecords} />
          </div>
        </>
      )}
    </div>
  );
}
