"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Department } from "@/types/employee";
import { LeaveFilters as FilterType } from "@/types/leave";
import { Search, RotateCcw, Building2, Layers, CheckCircle2 } from "lucide-react";

interface LeaveFiltersProps {
  departments: Department[];
  onFilterChange: (filters: FilterType) => void;
}

export default function LeaveFilters({ departments, onFilterChange }: LeaveFiltersProps) {
  const [search, setSearch] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");
  const [leaveTypeId, setLeaveTypeId] = React.useState("");
  const [status, setStatus] = React.useState("");

  const handleApply = React.useCallback(() => {
    onFilterChange({
      search: search.trim() || undefined,
      departmentId: departmentId === "all" ? undefined : departmentId || undefined,
      leaveTypeId: leaveTypeId === "all" ? undefined : leaveTypeId || undefined,
      status: status === "all" ? undefined : status || undefined,
    });
  }, [search, departmentId, leaveTypeId, status, onFilterChange]);

  React.useEffect(() => {
    handleApply();
  }, [departmentId, leaveTypeId, status, handleApply]);

  const handleReset = () => {
    setSearch("");
    setDepartmentId("");
    setLeaveTypeId("");
    setStatus("");
    onFilterChange({});
  };

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4 text-black">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 items-end">
        {/* Search */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Search className="h-3.5 w-3.5" /> Search Employee
          </label>
          <Input
            type="text"
            placeholder="Name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium"
          />
        </div>

        {/* Department */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" /> Department
          </label>
          <Select value={departmentId} onValueChange={(val) => setDepartmentId(val || "")}>
            <SelectTrigger className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={String(dept.id)}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Leave Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" /> Leave Type
          </label>
          <Select value={leaveTypeId} onValueChange={(val) => setLeaveTypeId(val || "")}>
            <SelectTrigger className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="1">Annual Leave</SelectItem>
              <SelectItem value="2">Sick Leave</SelectItem>
              <SelectItem value="3">Casual Leave</SelectItem>
              <SelectItem value="4">Maternity Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Status
          </label>
          <Select value={status} onValueChange={(val) => setStatus(val || "")}>
            <SelectTrigger className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleApply}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-10 shadow-xs transition-transform transform active:scale-95 text-sm"
          >
            Search
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-slate-200/80 hover:bg-slate-50 text-slate-600 rounded-xl h-10 px-3 group"
            title="Reset Filters"
          >
            <RotateCcw className="h-4.5 w-4.5 group-hover:-rotate-180 transition-transform duration-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
