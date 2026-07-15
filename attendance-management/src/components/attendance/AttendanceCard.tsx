"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Attendance } from "@/types/attendance";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";

interface AttendanceCardProps {
  record: Attendance;
}

export default function AttendanceCard({ record }: AttendanceCardProps) {
  const emp = record.employees;
  const name = emp ? `${emp.first_name} ${emp.last_name}` : "Unknown Employee";
  const designation = emp?.designation || "No Designation";
  const code = emp?.employee_code || "EMP--";

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "--:--";
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "--:--";
    }
  };

  const getStatusDetails = (status: string) => {
    const key = status.toLowerCase();
    if (key === "on time" || key === "present") {
      return {
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      };
    }
    if (key === "late") {
      return {
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
      };
    }
    return {
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
    };
  };

  const details = getStatusDetails(record.status);

  return (
    <Card className="border border-slate-200 bg-white overflow-hidden shadow-xs">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center gap-4 space-y-0">
        <EmployeeAvatar
          firstName={emp?.first_name || ""}
          lastName={emp?.last_name || ""}
          className="h-12 w-12"
        />
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base font-bold text-slate-800 truncate">{name}</CardTitle>
          <p className="text-xs text-slate-500 font-medium truncate">{designation} • {code}</p>
        </div>
        <Badge className={`${details.badgeClass} border font-medium text-xs`}>
          {record.status}
        </Badge>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Check In</p>
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
              <Clock className="h-4 w-4 text-slate-400" />
              {formatTime(record.check_in)}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Check Out</p>
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
              <Clock className="h-4 w-4 text-slate-400" />
              {formatTime(record.check_out)}
            </div>
          </div>
          <div className="space-y-1 border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Shift</p>
            <div className="text-slate-800 font-bold text-sm mt-1">
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[11px] font-bold">
                {record.shift_name || "Regular Day Shift"}
              </span>
            </div>
          </div>
          <div className="space-y-1 border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overtime</p>
            <div className="text-slate-800 font-bold text-sm mt-1">
              {record.overtime_hours && record.overtime_hours > 0 ? (
                <span className="text-emerald-600 font-bold">+{record.overtime_hours} hrs</span>
              ) : (
                <span className="text-slate-400 font-normal text-xs">--</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
