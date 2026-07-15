"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportTable from "@/components/reports/ReportTable";
import AttendanceSummary from "@/components/reports/AttendanceSummary";
import ExportButtons from "@/components/reports/ExportButtons";
import { getDailyReport } from "@/services/report.service";
import { getDepartments } from "@/services/employee.service";
import { DailyReportRecord } from "@/types/report";
import { Department } from "@/types/employee";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";

export default function DailyReportPage() {
  const [records, setRecords] = React.useState<DailyReportRecord[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<{ date?: string; departmentId?: string; search?: string; status?: string }>({
    date: new Date().toISOString().split("T")[0],
  });

  // Sorting state
  const [sortField, setSortField] = React.useState<string>("employee_name");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  // Pagination state
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const pageSize = 10;

  // Summaries state
  const [summary, setSummary] = React.useState({ present: 0, late: 0, absent: 0, onLeave: 0, rate: 100 });

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
        const res = await getDailyReport(filters, page, pageSize);
        setRecords(res.records);
        setTotalCount(res.totalCount);

        // Dynamically compute summaries
        const allRes = await getDailyReport(filters, 1, 1000);
        const present = allRes.records.filter(r => r.status.toLowerCase() === "on time" || r.status.toLowerCase() === "present").length;
        const late = allRes.records.filter(r => r.status.toLowerCase() === "late").length;
        const onLeave = allRes.records.filter(r => r.status.toLowerCase() === "leave" || r.status.toLowerCase() === "on leave").length;
        const absent = allRes.records.filter(r => r.status.toLowerCase() === "absent").length;
        const total = present + late + absent + onLeave;
        const rate = total > 0 ? Math.round(((present + late) / (total - onLeave || total)) * 100) : 100;

        setSummary({ present, late, absent, onLeave, rate });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters, page]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters((prev) => {
      if (
        prev.date === newFilters.date &&
        prev.departmentId === newFilters.departmentId &&
        prev.search === newFilters.search &&
        prev.status === newFilters.status
      ) {
        return prev;
      }
      return newFilters;
    });
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedRecords = React.useMemo(() => {
    const data = [...records];
    data.sort((a, b) => {
      let valA = a[sortField as keyof DailyReportRecord];
      let valB = b[sortField as keyof DailyReportRecord];

      if (valA === null || valA === undefined) return sortOrder === "asc" ? 1 : -1;
      if (valB === null || valB === undefined) return sortOrder === "asc" ? -1 : 1;

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortOrder === "asc"
          ? (valA > valB ? 1 : -1)
          : (valA < valB ? 1 : -1);
      }
    });
    return data;
  }, [records, sortField, sortOrder]);

  const tableHeaders = [
    { label: "Employee", key: "employee_name" },
    { label: "Department", key: "department" },
    { label: "Check In", key: "check_in" },
    { label: "Check Out", key: "check_out" },
    { label: "Status", key: "status" },
    { label: "Working Hours", key: "working_hours" },
  ];

  const formatTime = (isoStr: string | null) => {
    if (!isoStr) return "--:--";
    try {
      return new Date(isoStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "on time" || s === "present") {
      return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">On Time</Badge>;
    }
    if (s === "late") {
      return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50">Late</Badge>;
    }
    if (s === "leave" || s === "on leave") {
      return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50">On Leave</Badge>;
    }
    return <Badge className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-50">Absent</Badge>;
  };

  return (
    <div className="space-y-6 text-black">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href="/reports" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1 mb-1 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Daily Attendance Report</h2>
          <p className="text-muted-foreground">Daily check timestamps audits, presence status, and total working hours.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons
            data={sortedRecords}
            filename="daily_attendance_report"
            headers={tableHeaders.map(h => h.label)}
            keys={tableHeaders.map(h => h.key)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <AttendanceSummary
        present={summary.present}
        late={summary.late}
        absent={summary.absent}
        onLeave={summary.onLeave}
        attendanceRate={summary.rate}
      />

      {/* Filters Card */}
      <ReportFilters
        departments={departments}
        showDate={true}
        showStatus={true}
        statusList={[
          { value: "On Time", label: "On Time" },
          { value: "Late", label: "Late" },
          { value: "Absent", label: "Absent" },
          { value: "Leave", label: "On Leave" },
        ]}
        onFilterChange={handleFilterChange}
      />

      {/* Report Table wrappers */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <ReportTable
          headers={tableHeaders.map(h => h.label)}
          loading={loading}
          empty={sortedRecords.length === 0}
        >
          {sortedRecords.map((row) => (
            <TableRow key={row.id} className="border-slate-100 hover:bg-slate-50/20">
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
              <TableCell className="text-slate-600 text-sm font-semibold">{row.department}</TableCell>
              <TableCell className="text-slate-700 text-sm font-semibold">{formatTime(row.check_in)}</TableCell>
              <TableCell className="text-slate-700 text-sm font-semibold">{formatTime(row.check_out)}</TableCell>
              <TableCell>{getStatusBadge(row.status)}</TableCell>
              <TableCell className="text-slate-600 text-sm font-bold">{row.working_hours} hrs</TableCell>
            </TableRow>
          ))}
        </ReportTable>

        {/* Custom sort headers trigger inject for Table Component header interactions */}
        <div className="flex justify-end p-4 border-t border-slate-100 gap-2 text-xs font-semibold text-slate-500">
          <span>Sort By:</span>
          {tableHeaders.map((h) => (
            <button
              key={h.key}
              onClick={() => handleSort(h.key)}
              className={`hover:text-blue-600 transition flex items-center gap-0.5 ${sortField === h.key ? "text-blue-600 font-bold" : ""}`}
            >
              {h.label}
              {sortField === h.key ? (sortOrder === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Pagination controls */}
      {totalCount > pageSize && (
        <div className="flex justify-between items-center bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-xs">
          <p className="text-xs text-slate-400 font-medium">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} logs
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
