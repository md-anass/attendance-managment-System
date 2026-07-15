"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserCheck,
  UserX,
  Palmtree,
  Clock,
  Percent,
  Calendar,
  Building2,
  TrendingUp,
  PieChart as PieIcon,
  BarChart as BarIcon,
  LineChart as LineIcon,
  AreaChart as AreaIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getAttendanceHistory } from "@/services/attendance.service";
import { getEmployees, getDepartments } from "@/services/employee.service";
import { getShifts } from "@/services/shift.service";
import { getLeaveRequests } from "@/services/leave.service";
import { Department, Employee } from "@/types/employee";
import { Shift } from "@/types/shift";
import StatCard from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Filters {
  startDate: string;
  endDate: string;
  departmentId: string;
  employeeId: string;
  shiftId: string;
}

export default function ReportsDashboard() {
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  
  const [filters, setFilters] = React.useState<Filters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    departmentId: "all",
    employeeId: "all",
    shiftId: "all",
  });

  const [loading, setLoading] = React.useState(true);

  // Raw dataset states
  const [activeLogs, setActiveLogs] = React.useState<any[]>([]);
  const [activeLeaves, setActiveLeaves] = React.useState<any[]>([]);
  const [filteredEmpsCount, setFilteredEmpsCount] = React.useState(0);

  React.useEffect(() => {
    async function loadOptions() {
      try {
        const [deptList, shiftList, empList] = await Promise.all([
          getDepartments(),
          getShifts(),
          getEmployees({ pageSize: 150 }),
        ]);
        setDepartments(deptList);
        setShifts(shiftList);
        setEmployees(empList.employees);
      } catch (err) {
        console.error("Failed to load options", err);
      }
    }
    loadOptions();
  }, []);

  React.useEffect(() => {
    async function computeMetrics() {
      setLoading(true);
      try {
        // Fetch logs matching filters
        const historyRes = await getAttendanceHistory({
          startDate: filters.startDate,
          endDate: filters.endDate,
          departmentId: filters.departmentId === "all" ? undefined : filters.departmentId,
          employeeId: filters.employeeId === "all" ? undefined : filters.employeeId,
        }, 1, 1000);

        // Fetch leaves matching dates range
        const leavesRes = await getLeaveRequests({}, 1, 1000);

        // Apply local filters for shifts and matching parameters
        let filteredEmployees = [...employees];
        if (filters.departmentId && filters.departmentId !== "all") {
          filteredEmployees = filteredEmployees.filter(e => e.department_id === Number(filters.departmentId));
        }
        if (filters.shiftId && filters.shiftId !== "all") {
          filteredEmployees = filteredEmployees.filter(e => e.shift_id === Number(filters.shiftId));
        }
        if (filters.employeeId && filters.employeeId !== "all") {
          filteredEmployees = filteredEmployees.filter(e => e.id === Number(filters.employeeId));
        }

        setFilteredEmpsCount(filteredEmployees.length);
        const employeeIds = filteredEmployees.map(e => e.id);

        // Filter logs matching employees list
        let logs = historyRes.records.filter(r => employeeIds.includes(r.employee_id));
        if (filters.shiftId && filters.shiftId !== "all") {
          const selectedShift = shifts.find(s => String(s.id) === filters.shiftId);
          if (selectedShift) {
            logs = logs.filter(log => log.shift_name === selectedShift.name);
          }
        }

        const approvedLeaves = leavesRes.records.filter(
          l =>
            employeeIds.includes(l.employee_id) &&
            l.status === "Approved" &&
            l.start_date <= filters.endDate &&
            l.end_date >= filters.startDate
        );

        setActiveLogs(logs);
        setActiveLeaves(approvedLeaves);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    computeMetrics();
  }, [filters, employees, shifts]);

  // Derived metrics calculations
  const stats = React.useMemo(() => {
    const totalEmployees = filteredEmpsCount;
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    const diffMs = end.getTime() - start.getTime();
    const daysInRange = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);

    const presentCount = activeLogs.filter(
      log => log.status.toLowerCase() === "on time" || log.status.toLowerCase() === "present" || log.status.toLowerCase() === "late"
    ).length;

    const lateCount = activeLogs.filter(log => log.status.toLowerCase() === "late").length;
    const leaveCount = activeLeaves.length;
    const potentialSlots = totalEmployees * daysInRange;
    const absentCount = Math.max(0, potentialSlots - presentCount - leaveCount);
    const attendanceRate = potentialSlots > 0 ? Math.round((presentCount / (potentialSlots - leaveCount || potentialSlots)) * 100) : 100;

    return {
      totalEmployees,
      presentCount,
      absentCount,
      lateCount,
      leaveCount,
      attendanceRate,
      daysInRange,
    };
  }, [activeLogs, activeLeaves, filteredEmpsCount, filters]);

  // Recharts Chart 1: Attendance Trend Over Time (Line Chart)
  const lineChartData = React.useMemo(() => {
    const datesMap: { [date: string]: { present: number; total: number } } = {};
    
    // Initialize dates in range
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      datesMap[dateStr] = { present: 0, total: 0 };
    }

    activeLogs.forEach(log => {
      const dateStr = log.check_in ? log.check_in.split("T")[0] : null;
      if (dateStr && datesMap[dateStr]) {
        datesMap[dateStr].total++;
        if (log.status.toLowerCase() !== "absent") {
          datesMap[dateStr].present++;
        }
      }
    });

    return Object.keys(datesMap).map(date => {
      const { present, total } = datesMap[date];
      const rate = total > 0 ? Math.round((present / total) * 100) : 100;
      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        "Attendance Rate": rate,
      };
    });
  }, [activeLogs, filters]);

  // Recharts Chart 2: Attendance By Department (Bar Chart)
  const barChartData = React.useMemo(() => {
    return departments.map(dept => {
      const deptEmployees = employees.filter(e => e.department_id === dept.id);
      const empIds = deptEmployees.map(e => e.id);
      const deptLogs = activeLogs.filter(log => empIds.includes(log.employee_id));
      const present = deptLogs.filter(log => log.status.toLowerCase() !== "absent").length;
      const rate = deptLogs.length > 0 ? Math.round((present / deptLogs.length) * 100) : 100;

      return {
        name: dept.name,
        "Attendance Rate": rate,
      };
    });
  }, [activeLogs, departments, employees]);

  // Recharts Chart 3: Status Pie Chart (Present vs Absent vs Leave)
  const pieChartData = React.useMemo(() => {
    return [
      { name: "Present", value: stats.presentCount, color: "#10b981" },
      { name: "Absent", value: stats.absentCount, color: "#ef4444" },
      { name: "On Leave", value: stats.leaveCount, color: "#3b82f6" },
    ].filter(item => item.value > 0);
  }, [stats]);

  // Recharts Chart 4: Working Hours Area Chart
  const areaChartData = React.useMemo(() => {
    const datesMap: { [date: string]: { working: number; overtime: number } } = {};

    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      datesMap[dateStr] = { working: 0, overtime: 0 };
    }

    activeLogs.forEach(log => {
      const dateStr = log.check_in ? log.check_in.split("T")[0] : null;
      if (dateStr && datesMap[dateStr]) {
        // Assume standard 8 hours regular, dynamic difference
        const startMs = log.check_in ? new Date(log.check_in).getTime() : 0;
        const endMs = log.check_out ? new Date(log.check_out).getTime() : 0;
        const totalHrs = startMs && endMs ? (endMs - startMs) / (1000 * 60 * 60) : 8;
        datesMap[dateStr].working += Math.min(8, totalHrs);
        datesMap[dateStr].overtime += Number(log.overtime_hours || 0);
      }
    });

    return Object.keys(datesMap).map(date => {
      const { working, overtime } = datesMap[date];
      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        "Regular Hours": Math.round(working * 10) / 10,
        "Overtime Hours": Math.round(overtime * 10) / 10,
      };
    });
  }, [activeLogs, filters]);

  const reportLinks = [
    {
      title: "Daily Attendance Report",
      description: "Timestamps, late markers, and shift overrides.",
      href: "/reports/daily",
      icon: Calendar,
      color: "text-blue-600 bg-blue-50/50 border-blue-100",
    },
    {
      title: "Monthly Summary Report",
      description: "Monthly rates, leaves, and overtime aggregates.",
      href: "/reports/monthly",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50/50 border-emerald-100",
    },
    {
      title: "Individual Employee Audit",
      description: "Hours histories and timeline charts audits.",
      href: "/reports/employee",
      icon: Users,
      color: "text-violet-600 bg-violet-50/50 border-violet-100",
    },
    {
      title: "Department Comparison",
      description: "Comparative visual graphs per department.",
      href: "/reports/department",
      icon: Building2,
      color: "text-amber-600 bg-amber-50/50 border-amber-100",
    },
    {
      title: "Leave Utilization Audit",
      description: "Tracks approved durations and balances.",
      href: "/reports/leave",
      icon: Palmtree,
      color: "text-rose-600 bg-rose-50/50 border-rose-100",
    },
  ];

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics Hub</h2>
        <p className="text-muted-foreground">Monitor staffing rates, inspect logs, and download business reports.</p>
      </div>

      {/* Roster Filters Row */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 items-end">
          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              Start Date
            </label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              End Date
            </label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium"
            />
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-slate-400" /> Department
            </label>
            <Select
              value={filters.departmentId}
              onValueChange={(val) => setFilters(prev => ({ ...prev, departmentId: val || "all" }))}
            >
              <SelectTrigger className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employee */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" /> Employee
            </label>
            <Select
              value={filters.employeeId}
              onValueChange={(val) => setFilters(prev => ({ ...prev, employeeId: val || "all" }))}
            >
              <SelectTrigger className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.first_name} {e.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shift */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" /> Shift Profile
            </label>
            <Select
              value={filters.shiftId}
              onValueChange={(val) => setFilters(prev => ({ ...prev, shiftId: val || "all" }))}
            >
              <SelectTrigger className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium">
                <SelectValue placeholder="All Shifts" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Shifts</SelectItem>
                {shifts.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Metrics Aggregate Summary Row */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl border border-slate-200" />
          ))
        ) : (
          <>
            <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} color="blue" />
            <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} icon={Percent} color="green" />
            <StatCard title="Present Count" value={stats.presentCount} icon={UserCheck} color="green" />
            <StatCard title="Absent Count" value={stats.absentCount} icon={UserX} color="red" />
            <StatCard title="Late Arrivals" value={stats.lateCount} icon={Clock} color="amber" />
            <StatCard title="On Leave" value={stats.leaveCount} icon={Palmtree} color="blue" />
          </>
        )}
      </div>

      {/* Sub-Reports Nav Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {reportLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.title} href={link.href} className="group">
              <Card className="hover:shadow-md transition-all border border-slate-200 bg-white h-full flex flex-col justify-between p-4">
                <div className="space-y-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${link.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {link.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recharts Analytics Grid (2x2 Layout) */}
      <div className="grid gap-6 md:grid-cols-2 pt-2">
        {/* Chart 1: Attendance Trend Over Time (Line Chart) */}
        <Card className="border border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <LineIcon className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Attendance Trend Over Time</CardTitle>
                <CardDescription>Daily attendance rates timeline in date range</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              {loading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : lineChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">No logs records found.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="Attendance Rate" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Attendance By Department (Bar Chart) */}
        <Card className="border border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarIcon className="h-5 w-5 text-emerald-500" />
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Attendance by Department</CardTitle>
                <CardDescription>Average presence percentage per department</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              {loading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : barChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">No department data.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                    <Bar dataKey="Attendance Rate" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Present vs Absent vs Leave (Pie Chart) */}
        <Card className="border border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-indigo-500" />
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Status Breakdown</CardTitle>
                <CardDescription>Present, Absent, and On Leave ratios comparison</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col justify-between">
            <div className="h-48 w-full">
              {loading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : pieChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">No status data.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} slots`, "Total Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Status custom Legend */}
            <div className="flex justify-center gap-4 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
              {pieChartData.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart 4: Monthly Working Hours (Area Chart) */}
        <Card className="border border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AreaIcon className="h-5 w-5 text-amber-500" />
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Regular and Overtime Hours</CardTitle>
                <CardDescription>Worked regular vs overtime hours trends</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              {loading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : areaChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">No hours logged.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Area type="monotone" dataKey="Regular Hours" stackId="1" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} />
                    <Area type="monotone" dataKey="Overtime Hours" stackId="1" stroke="#f59e0b" fill="#fef3c7" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
