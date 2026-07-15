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
import { Search, Calendar, Building2 } from "lucide-react";
import { Department } from "@/types/employee";

interface ReportFiltersProps {
  departments: Department[];
  showDate?: boolean;
  showDateRange?: boolean;
  showStatus?: boolean;
  statusList?: { value: string; label: string }[];
  onFilterChange: (filters: {
    date?: string;
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    search?: string;
    status?: string;
  }) => void;
}

export default function ReportFilters({
  departments,
  showDate = false,
  showDateRange = false,
  showStatus = false,
  statusList = [],
  onFilterChange,
}: ReportFiltersProps) {
  const [search, setSearch] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");
  const [status, setStatus] = React.useState("");

  const handleApply = React.useCallback(() => {
    onFilterChange({
      search: search.trim() || undefined,
      date: showDate ? date : undefined,
      startDate: showDateRange ? startDate || undefined : undefined,
      endDate: showDateRange ? endDate || undefined : undefined,
      departmentId: departmentId === "all" ? undefined : departmentId || undefined,
      status: status === "all" ? undefined : status || undefined,
    });
  }, [search, date, startDate, endDate, departmentId, status, showDate, showDateRange, onFilterChange]);

  React.useEffect(() => {
    handleApply();
  }, [date, startDate, endDate, departmentId, status, handleApply]);

  const handleReset = () => {
    setSearch("");
    setDate(new Date().toISOString().split("T")[0]);
    setStartDate("");
    setEndDate("");
    setDepartmentId("");
    setStatus("");
    onFilterChange({});
  };

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4 text-black">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 items-end">
        {/* Search */}
        <div className="space-y-1.5 md:col-span-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Search className="h-3.5 w-3.5 text-slate-400" /> Search Employee
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

        {/* Date Selector */}
        {showDate && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /> Selected Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium"
            />
          </div>
        )}

        {/* Date Ranges */}
        {showDateRange && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium"
              />
            </div>
          </>
        )}

        {/* Department */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-slate-400" /> Department
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

        {/* Status */}
        {showStatus && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              Status
            </label>
            <Select value={status} onValueChange={(val) => setStatus(val || "")}>
              <SelectTrigger className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                {statusList.map((st) => (
                  <SelectItem key={st.value} value={st.value}>
                    {st.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Actions */}
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
            className="border-slate-200/80 hover:bg-slate-50 text-slate-600 rounded-xl h-10 px-4"
            title="Reset Filters"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
