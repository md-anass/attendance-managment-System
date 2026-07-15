"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEmployees } from "@/services/employee.service";
import {
  getDailyAttendance,
  checkInEmployee,
  checkOutEmployee,
} from "@/services/attendance.service";
import { Employee } from "@/types/employee";
import { Attendance } from "@/types/attendance";
import CheckInButton from "@/components/attendance/CheckInButton";
import CheckOutButton from "@/components/attendance/CheckOutButton";

export default function CheckInConsolePage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = React.useState("");
  const [todayLogs, setTodayLogs] = React.useState<Attendance[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  const todayStr = React.useMemo(() => new Date().toISOString().split("T")[0], []);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = React.useCallback(async () => {
    try {
      const [empData, logsData] = await Promise.all([
        getEmployees({ status: "active" }),
        getDailyAttendance(todayStr),
      ]);
      setEmployees(empData.employees);
      setTodayLogs(logsData);
    } catch (e) {
      console.error("Failed to load checkin data", e);
      toast.error("Could not load database records.");
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const activeRecord = React.useMemo(() => {
    if (!selectedEmpId) return null;
    return todayLogs.find((r) => r.employee_id === Number(selectedEmpId)) || null;
  }, [selectedEmpId, todayLogs]);



  const selectedEmp = React.useMemo(() => {
    return employees.find((e) => e.id === Number(selectedEmpId)) || null;
  }, [selectedEmpId, employees]);

  return (
    <div className="space-y-6 text-black">
      {/* Back button */}
      <div>
        <Link href="/attendance" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1.5 mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Time Console</h2>
        <p className="text-muted-foreground">Register daily worked hours here.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
        {/* Real-time Clock Card */}
        <Card className="border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between min-h-[220px]">
          <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live Time Clock</CardTitle>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="p-0 pt-6 flex-1 flex flex-col justify-center text-center">
            <h1 className="text-5xl font-extrabold text-slate-800 tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </h1>
            <p className="text-sm text-slate-400 font-semibold mt-2">
              {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </CardContent>
        </Card>

        {/* Action Panel Card */}
        <Card className="border border-slate-200 bg-white p-6 shadow-xs min-h-[220px]">
          <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">Register Time</CardTitle>
            <UserCheck className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-0 pt-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Employee</label>
              <Select value={selectedEmpId} onValueChange={(val) => setSelectedEmpId(val || "")} disabled={loading}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder={loading ? "Loading employees..." : "Choose your name"} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.first_name} {emp.last_name} ({emp.employee_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEmp && (
              <div className="flex flex-col gap-3 pt-2">
                {!activeRecord ? (
                   <div className="flex flex-col gap-2">
                     <p className="text-xs font-semibold text-slate-400">STATUS: NOT YET CHECKED IN</p>
                     <CheckInButton employeeId={Number(selectedEmpId)} onSuccess={loadData} />
                   </div>
                ) : !activeRecord.check_out ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-amber-600 font-bold">
                      STATUS: CHECKED IN AT {new Date(activeRecord.check_in || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({activeRecord.status})
                    </p>
                     <CheckOutButton attendanceId={activeRecord.id} onSuccess={loadData} />
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-emerald-800">
                      Already Checked Out Today
                    </p>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">
                      Check-in: {new Date(activeRecord.check_in || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Checkout: {new Date(activeRecord.check_out || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
