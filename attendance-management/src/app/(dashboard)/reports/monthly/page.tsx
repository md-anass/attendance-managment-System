"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableRow, TableCell } from "@/components/ui/table";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportTable from "@/components/reports/ReportTable";
import ExportButtons from "@/components/reports/ExportButtons";
import { getMonthlyReport } from "@/services/report.service";
import { getDepartments } from "@/services/employee.service";
import { MonthlyReportRecord } from "@/types/report";
import { Department } from "@/types/employee";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";

export default function MonthlyReportPage() {
  const [records, setRecords] = React.useState<MonthlyReportRecord[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [month, setMonth] = React.useState(new Date().toISOString().slice(0, 7)); // "YYYY-MM"
  const [filters, setFilters] = React.useState<{ departmentId?: string; search?: string }>({});

  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const pageSize = 10;

  React.useEffect(() => {
    async function loadDepts() {
      try {
        const list = await getDepartments();
        setDepartments(list);
      } catch (err) {
        console.error(err);
      }
    }
    loadDepts();
  }, []);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getMonthlyReport(month, filters.departmentId, filters.search, page, pageSize);
        setRecords(res.records);
        setTotalCount(res.totalCount);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [month, filters, page]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters((prev) => {
      if (prev.departmentId === newFilters.departmentId && prev.search === newFilters.search) {
        return prev;
      }
      return newFilters;
    });
    setPage(1);
  };

  const headers = ["Employee", "Present", "Absent", "Late", "Leave", "Attendance %"];

  // Compute column totals from un-paginated logs
  const totals = React.useMemo(() => {
    if (records.length === 0) return { present: 0, absent: 0, late: 0, leave: 0, rate: 0 };
    const present = records.reduce((acc, r) => acc + r.present_days, 0);
    const absent = records.reduce((acc, r) => acc + r.absent_days, 0);
    const late = records.reduce((acc, r) => acc + r.late_days, 0);
    const leave = records.reduce((acc, r) => acc + r.leave_days, 0);
    const rate = Math.round(records.reduce((acc, r) => acc + r.attendance_rate, 0) / records.length);
    return { present, absent, late, leave, rate };
  }, [records]);

  return (
    <div className="space-y-6 text-black">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href="/reports" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1 mb-1 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Monthly Summary Report</h2>
          <p className="text-muted-foreground">Aggregated monthly attendance rates, present/absent/late totals per employee.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons
            data={records}
            filename={`monthly_report_${month}`}
            headers={headers}
            keys={["employee_name", "present_days", "absent_days", "late_days", "leave_days", "attendance_rate"]}
          />
        </div>
      </div>

      {/* Month Picker Row */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-4 text-black">
        <div className="space-y-1.5 w-full sm:w-64">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" /> Target Month
          </label>
          <Input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(1);
            }}
            className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium"
          />
        </div>
        <div className="text-xs font-semibold text-slate-400 sm:self-end sm:pb-3">
          Select YYYY-MM to load specific monthly aggregates.
        </div>
      </div>

      {/* Filters Card */}
      <ReportFilters departments={departments} onFilterChange={handleFilterChange} />

      {/* Aggregated Logs Table */}
      <ReportTable headers={headers} loading={loading} empty={records.length === 0}>
        {records.map((row) => (
          <TableRow key={row.employee_id} className="border-slate-100 hover:bg-slate-50/20">
            <TableCell>
              <div className="flex items-center gap-3">
                <EmployeeAvatar
                  firstName={row.employee_name.split(" ")[0]}
                  lastName={row.employee_name.split(" ")[1] || ""}
                  className="h-9 w-9 text-xs"
                />
                <span className="font-semibold text-slate-800 text-sm">{row.employee_name}</span>
              </div>
            </TableCell>
            <TableCell className="text-emerald-600 text-sm font-bold text-center">{row.present_days}</TableCell>
            <TableCell className="text-rose-600 text-sm font-bold text-center">{row.absent_days}</TableCell>
            <TableCell className="text-amber-600 text-sm font-semibold text-center">{row.late_days}</TableCell>
            <TableCell className="text-blue-600 text-sm font-semibold text-center">{row.leave_days}</TableCell>
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
          </TableRow>
        ))}
        {/* Totals Row at the bottom of the table */}
        {records.length > 0 && (
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 font-bold border-t-2 border-slate-200">
            <TableCell className="font-extrabold text-slate-850 text-sm">TOTALS</TableCell>
            <TableCell className="text-emerald-600 text-sm font-extrabold text-center">{totals.present}</TableCell>
            <TableCell className="text-rose-600 text-sm font-extrabold text-center">{totals.absent}</TableCell>
            <TableCell className="text-amber-600 text-sm font-extrabold text-center">{totals.late}</TableCell>
            <TableCell className="text-blue-600 text-sm font-extrabold text-center">{totals.leave}</TableCell>
            <TableCell className="text-slate-800 text-sm font-extrabold text-center">
              <span className="bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded text-xs">
                {totals.rate}%
              </span>
            </TableCell>
          </TableRow>
        )}
      </ReportTable>

      {/* Pagination controls */}
      {totalCount > pageSize && (
        <div className="flex justify-between items-center bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-xs">
          <p className="text-xs text-slate-400 font-medium">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} records
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="border-slate-200/80 rounded-xl h-9"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * pageSize >= totalCount}
              onClick={() => setPage(p => p + 1)}
              className="border-slate-200/80 rounded-xl h-9"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
