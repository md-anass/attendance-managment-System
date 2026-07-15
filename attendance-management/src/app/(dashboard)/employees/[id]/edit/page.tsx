"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { getEmployeeById, getDepartments, updateEmployee, getShifts } from "@/services/employee.service";
import { Department, Employee, EmployeeInput, Shift } from "@/types/employee";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = React.useState<Employee | null>(null);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const idStr = params.id as string;
  const id = parseInt(idStr, 10);

  React.useEffect(() => {
    async function loadData() {
      if (isNaN(id)) {
        toast.error("Invalid Employee ID.");
        router.push("/employees");
        return;
      }
      try {
        const [empData, deptList, shiftList] = await Promise.all([
          getEmployeeById(id),
          getDepartments(),
          getShifts(),
        ]);
        if (!empData) {
          toast.error("Employee not found.");
          router.push("/employees");
          return;
        }
        setEmployee(empData);
        setDepartments(deptList);
        setShifts(shiftList);
      } catch (e) {
        console.error("Failed to load edit metadata", e);
        toast.error("Unable to load profile editor details.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, router]);

  const handleSubmit = async (data: EmployeeInput) => {
    setIsSubmitting(true);
    try {
      await updateEmployee(id, data);
      toast.success(`${data.first_name} ${data.last_name} updated successfully.`);
      router.push(`/employees/${id}`);
    } catch (e) {
      console.error("Failed to update employee", e);
      toast.error("Could not update employee. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* Title */}
      <div>
        <Link href={`/employees/${id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1.5 mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Edit Employee</h2>
        <p className="text-muted-foreground">Modify employee records inside the database.</p>
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
        employee && (
          <EmployeeForm
            defaultValues={employee}
            departments={departments}
            shifts={shifts}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
            onCancel={() => router.push(`/employees/${id}`)}
          />
        )
      )}
    </div>
  );
}
