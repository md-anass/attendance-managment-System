"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarRange, User, ShieldCheck, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import AttendanceCard from "@/components/attendance/AttendanceCard";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import { getAttendanceRecordById } from "@/services/attendance.service";
import { Attendance } from "@/types/attendance";

export default function AttendanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = React.useState<Attendance | null>(null);
  const [loading, setLoading] = React.useState(true);

  const idStr = params.id as string;
  const id = parseInt(idStr, 10);

  React.useEffect(() => {
    async function loadRecord() {
      if (isNaN(id)) {
        toast.error("Invalid Log ID.");
        router.push("/attendance");
        return;
      }
      try {
        const data = await getAttendanceRecordById(id);
        if (!data) {
          toast.error("Attendance log not found.");
          router.push("/attendance");
          return;
        }
        setRecord(data);
      } catch (e) {
        console.error("Failed to load attendance details", e);
        toast.error("Unable to load details.");
      } finally {
        setLoading(false);
      }
    }
    loadRecord();
  }, [id, router]);

  const shift = record?.employees?.shifts;
  const shiftStartTime = shift?.start_time || null;
  const shiftEndTime = shift?.end_time || null;

  // Format 24h shift times to clean 12h AM/PM strings
  const formatShiftTime = (timeStr: string | null) => {
    if (!timeStr) return "--:--";
    try {
      const [hours, minutes] = timeStr.split(":");
      const h = parseInt(hours, 10);
      const m = parseInt(minutes, 10);
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 || 12;
      const displayM = m < 10 ? `0${m}` : m;
      return `${displayH}:${displayM} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  // Compute Late Minutes (if check-in is after shift start)
  const lateMinutes = React.useMemo(() => {
    if (!record?.check_in || !shiftStartTime) return 0;
    try {
      const checkInDate = new Date(record.check_in);
      const [sHours, sMinutes, sSeconds] = shiftStartTime.split(":").map(Number);
      
      const shiftDate = new Date(checkInDate);
      shiftDate.setHours(sHours, sMinutes, sSeconds || 0, 0);
      
      const diffMs = checkInDate.getTime() - shiftDate.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins > 0 ? diffMins : 0;
    } catch {
      return 0;
    }
  }, [record?.check_in, shiftStartTime]);

  // Compute Overtime (working hours - standard shift duration hours)
  const overtimeHours = React.useMemo(() => {
    if (!shiftStartTime || !shiftEndTime || !record?.working_hours) return 0;
    try {
      const [startH, startM] = shiftStartTime.split(":").map(Number);
      const [endH, endM] = shiftEndTime.split(":").map(Number);
      
      let shiftDurationHrs = endH - startH + (endM - startM) / 60;
      if (shiftDurationHrs < 0) {
        shiftDurationHrs += 24; // Handles overnight shifts
      }
      
      const overtime = record.working_hours - shiftDurationHrs;
      return overtime > 0 ? Math.round(overtime * 10) / 10 : 0;
    } catch {
      return 0;
    }
  }, [record?.working_hours, shiftStartTime, shiftEndTime]);

  return (
    <div className="space-y-6 text-black">
      {/* Title Header */}
      <div>
        <Link href="/attendance" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1.5 mb-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Attendance Log Details</h2>
        <p className="text-muted-foreground">Comprehensive timing audit and history.</p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-1 rounded-2xl" />
          <Skeleton className="h-96 md:col-span-2 rounded-2xl" />
        </div>
      ) : (
        record && (
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            {/* Left Column: Core Profile card & Shift Allocation card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-4.5 w-4.5 text-slate-400" /> Core Profile Card
                </h3>
                <AttendanceCard record={record} />
              </div>

              {/* Shift Information Card */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-slate-400" /> Shift Allocation
                </h3>
                <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-xs">
                  <CardContent className="p-0 space-y-3.5">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Shift Name</span>
                      <span className="text-sm font-bold text-slate-800">{shift?.name || "Standard Shift"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Shift Hours</span>
                      <span className="text-sm font-bold text-slate-800">
                        {formatShiftTime(shiftStartTime)} - {formatShiftTime(shiftEndTime)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Log Date</span>
                      <span className="text-sm font-bold text-slate-800">
                        {record.check_in ? new Date(record.check_in).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column: Calculations Cards, Remarks & Calendar */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-4.5 w-4.5 text-slate-400" /> Session Audit Calculations
                </h3>

                {/* Grid for calculations */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  {/* Working Hours */}
                  <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-xs">
                    <CardContent className="p-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Working Hours</p>
                      <p className="text-2xl font-extrabold text-slate-800 mt-2">{record.working_hours.toFixed(1)} hrs</p>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (record.working_hours / 8) * 100)}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Late Minutes */}
                  <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-xs">
                    <CardContent className="p-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Late Minutes</p>
                      <p className={`text-2xl font-extrabold mt-2 ${lateMinutes > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                        {lateMinutes} min
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2 font-medium">
                        {lateMinutes > 0 ? `Arrived ${lateMinutes}m after start.` : "Arrived on time / early."}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Overtime */}
                  <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-xs">
                    <CardContent className="p-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overtime</p>
                      <p className={`text-2xl font-extrabold mt-2 ${overtimeHours > 0 ? "text-indigo-600" : "text-slate-500"}`}>
                        {overtimeHours.toFixed(1)} hrs
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2 font-medium">
                        {overtimeHours > 0 ? `${overtimeHours} hours extra worked.` : "No overtime registered."}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Remarks & Notes */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-4.5 w-4.5 text-slate-400" /> Audit Remarks
                  </h3>
                  <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-xs">
                    <CardContent className="p-0">
                      <p className="text-sm font-medium text-slate-600 italic bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                        {record.remarks || "No check-in comments or administrative remarks provided for this session."}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Month Calendar Tracker */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarRange className="h-4.5 w-4.5 text-slate-400" /> Month Tracker Calendar
                </h3>
                <AttendanceCalendar employeeId={record.employee_id} />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
