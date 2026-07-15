"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Attendance } from "@/types/attendance";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface AttendanceTableProps {
  data: Attendance[];
}

export default function AttendanceTable({ data }: AttendanceTableProps) {
  const formatTime = (isoString: string | null) => {
    if (!isoString) return "--";
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "--";
    }
  };

  const calculateHours = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "--";
    try {
      const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours > 0 ? `${diffHours.toFixed(1)}h` : "0.0h";
    } catch {
      return "--";
    }
  };

  const getStatusBadge = (status: string) => {
    const key = status.toLowerCase();
    if (key === "on time" || key === "present") {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-xs font-medium">
          {status}
        </Badge>
      );
    }
    if (key === "late") {
      return (
        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50 text-xs font-medium">
          Late
        </Badge>
      );
    }
    if (key === "on leave") {
      return (
        <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-50 text-xs font-medium">
          On Leave
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-50 text-xs font-medium">
        Absent
      </Badge>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-slate-200 bg-slate-50/50">
            <TableHead className="font-semibold text-slate-500">Employee</TableHead>
            <TableHead className="font-semibold text-slate-500">Code</TableHead>
            <TableHead className="font-semibold text-slate-500">Department</TableHead>
            <TableHead className="font-semibold text-slate-500">Date</TableHead>
            <TableHead className="font-semibold text-slate-500">Check In</TableHead>
            <TableHead className="font-semibold text-slate-500">Check Out</TableHead>
            <TableHead className="font-semibold text-slate-500">Hours</TableHead>
            <TableHead className="font-semibold text-slate-500">Overtime</TableHead>
            <TableHead className="font-semibold text-slate-500">Shift</TableHead>
            <TableHead className="font-semibold text-slate-500">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-500">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-12 text-slate-400 font-medium">
                No attendance logs found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((record) => {
              const emp = record.employees;
              const name = emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
              const email = emp?.email || "--";
              const code = emp?.employee_code || "--";
              const department = emp?.departments?.name || "Unassigned";

              return (
                <TableRow key={record.id} className="border-slate-100 hover:bg-slate-50/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar
                        firstName={emp?.first_name || ""}
                        lastName={emp?.last_name || ""}
                        className="h-10 w-10 text-sm"
                      />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{name}</p>
                        <p className="text-xs text-slate-400 font-medium">{email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-600 text-sm">{code}</TableCell>
                  <TableCell className="text-slate-600 text-sm font-medium">{department}</TableCell>
                  <TableCell className="text-slate-600 text-sm">{formatDate(record.check_in || "")}</TableCell>
                  <TableCell className="text-slate-600 text-sm font-semibold">{formatTime(record.check_in)}</TableCell>
                  <TableCell className="text-slate-600 text-sm font-semibold">{formatTime(record.check_out)}</TableCell>
                  <TableCell className="text-slate-600 text-sm font-medium">
                    {calculateHours(record.check_in || "", record.check_out)}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm font-semibold">
                    {record.overtime_hours && record.overtime_hours > 0 ? (
                      <span className="text-emerald-600 font-bold">+{record.overtime_hours} hrs</span>
                    ) : (
                      <span className="text-slate-400 font-normal">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm font-semibold">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[11px] font-bold">
                      {record.shift_name || "Regular Day Shift"}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/attendance/${record.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-slate-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
