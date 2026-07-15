"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, FileText, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";
import LeaveStatusBadge from "@/components/leave/LeaveStatusBadge";
import { getLeaveRequestById, approveLeave, rejectLeave, LEAVE_TYPE_MAP } from "@/services/leave.service";
import { LeaveRequest } from "@/types/leave";

export default function LeaveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = React.useState<LeaveRequest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);

  const idStr = params.id as string;
  const id = parseInt(idStr, 10);

  const loadRecord = React.useCallback(async () => {
    if (isNaN(id)) {
      toast.error("Invalid Request ID.");
      router.push("/leave");
      return;
    }
    try {
      const data = await getLeaveRequestById(id);
      if (!data) {
        toast.error("Leave request not found.");
        router.push("/leave");
        return;
      }
      setRecord(data);
    } catch (e) {
      console.error("Failed to load leave details", e);
      toast.error("Unable to load details.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  React.useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  const handleDecision = async (status: "Approved" | "Rejected") => {
    setUpdating(true);
    try {
      if (status === "Approved") {
        await approveLeave(id);
      } else {
        await rejectLeave(id);
      }
      toast.success(`Leave request ${status.toLowerCase()} successfully!`);
      const empName = record?.employees ? `${record.employees.first_name} ${record.employees.last_name}` : "Employee";
      toast.info(`Notification: Employee ${empName} has been notified that their leave request was ${status.toLowerCase()}.`);
      await loadRecord();
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to submit leaves action.");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const emp = record?.employees;
  const name = emp ? `${emp.first_name} ${emp.last_name}` : "Unknown Employee";
  const typeLabel = record ? LEAVE_TYPE_MAP[record.leave_type_id] || "Other Leave" : "Other Leave";

  return (
    <div className="space-y-6 text-black font-sans">
      {/* Title */}
      <div>
        <Link href="/leave" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1.5 mb-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Leave dashboard
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Request Details</h2>
        <p className="text-muted-foreground">Detailed leave application status and records audit.</p>
      </div>

      {loading ? (
        <div className="max-w-3xl space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        record && (
          <div className="max-w-3xl space-y-6">
            {/* Core Applicant details */}
            <Card className="border border-slate-200 bg-white overflow-hidden shadow-xs rounded-2xl">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-5 justify-between">
                <div className="flex items-center gap-4">
                  <EmployeeAvatar
                    firstName={emp?.first_name || ""}
                    lastName={emp?.last_name || ""}
                    className="h-14 w-14 text-lg"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{name}</h3>
                    <p className="text-sm text-slate-500 font-medium">
                      {emp?.designation || "No Designation"} • {emp?.employee_code || "EMP--"}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">{emp?.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Status</span>
                  <LeaveStatusBadge status={record.status} />
                </div>
              </CardContent>
            </Card>

            {/* Leave Details Cards */}
            <Card className="border border-slate-200 bg-white p-6 shadow-xs rounded-2xl space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Leave type & duration */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <Calendar className="h-4 w-4 text-slate-400" /> Date & Category
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Leave Category:</span>
                      <span className="font-bold text-slate-800">{typeLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Start Date:</span>
                      <span className="font-semibold text-slate-700">{formatDate(record.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">End Date:</span>
                      <span className="font-semibold text-slate-700">{formatDate(record.end_date)}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-100 pt-2 font-semibold">
                      <span className="text-slate-500">Total Duration:</span>
                      <span className="text-blue-600 font-bold">{record.total_days} {record.total_days === 1 ? "day" : "days"}</span>
                    </div>
                  </div>
                </div>

                {/* Audit trail */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <User className="h-4 w-4 text-slate-400" /> Administrative Log
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Submission Date:</span>
                      <span className="font-medium text-slate-600">
                        {new Date(record.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Log Reference ID:</span>
                      <span className="font-mono text-xs font-bold text-slate-700">#REQ-{record.id.toString().padStart(4, "0")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statement of reason */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <FileText className="h-4 w-4 text-slate-400" /> Statement of Reason
                </h4>
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 text-sm text-slate-600 font-medium leading-relaxed italic">
                  {record.reason || "No written statement was provided with this application."}
                </div>
              </div>

              {/* Administrative actions */}
              {record.status === "Pending" && (
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 justify-end">
                  <Button
                    variant="outline"
                    disabled={updating}
                    onClick={() => handleDecision("Rejected")}
                    className="border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 font-bold h-11 px-6 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="h-4 w-4" /> Reject Request
                  </Button>
                  <Button
                    disabled={updating}
                    onClick={() => handleDecision("Approved")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-transform transform active:scale-98"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve Leave
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )
      )}
    </div>
  );
}
