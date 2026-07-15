"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, Check, X, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LeaveRequest } from "@/types/leave";
import { LEAVE_TYPE_MAP } from "@/services/leave.service";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";
import LeaveStatusBadge from "./LeaveStatusBadge";

interface LeaveTableProps {
  data: LeaveRequest[];
  onApprove?: (id: number, employeeName: string) => void;
  onReject?: (id: number, employeeName: string) => void;
  onCancel?: (id: number, employeeName: string) => void;
}

export default function LeaveTable({ data, onApprove, onReject, onCancel }: LeaveTableProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-black">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-slate-200 bg-slate-50/50">
            <TableHead className="font-semibold text-slate-500">Employee</TableHead>
            <TableHead className="font-semibold text-slate-500">Leave Type</TableHead>
            <TableHead className="font-semibold text-slate-500">Start</TableHead>
            <TableHead className="font-semibold text-slate-500">End</TableHead>
            <TableHead className="font-semibold text-slate-500">Days</TableHead>
            <TableHead className="font-semibold text-slate-500">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-500">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                No leave requests found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((record) => {
              const emp = record.employees;
              const name = emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
              const designation = emp?.designation || "--";
              const code = emp?.employee_code || "--";
              const typeName = LEAVE_TYPE_MAP[record.leave_type_id] || "Other Leave";

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
                        <p className="text-xs text-slate-400 font-medium">{designation} • {code}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-700 text-sm">{typeName}</TableCell>
                  <TableCell className="text-slate-600 text-sm font-medium">
                    {formatDate(record.start_date)}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm font-medium">
                    {formatDate(record.end_date)}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm font-semibold">
                    {record.total_days} {record.total_days === 1 ? "day" : "days"}
                  </TableCell>
                  <TableCell>
                    <LeaveStatusBadge status={record.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/leave/${record.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-slate-600" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {record.status === "Pending" && onApprove && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onApprove(record.id, name)}
                          className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500"
                          title="Approve Leave"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {record.status === "Pending" && onReject && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReject(record.id, name)}
                          className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600 text-slate-500"
                          title="Reject Leave"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {record.status === "Pending" && onCancel && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onCancel(record.id, name)}
                          className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600 text-slate-500"
                          title="Cancel Leave"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
