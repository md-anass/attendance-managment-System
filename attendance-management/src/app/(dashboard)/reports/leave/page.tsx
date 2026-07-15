"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportTable from "@/components/reports/ReportTable";
import ExportButtons from "@/components/reports/ExportButtons";
import { getLeaveReport } from "@/services/report.service";
import { getDepartments } from "@/services/employee.service";
import { LeaveReportRecord } from "@/types/report";
import { Department } from "@/types/employee";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";

export default function LeaveReportPage() {
  const [records, setRecords] = React.useState<LeaveReportRecord[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<{ departmentId?: string; search?: string; status?: string }>({});

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
        const res = await getLeaveReport(filters, page, pageSize);
        setRecords(res.records);
        setTotalCount(res.totalCount);
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

  const headers = ["Employee", "Code", "Department", "Leave Type", "Start Date", "End Date", "Duration", "Status", "Reason / Remarks"];

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved") {
      return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">Approved</Badge>;
    }
    if (s === "pending") {
      return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50">Pending</Badge>;
    }
    return <Badge className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-50">Rejected</Badge>;
  };

  return (
    <div className="space-y-6 text-black">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href="/reports" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1 mb-1 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Leave Utilization Audit</h2>
          <p className="text-muted-foreground">Audit leave types requests, approved holiday schedules, and pending counts.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons
            data={records}
            filename="leave_utilization_report"
            headers={headers}
            keys={["employee_name", "employee_code", "department", "leave_type", "start_date", "end_date", "total_days", "status", "remarks"]}
          />
        </div>
      </div>

      {/* Filters Card */}
      <ReportFilters
        departments={departments}
        showStatus={true}
        statusList={[
          { value: "Approved", label: "Approved" },
          { value: "Pending", label: "Pending" },
          { value: "Rejected", label: "Rejected" },
        ]}
        onFilterChange={handleFilterChange}
      />

      {/* Requests Table */}
      <ReportTable headers={headers} loading={loading} empty={records.length === 0}>
        {records.map((row) => (
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
            <TableCell className="font-semibold text-slate-500 text-xs">{row.employee_code}</TableCell>
            <TableCell className="text-slate-600 text-sm font-semibold">{row.department}</TableCell>
            <TableCell className="text-slate-700 text-sm font-semibold">{row.leave_type}</TableCell>
            <TableCell className="text-slate-600 text-sm font-medium">{row.start_date}</TableCell>
            <TableCell className="text-slate-600 text-sm font-medium">{row.end_date}</TableCell>
            <TableCell className="text-slate-700 text-sm font-bold text-center">{row.total_days} days</TableCell>
            <TableCell>{getStatusBadge(row.status)}</TableCell>
            <TableCell className="text-slate-400 text-xs italic max-w-[200px] truncate" title={row.remarks}>
              {row.remarks || "--"}
            </TableCell>
          </TableRow>
        ))}
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
