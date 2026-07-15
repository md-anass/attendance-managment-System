"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  UserX,
  Palmtree,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Import modular components
import StatCard from "@/components/dashboard/StatCard";
import AttendanceChart from "@/components/dashboard/AttendanceChart";
import StatusChart from "@/components/dashboard/StatusChart";
import RecentAttendance from "@/components/dashboard/RecentAttendance";
import PendingLeaves from "@/components/dashboard/PendingLeaves";
import UpcomingHolidays from "@/components/dashboard/UpcomingHolidays";

// Import service
import {
  getDashboardStats,
  getRecentAttendance,
  getPendingLeaves,
  getUpcomingHolidays,
} from "@/services/dashboard.service";

import {
  DashboardStats,
  AttendanceRecord,
  LeaveRequest,
  Holiday,
} from "@/types/dashboard";

const lineChartData = [
  { name: "Mon", Present: 90, Absent: 20, Leave: 10 },
  { name: "Tue", Present: 92, Absent: 18, Leave: 10 },
  { name: "Wed", Present: 95, Absent: 15, Leave: 10 },
  { name: "Thu", Present: 88, Absent: 22, Leave: 10 },
  { name: "Fri", Present: 94, Absent: 16, Leave: 10 },
  { name: "Sat", Present: 96, Absent: 14, Leave: 10 },
  { name: "Sun", Present: 95, Absent: 15, Leave: 10 },
];

export default function Page() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [employees, setEmployees] = React.useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = React.useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = React.useState<Holiday[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorState, setErrorState] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const [statsData, attendanceData, leavesData, holidaysData] = await Promise.all([
        getDashboardStats(),
        getRecentAttendance(),
        getPendingLeaves(),
        getUpcomingHolidays(),
      ]);
      setStats(statsData);
      setEmployees(attendanceData);
      setLeaves(leavesData);
      setHolidays(holidaysData);
    } catch (error: any) {
      console.error("Failed to load dashboard data:", error);
      setErrorState("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApproveLeave = (name: string) => {
    setLeaves((prev) => prev.filter((req) => req.name !== name));
    toast.success(`Leave request for ${name} approved successfully.`);
  };

  const handleRejectLeave = (name: string) => {
    setLeaves((prev) => prev.filter((req) => req.name !== name));
    toast.error(`Leave request for ${name} has been rejected.`);
  };

  // Calculate percentages dynamically from data
  const pieChartData = stats ? [
    { name: "Present", value: stats.presentToday, color: "#10b981" },
    { name: "Absent", value: stats.absentToday, color: "#ef4444" },
    { name: "On Leave", value: stats.onLeave, color: "#f97316" },
  ] : [];

  if (errorState) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4 text-center">
        <div className="text-rose-600 text-lg font-semibold">{errorState}</div>
        <p className="text-slate-500 text-sm max-w-sm">Please check your database connection credentials and try again.</p>
        <Button onClick={loadData} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-black">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">Manage and monitor today's attendance metrics, schedules, and leaves.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
            <Plus className="mr-2 h-4 w-4" /> Add Attendance
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-6">
        {loading || !stats
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            ))
          : <>
              <StatCard
                title="Total Employees"
                value={stats.totalEmployees}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Present Today"
                value={stats.presentToday}
                icon={UserCheck}
                color="green"
              />
              <StatCard
                title="Absent Today"
                value={stats.absentToday}
                icon={UserX}
                color="red"
              />
              <StatCard
                title="On Leave"
                value={stats.onLeave}
                icon={Palmtree}
                color="orange"
              />
            </>
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ))
          : <>
              <AttendanceChart data={lineChartData} />
              <StatusChart data={pieChartData} totalPresent={stats ? stats.presentToday : 0} />
            </>
        }
      </div>

      {/* Today's Attendance Table */}
      <div>
        {loading
          ? <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <div className="space-y-2 flex items-center justify-between">
                <div>
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-72 mt-2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 w-[250px]">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            </div>
          : <RecentAttendance data={employees} />
        }
      </div>

      {/* Leaves + Holidays */}
      <div className="grid grid-cols-2 gap-6">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-52" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-xl" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          : <>
              <PendingLeaves
                data={leaves}
                onApprove={handleApproveLeave}
                onReject={handleRejectLeave}
              />
              <UpcomingHolidays data={holidays} />
            </>
        }
      </div>
    </div>
  );
}
