import * as React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit2, Trash2 } from "lucide-react";
import EmployeeAvatar from "./EmployeeAvatar";
import { Employee } from "@/types/employee";

interface EmployeeTableProps {
  data: Employee[];
  onDeleteClick: (employee: Employee) => void;
}

export default function EmployeeTable({ data, onDeleteClick }: EmployeeTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden text-black">
      {data.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No employees found matching the filters.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-200">
              <TableHead className="w-[140px]">Employee Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((emp) => (
              <TableRow key={emp.id} className="border-slate-100 hover:bg-slate-50/50">
                {/* Employee Code */}
                <TableCell className="font-semibold text-slate-700 font-mono text-xs">
                  {emp.employee_code}
                </TableCell>

                {/* Name */}
                <TableCell className="font-semibold text-slate-800 text-sm">
                  <div className="flex items-center gap-2.5">
                    <EmployeeAvatar
                      firstName={emp.first_name}
                      lastName={emp.last_name}
                      className="h-8 w-8 text-[10px]"
                    />
                    <span>{emp.first_name} {emp.last_name}</span>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell className="text-slate-600 text-sm">
                  {emp.email}
                </TableCell>

                {/* Department */}
                <TableCell className="text-slate-600 text-sm">
                  {emp.departments?.name || "Unassigned"}
                </TableCell>

                {/* Role */}
                <TableCell className="text-slate-600 text-sm">
                  {emp.role_id === 1 ? "Administrator" : "Regular Employee"}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant={emp.status === "active" ? "default" : "secondary"}
                    className={
                      emp.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                        : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }
                  >
                    {emp.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/employees/${emp.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-50" title="View Profile">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/employees/${emp.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Edit Profile">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteClick(emp)}
                      className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      title="Deactivate Employee"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
