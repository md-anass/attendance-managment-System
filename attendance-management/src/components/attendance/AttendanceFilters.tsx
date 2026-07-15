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
import { Department, Employee } from "@/types/employee";
import { AttendanceFilters as FilterType } from "@/types/attendance";
import { getEmployees } from "@/services/employee.service";
import { Search, RotateCcw, Building2, User, CheckCircle2, Calendar } from "lucide-react";

interface AttendanceFiltersProps {
  departments: Department[];
  onFilterChange: (filters: FilterType) => void;
  hideDate?: boolean;
}

export default function AttendanceFilters({
  departments,
  onFilterChange,
  hideDate = false,
}: AttendanceFiltersProps) {
  const [search, setSearch] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");
  const [employeeId, setEmployeeId] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [employees, setEmployees] = React.useState<Employee[]>([]);

  // Fetch employees on component mount
  React.useEffect(() => {
    let active = true;
    async function loadEmployees() {
      try {
        const response = await getEmployees({ pageSize: 150 });
        if (active) {
          setEmployees(response.employees);
        }
      } catch (err) {
        console.error("Failed to load employees for filters:", err);
      }
    }
    loadEmployees();
    return () => {
      active = false;
    };
  }, []);

  // Filter employees options based on selected department
  const filteredEmployees = React.useMemo(() => {
    if (!departmentId || departmentId === "all") return employees;
    return employees.filter((emp) => emp.department_id === Number(departmentId));
  }, [employees, departmentId]);

  // Reset employee filter if the selected employee is no longer in the filtered department list
  React.useEffect(() => {
    if (employeeId && employeeId !== "all") {
      const exists = filteredEmployees.some((emp) => String(emp.id) === String(employeeId));
      if (!exists) {
        setEmployeeId("");
      }
    }
  }, [departmentId, filteredEmployees, employeeId]);

  const handleApply = React.useCallback(() => {
    onFilterChange({
      search: search.trim() || undefined,
      startDate: hideDate ? undefined : startDate || undefined,
      endDate: hideDate ? undefined : endDate || undefined,
      departmentId: departmentId === "all" ? undefined : departmentId || undefined,
      employeeId: employeeId === "all" ? undefined : employeeId || undefined,
      status: status === "all" ? undefined : status || undefined,
    });
  }, [search, startDate, endDate, departmentId, employeeId, status, onFilterChange, hideDate]);

  // Reactively apply dropdown and date filters automatically when they change
  React.useEffect(() => {
    handleApply();
  }, [startDate, endDate, departmentId, employeeId, status, handleApply]);

  const handleReset = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setDepartmentId("");
    setEmployeeId("");
    setStatus("");
    onFilterChange({});
  };

  return (
    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-5 text-black">
      {/* Row 1: Search */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-slate-400" /> Search Employee
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by employee name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            className="pl-11 h-11 rounded-xl border-slate-200/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/30 text-sm font-medium"
          />
        </div>
      </div>

      {/* Row 2: Select Filters */}
      <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${hideDate ? "lg:grid-cols-3" : "lg:grid-cols-5"}`}>
        {/* Department Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
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

        {/* Employee Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" /> Employee
          </label>
          <Select value={employeeId} onValueChange={(val) => setEmployeeId(val || "")}>
            <SelectTrigger className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Employees</SelectItem>
              {filteredEmployees.map((emp) => (
                <SelectItem key={emp.id} value={String(emp.id)}>
                  {emp.first_name} {emp.last_name} ({emp.employee_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" /> Status
          </label>
          <Select value={status} onValueChange={(val) => setStatus(val || "")}>
            <SelectTrigger className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Present">Present</SelectItem>
              <SelectItem value="Absent">Absent</SelectItem>
              <SelectItem value="Late">Late</SelectItem>
              <SelectItem value="Leave">Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Picker Start */}
        {!hideDate && (
          <>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium"
              />
            </div>

            {/* Date Picker End */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
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
      </div>

      {/* Row 3: Action Buttons */}
      <div className="flex justify-end items-center gap-3 pt-1">
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-slate-200/80 hover:bg-slate-50 text-slate-600 font-semibold h-10 px-4 rounded-xl group transition-all text-sm"
        >
          <RotateCcw className="h-4 w-4 mr-2 group-hover:-rotate-180 transition-transform duration-500" />
          Reset
        </Button>
        <Button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-6 rounded-xl shadow-xs transition-all duration-200 transform hover:scale-[1.01] text-sm"
        >
          Search
        </Button>
      </div>
    </div>
  );
}
