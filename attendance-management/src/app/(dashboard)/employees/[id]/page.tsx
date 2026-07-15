"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Mail, Phone, Calendar, Building, User, Clock, CheckCircle2, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";
import {
  getEmployeeById,
  getEmployeeAttendanceSummary,
  getEmployeeLeaveSummary,
  getEmployeeRecentAttendance,
  AttendanceSummary,
  LeaveSummary,
  EmployeeRecentAttendanceRecord,
} from "@/services/employee.service";
import { Employee } from "@/types/employee";

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = React.useState<Employee | null>(null);
  const [attendanceSummary, setAttendanceSummary] = React.useState<AttendanceSummary | null>(null);
  const [leaveSummary, setLeaveSummary] = React.useState<LeaveSummary | null>(null);
  const [recentAttendance, setRecentAttendance] = React.useState<EmployeeRecentAttendanceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  const idStr = params.id as string;
  const id = parseInt(idStr, 10);

  React.useEffect(() => {
    async function loadEmployee() {
      if (isNaN(id)) {
        toast.error("Invalid Employee ID.");
        router.push("/employees");
        return;
      }
      try {
        const [empData, attData, leaveData, recentData] = await Promise.all([
          getEmployeeById(id),
          getEmployeeAttendanceSummary(id),
          getEmployeeLeaveSummary(id),
          getEmployeeRecentAttendance(id),
        ]);
        if (!empData) {
          toast.error("Employee not found.");
          router.push("/employees");
          return;
        }
        setEmployee(empData);
        setAttendanceSummary(attData);
        setLeaveSummary(leaveData);
        setRecentAttendance(recentData);
      } catch (e) {
        console.error("Failed to load employee details", e);
        toast.error("Unable to load employee profile.");
      } finally {
        setLoading(false);
      }
    }
    loadEmployee();
  }, [id, router]);

  const joiningDateFormatted = employee?.joining_date
    ? new Date(employee.joining_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown Date";

  return (
    <div className="space-y-6 text-black">
      {/* Breadcrumbs */}
      <div>
        <Link href="/employees" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1.5 mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to Employees
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Employee Profile</h2>
            <p className="text-muted-foreground">Detailed database profile statistics.</p>
          </div>
          {employee && (
            <div>
              <Link href={`/employees/${employee.id}/edit`}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <div className="p-6 grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        employee && (
          <div className="space-y-6">
            {/* Profile Overview Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-col sm:flex-row items-center gap-5">
                <EmployeeAvatar
                  firstName={employee.first_name}
                  lastName={employee.last_name}
                  className="h-20 w-20 text-2xl shrink-0 border-2 border-white shadow-sm"
                />
                <div className="text-center sm:text-left space-y-1">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {employee.first_name} {employee.last_name}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {employee.designation || "No Designation"} • {employee.departments?.name || "Unassigned Department"}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-2">
                    <Badge
                      variant={employee.status === "active" ? "default" : "secondary"}
                      className={
                        employee.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-xs font-semibold"
                          : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-semibold"
                      }
                    >
                      {employee.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-slate-300 text-sm">|</span>
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      Code: {employee.employee_code}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-medium text-slate-800 break-all">{employee.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</p>
                    <p className="text-sm font-medium text-slate-800">{employee.phone || "--"}</p>
                  </div>
                </div>

                {/* System Role */}
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Role</p>
                    <p className="text-sm font-medium text-slate-800">
                      {employee.role_id === 1 ? "Administrator" : "Regular Employee"}
                    </p>
                  </div>
                </div>

                {/* Shift */}
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shift Schedule</p>
                    <p className="text-sm font-medium text-slate-800">
                      {employee.shifts ? (
                        `${employee.shifts.name} (${employee.shifts.start_time.substring(0, 5)} - ${employee.shifts.end_time.substring(0, 5)})`
                      ) : (
                        "Morning Shift (09:00 - 17:00)"
                      )}
                    </p>
                  </div>
                </div>

                {/* Joining Date */}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Joining Date</p>
                    <p className="text-sm font-medium text-slate-800">{joiningDateFormatted}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summaries Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Attendance Summary */}
              <Card className="shadow-xs border border-slate-200 bg-white p-6">
                <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold text-slate-800">Attendance Summary</CardTitle>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </CardHeader>
                <CardContent className="p-0 pt-6 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Rate</p>
                    <p className="text-2xl font-extrabold text-blue-600 mt-1">{attendanceSummary?.attendanceRate}%</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Present Days</p>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{attendanceSummary?.presentDays}d</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Late Days</p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">{attendanceSummary?.lateDays}d</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hours Worked</p>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{attendanceSummary?.totalHours}h</p>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Summary */}
              <Card className="shadow-xs border border-slate-200 bg-white p-6">
                <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold text-slate-800">Leave Summary</CardTitle>
                  <Hourglass className="h-5 w-5 text-indigo-500" />
                </CardHeader>
                <CardContent className="p-0 pt-6 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Balance</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">{leaveSummary?.totalBalance}d</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Leave</p>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{leaveSummary?.approvedDays}d</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Requests</p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">{leaveSummary?.pendingDays}d</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejected Requests</p>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{leaveSummary?.rejectedDays}d</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Attendance Log */}
            <Card className="shadow-xs border border-slate-200 bg-white p-6">
              <CardHeader className="p-0 pb-4 border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-800">Recent Attendance Logs</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-200">
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours Worked</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAttendance.map((record) => (
                      <TableRow key={record.id} className="border-slate-100 hover:bg-slate-50/50">
                        <TableCell className="font-semibold text-slate-700 text-sm">{record.date}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{record.checkIn}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{record.checkOut}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{record.hours}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            className={
                              record.status.toLowerCase() === "on time" || record.status.toLowerCase() === "present"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-xs"
                                : record.status.toLowerCase() === "late"
                                ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50 text-xs"
                                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-50 text-xs"
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )
      )}
    </div>
  );
}
