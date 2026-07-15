"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import AttendanceFilters from "@/components/attendance/AttendanceFilters";
import { getAttendanceHistory } from "@/services/attendance.service";
import { getDepartments } from "@/services/employee.service";
import { Department } from "@/types/employee";
import { Attendance, AttendanceFilters as FilterType } from "@/types/attendance";

export default function AttendanceHistoryPage() {
  const [records, setRecords] = React.useState<Attendance[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<FilterType>({});
  
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const pageSize = 10;

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [historyData, deptList] = await Promise.all([
        getAttendanceHistory(filters, page, pageSize),
        getDepartments(),
      ]);
      setRecords(historyData.records);
      setTotalCount(historyData.totalCount);
      setDepartments(deptList);
    } catch (e) {
      console.error("Failed to load attendance history", e);
      toast.error("Unable to load attendance history.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/attendance" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1.5 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Daily Overview
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Attendance History</h2>
          <p className="text-muted-foreground">Detailed database historical search logs tracker.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold h-10 rounded-xl"
            onClick={() => toast.info("Export to Excel/PDF functionality is coming soon!")}
          >
            <Download className="mr-2 h-4 w-4 text-slate-500" /> Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AttendanceFilters
        departments={departments}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
      />

      {loading ? (
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
          <div className="space-y-4 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between border-b border-slate-100 pb-3 last:border-0">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <AttendanceTable data={records} />

          {/* Pagination Controls */}
          {records.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs text-black mt-4">
              <div className="text-sm text-slate-500 font-medium">
                Showing <span className="font-semibold text-slate-800">{Math.min(totalCount, (page - 1) * pageSize + 1)}</span> to{" "}
                <span className="font-semibold text-slate-800">{Math.min(totalCount, page * pageSize)}</span> of{" "}
                <span className="font-semibold text-slate-800">{totalCount}</span> logs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * pageSize >= totalCount}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
