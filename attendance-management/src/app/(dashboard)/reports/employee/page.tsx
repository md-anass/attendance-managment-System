"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, User, Calendar, Mail, ShieldAlert, Award, FileSpreadsheet, ChevronLeft, ChevronRight, Building2, UserCheck, Clock, Palmtree, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReportTable from "@/components/reports/ReportTable";
import EmployeeAttendanceChart from "@/components/reports/EmployeeAttendanceChart";
import ExportButtons from "@/components/reports/ExportButtons";
import { getEmployeeReport, getLeaveReport } from "@/services/report.service";
import { getEmployees, getDepartments } from "@/services/employee.service";
import { DailyReportRecord, LeaveReportRecord } from "@/types/report";
import { Employee, Department } from "@/types/employee";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";
import StatCard from "@/components/dashboard/StatCard";

export default function EmployeeReportPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [selectedEmpId, setSelectedEmpId] = React.useState<string>("");
  const [records, setRecords] = React.useState<DailyReportRecord[]>([]);
  const [leaveRecords, setLeaveRecords] = React.useState<LeaveReportRecord[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Month navigation for Roster Calendar
  const [calendarDate, setCalendarDate] = React.useState(new Date());

  React.useEffect(() => {
    async function loadInitial() {
      try {
        const [empRes, deptRes] = await Promise.all([
          getEmployees({ pageSize: 150 }),
          getDepartments(),
        ]);
        setEmployees(empRes.employees);
        setDepartments(deptRes);
        if (empRes.employees.length > 0) {
          setSelectedEmpId(String(empRes.employees[0].id));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadInitial();
  }, []);

  const activeEmployee = React.useMemo(() => {
    return employees.find((e) => String(e.id) === selectedEmpId) || null;
  }, [employees, selectedEmpId]);

  const activeDept = React.useMemo(() => {
    if (!activeEmployee) return "Unassigned";
    const dept = departments.find((d) => d.id === activeEmployee.department_id);
    return dept ? dept.name : "Unassigned";
  }, [departments, activeEmployee]);

  // Fetch reports data for the selected employee based on calendarDate month range
  React.useEffect(() => {
    if (!selectedEmpId) return;
    async function loadData() {
      setLoading(true);
      try {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth() + 1;
        const totalDays = new Date(year, month, 0).getDate();
        
        const startStr = `${year}-${String(month).padStart(2, "0")}-01`;
        const endStr = `${year}-${String(month).padStart(2, "0")}-${String(totalDays).padStart(2, "0")}`;

        const [attRes, leavesRes] = await Promise.all([
          getEmployeeReport(Number(selectedEmpId), startStr, endStr),
          getLeaveReport({ search: activeEmployee?.employee_code }, 1, 50),
        ]);

        setRecords(attRes);
        setLeaveRecords(leavesRes.records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedEmpId, calendarDate, activeEmployee]);

  // Performance Summary calculations
  const stats = React.useMemo(() => {
    const totalDays = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
    let workingDaysCount = 0;
    for (let d = 1; d <= totalDays; d++) {
      const dayOfWeek = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), d).getDay();
      if (dayOfWeek !== 0) workingDaysCount++; 
    }

    const present = records.filter(r => r.status.toLowerCase() === "on time" || r.status.toLowerCase() === "present").length;
    const late = records.filter(r => r.status.toLowerCase() === "late").length;
    const leave = records.filter(r => r.status.toLowerCase() === "leave" || r.status.toLowerCase() === "on leave").length;
    const absent = records.filter(r => r.status.toLowerCase() === "absent").length;
    
    const rate = workingDaysCount > 0 ? Math.round(((present + late) / (workingDaysCount - leave || workingDaysCount)) * 100) : 100;
    const overtime = records.reduce((acc, r) => acc + r.overtime_hours, 0);

    return {
      workingDays: workingDaysCount,
      present,
      late,
      leave,
      absent,
      rate,
      overtime,
    };
  }, [records, calendarDate]);

  // Roster calendar layout cells generator
  const renderCalendarCells = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="h-10 w-full" />);
    }

    for (let d = 1; d <= totalDays; d++) {
      const cellDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const log = records.find(r => r.attendance_date === cellDateStr);

      let statusColor = "bg-slate-50 text-slate-400 hover:bg-slate-100/80";
      let title = "No logs";

      if (log) {
        const s = log.status.toLowerCase();
        if (s === "on time" || s === "present") {
          statusColor = "bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-100";
          title = `Present: ${log.check_in ? new Date(log.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}`;
        } else if (s === "late") {
          statusColor = "bg-amber-50 border border-amber-200 text-amber-700 font-bold hover:bg-amber-100";
          title = `Late: ${log.check_in ? new Date(log.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}`;
        } else if (s === "leave" || s === "on leave") {
          statusColor = "bg-blue-50 border border-blue-200 text-blue-700 font-bold hover:bg-blue-100";
          title = "On Leave";
        } else if (s === "absent") {
          statusColor = "bg-rose-50 border border-rose-200 text-rose-700 font-bold hover:bg-rose-100";
          title = "Absent";
        }
      } else {
        const dayOfWeek = new Date(year, month, d).getDay();
        if (dayOfWeek === 0) {
          statusColor = "bg-slate-100 text-slate-400 font-medium";
          title = "Sunday (Off)";
        }
      }

      cells.push(
        <div
          key={`day-${d}`}
          className={`h-10 w-full flex items-center justify-center rounded-xl text-xs transition-colors cursor-pointer select-none ${statusColor}`}
          title={title}
        >
          {d}
        </div>
      );
    }
    return cells;
  };

  const chartData = React.useMemo(() => {
    return records.map((r) => {
      const dObj = new Date(r.attendance_date);
      return {
        date: dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        hours: r.working_hours,
        overtime: r.overtime_hours,
      };
    });
  }, [records]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6 text-black">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href="/reports" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1 mb-1 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Individual Employee Audit</h2>
          <p className="text-muted-foreground">Comprehensive performance review, timeline calendar, stats, and leave histories.</p>
        </div>
        {activeEmployee && (
          <div className="flex items-center gap-2">
            <ExportButtons
              data={records}
              filename={`employee_audit_${activeEmployee.first_name}_${activeEmployee.last_name}`}
              headers={["Date", "Shift", "Check In", "Check Out", "Working Hours", "Overtime", "Status"]}
              keys={["attendance_date", "shift_name", "check_in", "check_out", "working_hours", "overtime_hours", "status"]}
            />
          </div>
        )}
      </div>

      {/* Select Employee Bar */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-4 text-black">
        <div className="space-y-1.5 w-full sm:w-80">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-slate-400" /> Target Employee
          </label>
          <Select value={selectedEmpId} onValueChange={(val) => setSelectedEmpId(val || "")}>
            <SelectTrigger className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium">
              <SelectValue placeholder="Choose employee" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={String(emp.id)}>
                  {emp.first_name} {emp.last_name} ({emp.employee_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-xs font-semibold text-slate-400 sm:self-end sm:pb-3">
          Audit stats will load automatically on choice.
        </div>
      </div>

      {activeEmployee && (
        <>
          {/* Employee Profile Summary */}
          <Card className="border border-slate-200 bg-white overflow-hidden shadow-xs">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-col sm:flex-row items-center gap-5 space-y-0">
              <EmployeeAvatar
                firstName={activeEmployee.first_name}
                lastName={activeEmployee.last_name}
                className="h-16 w-16 text-xl shadow-xs"
              />
              <div className="flex-1 text-center sm:text-left min-w-0">
                <CardTitle className="text-xl font-bold text-slate-800">
                  {activeEmployee.first_name} {activeEmployee.last_name}
                </CardTitle>
                <p className="text-sm text-slate-500 font-semibold mt-1">
                  {activeEmployee.designation} &bull; <span className="text-slate-400">{activeEmployee.employee_code}</span>
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3 text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {activeDept}</span>
                  <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {activeEmployee.email}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined: {activeEmployee.joining_date}</span>
                </div>
              </div>
              <div>
                <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${activeEmployee.status === "active" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
                  {activeEmployee.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Monthly Statistics Grid */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <StatCard title="Total Present" value={stats.present} icon={UserCheck} color="green" />
            <StatCard title="Attendance Rate" value={`${stats.rate}%`} icon={Award} color="blue" />
            <StatCard title="Late Arrivals" value={stats.late} icon={Clock} color="amber" />
            <StatCard title="On Leave" value={stats.leave} icon={Palmtree} color="blue" />
            <StatCard title="Absent Days" value={stats.absent} icon={UserX} color="red" />
            <StatCard title="Overtime Hours" value={`${stats.overtime} hrs`} icon={ShieldAlert} color="green" />
          </div>

          {/* Main Content Layout Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Roster Attendance Calendar (width 1) */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-xs">
                <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-slate-400" /> Attendance Calendar
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                    </span>
                    <div className="flex gap-0.5">
                      <Button variant="outline" size="icon" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} className="h-7 w-7">
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} className="h-7 w-7">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {renderCalendarCells()}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-3 gap-y-2 mt-4 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-emerald-50 border border-emerald-100" /> Present</span>
                    <span className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-amber-50 border border-amber-100" /> Late</span>
                    <span className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-rose-50 border border-rose-100" /> Absent</span>
                    <span className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-blue-50 border border-blue-100" /> Leave</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Graphic and Tables (width 2) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Working Hours & Overtime Chart */}
              <EmployeeAttendanceChart data={chartData} />

              {/* Leave History Table */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Leave Applications History</h3>
                <ReportTable headers={["Type", "Start Date", "End Date", "Days", "Status"]} loading={loading} empty={leaveRecords.length === 0}>
                  {leaveRecords.map((l) => (
                    <TableRow key={l.id} className="border-slate-100 hover:bg-slate-50/10">
                      <TableCell className="font-semibold text-slate-800 text-sm">{l.leave_type}</TableCell>
                      <TableCell className="text-slate-600 text-xs font-medium">{l.start_date}</TableCell>
                      <TableCell className="text-slate-600 text-xs font-medium">{l.end_date}</TableCell>
                      <TableCell className="text-slate-700 text-sm font-bold">{l.total_days} days</TableCell>
                      <TableCell>
                        <Badge className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : l.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}>
                          {l.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </ReportTable>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
