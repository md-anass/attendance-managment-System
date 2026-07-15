import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import { Department, Role } from "@/types/employee";

interface EmployeeFiltersProps {
  departments: Department[];
  roles: Role[];
  onFilterChange: (filters: { search: string; departmentId: string; roleId: string; status: string }) => void;
}

export default function EmployeeFilters({ departments, roles, onFilterChange }: EmployeeFiltersProps) {
  const [search, setSearch] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("all");
  const [roleId, setRoleId] = React.useState("all");
  const [status, setStatus] = React.useState("all");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    triggerChange({ search: value, departmentId, roleId, status });
  };

  const handleDeptChange = (value: string) => {
    setDepartmentId(value);
    triggerChange({ search, departmentId: value, roleId, status });
  };

  const handleRoleChange = (value: string) => {
    setRoleId(value);
    triggerChange({ search, departmentId, roleId: value, status });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    triggerChange({ search, departmentId, roleId, status: value });
  };

  const triggerChange = (curr: { search: string; departmentId: string; roleId: string; status: string }) => {
    onFilterChange({
      search: curr.search,
      departmentId: curr.departmentId === "all" ? "" : curr.departmentId,
      roleId: curr.roleId === "all" ? "" : curr.roleId,
      status: curr.status === "all" ? "" : curr.status,
    });
  };

  const handleReset = () => {
    setSearch("");
    setDepartmentId("all");
    setRoleId("all");
    setStatus("all");
    onFilterChange({ search: "", departmentId: "", roleId: "", status: "" });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-black">
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name or employee code..."
          value={search}
          onChange={handleSearchChange}
          className="pl-9 h-10 border-slate-200 focus-visible:ring-blue-500 text-slate-800"
        />
      </div>

      {/* Department Filter */}
      <div className="w-full md:w-48">
        <select
          value={departmentId}
          onChange={(e) => handleDeptChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white text-slate-700 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Role Filter */}
      <div className="w-full md:w-48">
        <select
          value={roleId}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white text-slate-700 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="w-full md:w-48">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white text-slate-700 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Reset Filter Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleReset}
        title="Reset Filters"
        className="h-10 w-10 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 shrink-0"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
