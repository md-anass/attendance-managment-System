"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, Layers, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportTable from "@/components/reports/ReportTable";
import ExportButtons from "@/components/reports/ExportButtons";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDailyReport, getMonthlyReport, getLeaveReport } from "@/services/report.service";
import { getDepartments } from "@/services/employee.service";
import { Department } from "@/types/employee";

type ReportType = "daily" | "monthly" | "leave";

export default function ExportHubPage() {
  const [reportType, setReportType] = React.useState<ReportType>("daily");
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [records, setRecords] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<any>({
    date: new Date().toISOString().split("T")[0],
  });

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
        if (reportType === "daily") {
          const res = await getDailyReport(filters, 1, 100);
          setRecords(res.records);
        } else if (reportType === "monthly") {
          const targetMonth = filters.date ? filters.date.slice(0, 7) : new Date().toISOString().slice(0, 7);
          const res = await getMonthlyReport(targetMonth, filters.departmentId, filters.search, 1, 100);
          setRecords(res.records);
        } else if (reportType === "leave") {
          const res = await getLeaveReport(filters, 1, 100);
          setRecords(res.records);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [reportType, filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const getHeadersAndKeys = () => {
    if (reportType === "daily") {
      return {
        headers: ["Employee", "Code", "Department", "Shift", "Check In", "Check Out", "Hours", "Overtime", "Status"],
        keys: ["employee_name", "employee_code", "department", "shift_name", "check_in", "check_out", "working_hours", "overtime_hours", "status"],
      };
    }
    if (reportType === "monthly") {
      return {
        headers: ["Employee", "Code", "Department", "Working Days", "Present Days", "Absent Days", "Late Days", "Leaves", "Overtime", "Rate"],
        keys: ["employee_name", "employee_code", "department", "total_working_days", "present_days", "absent_days", "late_days", "leave_days", "overtime_hours", "attendance_rate"],
      };
    }
    return {
      headers: ["Employee", "Code", "Department", "Leave Type", "Start Date", "End Date", "Duration", "Status", "Reason / Remarks"],
      keys: ["employee_name", "employee_code", "department", "leave_type", "start_date", "end_date", "total_days", "status", "remarks"],
    };
  };

  const config = getHeadersAndKeys();

  return (
    <div className="space-y-6 text-black">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href="/reports" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1 mb-1 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Export & Downloads Hub</h2>
          <p className="text-muted-foreground">Download comprehensive CSV sheets tailored by date-range, departments, and status.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons
            data={records}
            filename={`${reportType}_report`}
            headers={config.headers}
            keys={config.keys}
          />
        </div>
      </div>

      {/* Info Warning Bar */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-700">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold">Info:</span> Generating CSV downloads runs entirely client-side. Make sure to apply the filter metrics card below to adjust the parameters of rows included in the export.
        </div>
      </div>

      {/* Select Report Type */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-4 text-black">
        <div className="space-y-1.5 w-full sm:w-80">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-slate-400" /> Choose Export Type
          </label>
          <Select value={reportType} onValueChange={(val) => setReportType((val || "daily") as ReportType)}>
            <SelectTrigger className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="daily">Daily Attendance Logs</SelectItem>
              <SelectItem value="monthly">Monthly Aggregations Summary</SelectItem>
              <SelectItem value="leave">Leave Request Audits</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-xs font-semibold text-slate-400 sm:self-end sm:pb-3">
          Exports include up to 100 matching rows per download sheet.
        </div>
      </div>

      {/* Filters Card */}
      <ReportFilters
        departments={departments}
        showDate={reportType === "daily"}
        showDateRange={reportType === "leave"}
        showStatus={true}
        statusList={
          reportType === "daily"
            ? [
                { value: "On Time", label: "On Time" },
                { value: "Late", label: "Late" },
                { value: "Absent", label: "Absent" },
                { value: "Leave", label: "On Leave" },
              ]
            : reportType === "monthly"
            ? []
            : [
                { value: "Approved", label: "Approved" },
                { value: "Pending", label: "Pending" },
                { value: "Rejected", label: "Rejected" },
              ]
        }
        onFilterChange={handleFilterChange}
      />

      {/* Preview Table */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Export Preview (First 100 rows)</h3>
        <ReportTable headers={config.headers} loading={loading} empty={records.length === 0}>
          {records.map((row, idx) => (
            <TableRow key={idx} className="border-slate-100 hover:bg-slate-50/10">
              {config.keys.map((key) => {
                const val = row[key];
                if (key === "status") {
                  return (
                    <TableCell key={key}>
                      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 text-xs font-medium border border-slate-200">
                        {String(val)}
                      </Badge>
                    </TableCell>
                  );
                }
                return (
                  <TableCell key={key} className="text-slate-600 text-sm font-medium">
                    {val !== null && val !== undefined ? String(val) : "--"}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </ReportTable>
      </div>
    </div>
  );
}
