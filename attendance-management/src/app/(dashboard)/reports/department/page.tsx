"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, BarChart3, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TableRow, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import ReportTable from "@/components/reports/ReportTable";
import ExportButtons from "@/components/reports/ExportButtons";
import { getDepartmentReport } from "@/services/report.service";
import { DepartmentReportRecord } from "@/types/report";

export default function DepartmentReportPage() {
  const [records, setRecords] = React.useState<DepartmentReportRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getDepartmentReport(date);
        setRecords(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [date]);

  const headers = ["Department", "Number of Employees", "Attendance Percentage", "Avg Working Hours", "Late Arrivals", "Leave Requests"];

  return (
    <div className="space-y-6 text-black">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href="/reports" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1 mb-1 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Department Performance Report</h2>
          <p className="text-muted-foreground">Compare department attendance percentages, staff totals, average working hours, and leave rates.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons
            data={records}
            filename={`department_report_${date}`}
            headers={headers}
            keys={["department_name", "total_employees", "attendance_rate", "average_working_hours", "late_arrivals", "leave_requests"]}
          />
        </div>
      </div>

      {/* Date Picker Row */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-4 text-black">
        <div className="space-y-1.5 w-full sm:w-64">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" /> Target Date
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium"
          />
        </div>
        <div className="text-xs font-semibold text-slate-400 sm:self-end sm:pb-3">
          Select target date to load daily department stats.
        </div>
      </div>

      {/* Comparison Graphs */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart 1: Attendance Percentage */}
        <Card className="border border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-500" />
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Attendance Percentage</CardTitle>
                <CardDescription>Presence rate comparison across departments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full w-full bg-slate-50 rounded-lg animate-pulse" />
              ) : records.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">No logs found.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={records.map(r => ({ name: r.department_name, rate: r.attendance_rate }))} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }} formatter={(val) => [`${val}%`, "Attendance Rate"]} />
                    <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Average Working Hours */}
        <Card className="border border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-500" />
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Average Working Hours</CardTitle>
                <CardDescription>Working hours comparison across departments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full w-full bg-slate-50 rounded-lg animate-pulse" />
              ) : records.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">No logs found.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={records.map(r => ({ name: r.department_name, hours: r.average_working_hours }))} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 12]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }} formatter={(val) => [`${val} hrs`, "Avg Working Hours"]} />
                    <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roster Table */}
      <ReportTable headers={headers} loading={loading} empty={records.length === 0}>
        {records.map((row) => (
          <TableRow key={row.department_id} className="border-slate-100 hover:bg-slate-50/20">
            <TableCell className="font-semibold text-slate-800 text-sm">{row.department_name}</TableCell>
            <TableCell className="text-slate-600 text-sm font-semibold text-center">{row.total_employees}</TableCell>
            <TableCell className="text-center">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  row.attendance_rate >= 90
                    ? "bg-emerald-50 text-emerald-700"
                    : row.attendance_rate >= 75
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {row.attendance_rate}%
              </span>
            </TableCell>
            <TableCell className="text-slate-700 text-sm font-semibold text-center">{row.average_working_hours} hrs</TableCell>
            <TableCell className="text-amber-600 text-sm font-bold text-center">{row.late_arrivals}</TableCell>
            <TableCell className="text-blue-600 text-sm font-bold text-center">{row.leave_requests}</TableCell>
          </TableRow>
        ))}
      </ReportTable>
    </div>
  );
}
