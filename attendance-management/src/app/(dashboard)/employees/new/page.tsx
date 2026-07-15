"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { createEmployee, getDepartments, getShifts } from "@/services/employee.service";
import { Department, EmployeeInput, Shift } from "@/types/employee";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewEmployeePage() {
  const router = useRouter();
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [deptList, shiftList] = await Promise.all([
          getDepartments(),
          getShifts(),
        ]);
        setDepartments(deptList);
        setShifts(shiftList);
      } catch (e) {
        console.error("Failed to load metadata", e);
        toast.error("Unable to load form options.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (data: EmployeeInput) => {
    setIsSubmitting(true);
    try {
      await createEmployee(data);
      toast.success(`${data.first_name} ${data.last_name} created successfully.`);
      router.push("/employees");
    } catch (e) {
      console.error("Failed to create employee", e);
      toast.error("Could not create employee. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add New Employee</h2>
        <p className="text-muted-foreground">Register a new profile in the database.</p>
      </div>

      {loading ? (
        <div className="max-w-xl bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
          </div>
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Skeleton className="h-10 w-20" /><Skeleton className="h-10 w-32" />
          </div>
        </div>
      ) : (
        <EmployeeForm
          departments={departments}
          shifts={shifts}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Employee"
          onCancel={() => router.push("/employees")}
        />
      )}
    </div>
  );
}
