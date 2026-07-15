"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, History, Palmtree, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LeaveFilters from "@/components/leave/LeaveFilters";
import LeaveTable from "@/components/leave/LeaveTable";
import LeaveCalendar from "@/components/leave/LeaveCalendar";
import LeaveApprovalDialog from "@/components/leave/LeaveApprovalDialog";
import { getLeaveRequests, approveLeave, rejectLeave, getPendingRequests, cancelLeaveRequest } from "@/services/leave.service";
import { getDepartments } from "@/services/employee.service";
import { Card, CardContent } from "@/components/ui/card";
import { LeaveRequest, LeaveFilters as FilterType } from "@/types/leave";
import { Department } from "@/types/employee";

export default function LeaveRequestsPage() {
  const [records, setRecords] = React.useState<LeaveRequest[]>([]);
  const [allApprovedLeaves, setAllApprovedLeaves] = React.useState<LeaveRequest[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [filters, setFilters] = React.useState<FilterType>({});
  const [pendingCount, setPendingCount] = React.useState(0);

  // Pagination states
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const pageSize = 10;

  const handleFilterChange = React.useCallback((newFilters: FilterType) => {
    setFilters((prev) => {
      if (
        prev.search === newFilters.search &&
        prev.departmentId === newFilters.departmentId &&
        prev.leaveTypeId === newFilters.leaveTypeId &&
        prev.status === newFilters.status
      ) {
        return prev;
      }
      return newFilters;
    });
    setPage(1);
  }, []);

  // Decision Modal states
  const [decisionOpen, setDecisionOpen] = React.useState(false);
  const [activeReqId, setActiveReqId] = React.useState<number | null>(null);
  const [activeEmpName, setActiveEmpName] = React.useState("");
  const [decisionLoading, setDecisionLoading] = React.useState(false);

  const loadData = React.useCallback(async (showRefreshingIndicator = false) => {
    if (showRefreshingIndicator) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch leaves for the table, departments, approved logs, and pending counts
      const [leavesRes, deptList, calendarLeavesRes, pendingRes] = await Promise.all([
        getLeaveRequests(filters, page, pageSize),
        getDepartments(),
        getLeaveRequests({}, 1, 100), // retrieve up to 100 leaves for calendar
        getPendingRequests(1, 1) // retrieve count
      ]);

      setRecords(leavesRes.records);
      setTotalCount(leavesRes.totalCount);
      setDepartments(deptList);
      setAllApprovedLeaves(calendarLeavesRes.records);
      setPendingCount(pendingRes.totalCount);
    } catch (e) {
      console.error("Failed to load leaves requests data", e);
      toast.error("Unable to load leaves records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, page]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApproveClick = (id: number, employeeName: string) => {
    setActiveReqId(id);
    setActiveEmpName(employeeName);
    setDecisionOpen(true);
  };

  const handleConfirmDecision = async (status: "Approved" | "Rejected") => {
    if (activeReqId === null) return;
    setDecisionLoading(true);
    try {
      if (status === "Approved") {
        await approveLeave(activeReqId);
      } else {
        await rejectLeave(activeReqId);
      }
      toast.success(`Leave request has been ${status.toLowerCase()} successfully.`);
      toast.info(`Notification: Employee ${activeEmpName || ""} has been notified that their leave request was ${status.toLowerCase()}.`);
      setDecisionOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit leaves action.");
    } finally {
      setDecisionLoading(false);
      setActiveReqId(null);
    }
  };

  const handleCancelClick = async (id: number, employeeName: string) => {
    try {
      await cancelLeaveRequest(id);
      toast.success(`Leave request for ${employeeName} has been cancelled.`);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error("Failed to cancel leave request.");
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
            <Button
              variant="ghost"
              size="icon"
              disabled={loading || refreshing}
              onClick={() => {
                loadData(true);
                toast.success("Leave requests list refreshed.");
              }}
              className="h-8 w-8 hover:bg-slate-100 text-slate-500 rounded-lg mt-1"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <p className="text-muted-foreground">Admin leaves approval trackers and schedules.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/leave/apply">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
              <Plus className="mr-2 h-4 w-4" /> Request Leave
            </Button>
          </Link>
          <Link href="/leave/balance">
            <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 font-medium">
              <History className="mr-2 h-4 w-4" /> Check Balance
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Stats Summary Row */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
            <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-xs">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Requests</p>
                  <p className="text-3xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                  <Palmtree className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters Card */}
          <LeaveFilters
            departments={departments}
            onFilterChange={handleFilterChange}
          />

          {/* Double Column Grid: Logs Table & Calendar Schedule */}
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            {/* Left: Requests Table logs (width 2) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                <Palmtree className="h-5 w-5 text-slate-500" /> Active Requests Logs
              </h3>
              
              <LeaveTable
                data={records}
                onApprove={handleApproveClick}
                onReject={handleApproveClick}
                onCancel={handleCancelClick}
              />

              {/* Pagination controls */}
              {records.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs text-black">
                  <div className="text-sm text-slate-500 font-medium">
                    Showing <span className="font-semibold text-slate-800">{Math.min(totalCount, (page - 1) * pageSize + 1)}</span> to{" "}
                    <span className="font-semibold text-slate-800">{Math.min(totalCount, page * pageSize)}</span> of{" "}
                    <span className="font-semibold text-slate-800">{totalCount}</span> applications
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
            </div>

            {/* Right: Calendar tracker (width 1) */}
            <div className="lg:col-span-1">
              <LeaveCalendar leaves={allApprovedLeaves} />
            </div>
          </div>

          {/* Decision dialogue overlay */}
          <LeaveApprovalDialog
            open={decisionOpen}
            onOpenChange={setDecisionOpen}
            employeeName={activeEmpName}
            onConfirm={handleConfirmDecision}
            loading={decisionLoading}
          />
        </>
      )}
    </div>
  );
}
