import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Building, User, Award } from "lucide-react";
import EmployeeAvatar from "./EmployeeAvatar";
import { Employee } from "@/types/employee";

interface EmployeeCardProps {
  employee: Employee;
}

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  const joiningDateFormatted = employee.joining_date
    ? new Date(employee.joining_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown Date";

  return (
    <Card className="shadow-xs bg-white border border-slate-200 text-black max-w-2xl overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-100 p-6 flex flex-row items-center gap-4">
        <EmployeeAvatar
          firstName={employee.first_name}
          lastName={employee.last_name}
          className="h-16 w-16 text-lg shrink-0"
        />
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-slate-800">
            {employee.first_name} {employee.last_name}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
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
      </CardHeader>
      <CardContent className="p-6 grid gap-6 sm:grid-cols-2">
        {/* Designation */}
        <div className="flex items-start gap-3">
          <Award className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Designation</p>
            <p className="text-sm font-medium text-slate-800">{employee.designation || "No Designation"}</p>
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

        {/* Department */}
        <div className="flex items-start gap-3">
          <Building className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</p>
            <p className="text-sm font-medium text-slate-800">
              {employee.departments?.name || "Unassigned"}
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
      </CardContent>
    </Card>
  );
}
