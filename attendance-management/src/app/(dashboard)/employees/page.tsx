"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import EmployeeFilters from "@/components/employees/EmployeeFilters";
import EmployeeTable from "@/components/employees/EmployeeTable";
import DeleteEmployeeDialog from "@/components/employees/DeleteEmployeeDialog";

import { getEmployees, getDepartments, deactivateEmployee, getRoles } from "@/services/employee.service";
import { Employee, Department, Role } from "@/types/employee";

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deletingEmployee, setDeletingEmployee] = React.useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [filters, setFilters] = React.useState({ search: "", departmentId: "", roleId: "", status: "" });

  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const pageSize = 10;

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [empData, deptList, roleList] = await Promise.all([
        getEmployees({ ...filters, page, pageSize }),
        getDepartments(),
        getRoles(),
      ]);
      setEmployees(empData.employees);
      setTotalCount(empData.totalCount);
      setDepartments(deptList);
      setRoles(roleList);
    } catch (e) {
      console.error("Failed to load employees list", e);
      toast.error("Unable to load employees list.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteConfirm = async () => {
    if (!deletingEmployee) return;
    setIsDeleting(true);
    try {
      await deactivateEmployee(deletingEmployee.id);
      toast.success(`${deletingEmployee.first_name} ${deletingEmployee.last_name} deactivated successfully.`);
      setDeletingEmployee(null);
      loadData();
    } catch (e) {
      console.error("Failed to deactivate employee", e);
      toast.error("Could not deactivate employee. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* Page Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">Manage employees, filter records, and inspect profiles.</p>
        </div>
        <div>
          <Link href="/employees/new">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <EmployeeFilters
        departments={departments}
        roles={roles}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
      />

      {/* Main Table / Skeletons */}
      {loading ? (
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 w-[300px]">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <EmployeeTable
            data={employees}
            onDeleteClick={(emp) => setDeletingEmployee(emp)}
          />

          {/* Pagination Controls */}
          {employees.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs text-black mt-4">
              <div className="text-sm text-slate-500 font-medium">
                Showing <span className="font-semibold text-slate-800">{Math.min(totalCount, (page - 1) * pageSize + 1)}</span> to{" "}
                <span className="font-semibold text-slate-800">{Math.min(totalCount, page * pageSize)}</span> of{" "}
                <span className="font-semibold text-slate-800">{totalCount}</span> employees
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * pageSize >= totalCount}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <DeleteEmployeeDialog
        employeeName={deletingEmployee ? `${deletingEmployee.first_name} ${deletingEmployee.last_name}` : ""}
        open={deletingEmployee !== null}
        onOpenChange={(open) => !open && setDeletingEmployee(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
