import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Department, EmployeeInput, Shift } from "@/types/employee";

const employeeSchema = z.object({
  employee_code: z.string().min(3, "Employee code must be at least 3 characters"),
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  designation: z.string().optional(),
  department_id: z.string().min(1, "Please select a department"),
  role_id: z.string().min(1, "Please select a role"),
  shift_id: z.string().min(1, "Please select a shift"),
  status: z.string().min(1, "Status is required"),
  joining_date: z.string().min(1, "Joining date is required"),
});

type FormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeInput>;
  departments: Department[];
  shifts: Shift[];
  onSubmit: (data: EmployeeInput) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

export default function EmployeeForm({
  defaultValues,
  departments,
  shifts,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Employee",
  onCancel,
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_code: defaultValues?.employee_code || "",
      first_name: defaultValues?.first_name || "",
      last_name: defaultValues?.last_name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      designation: defaultValues?.designation || "",
      department_id: defaultValues?.department_id ? String(defaultValues.department_id) : "",
      role_id: defaultValues?.role_id ? String(defaultValues.role_id) : "2",
      shift_id: defaultValues?.shift_id ? String(defaultValues.shift_id) : "",
      status: defaultValues?.status || "active",
      joining_date: defaultValues?.joining_date ? defaultValues.joining_date.split("T")[0] : new Date().toISOString().split("T")[0],
    },
  });

  const onFormSubmit = (values: FormValues) => {
    onSubmit({
      employee_code: values.employee_code,
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone || "",
      designation: values.designation || "",
      department_id: Number(values.department_id),
      role_id: Number(values.role_id),
      shift_id: Number(values.shift_id),
      status: values.status,
      joining_date: values.joining_date,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 max-w-xl bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-black">
      <div className="grid grid-cols-2 gap-4">
        {/* Employee Code */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="employee_code">Employee Code</label>
          <Input
            id="employee_code"
            placeholder="EMP001"
            {...register("employee_code")}
            className={errors.employee_code ? "border-rose-500 focus-visible:ring-rose-500 text-slate-800" : "border-slate-200 text-slate-800"}
          />
          {errors.employee_code && <p className="text-xs text-rose-500">{errors.employee_code.message}</p>}
        </div>

        {/* Joining Date */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="joining_date">Joining Date</label>
          <Input
            id="joining_date"
            type="date"
            {...register("joining_date")}
            className={errors.joining_date ? "border-rose-500 focus-visible:ring-rose-500 text-slate-800" : "border-slate-200 text-slate-800"}
          />
          {errors.joining_date && <p className="text-xs text-rose-500">{errors.joining_date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="first_name">First Name</label>
          <Input
            id="first_name"
            placeholder="John"
            {...register("first_name")}
            className={errors.first_name ? "border-rose-500 focus-visible:ring-rose-500 text-slate-800" : "border-slate-200 text-slate-800"}
          />
          {errors.first_name && <p className="text-xs text-rose-500">{errors.first_name.message}</p>}
        </div>

        {/* Last Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="last_name">Last Name</label>
          <Input
            id="last_name"
            placeholder="Doe"
            {...register("last_name")}
            className={errors.last_name ? "border-rose-500 focus-visible:ring-rose-500 text-slate-800" : "border-slate-200 text-slate-800"}
          />
          {errors.last_name && <p className="text-xs text-rose-500">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email Address</label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@example.com"
            {...register("email")}
            className={errors.email ? "border-rose-500 focus-visible:ring-rose-500 text-slate-800" : "border-slate-200 text-slate-800"}
          />
          {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="phone">Phone Number</label>
          <Input
            id="phone"
            placeholder="+1 (555) 019-2834"
            {...register("phone")}
            className={errors.phone ? "border-rose-500 focus-visible:ring-rose-500 text-slate-800" : "border-slate-200 text-slate-800"}
          />
          {errors.phone && <p className="text-xs text-rose-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Designation */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="designation">Designation</label>
          <Input
            id="designation"
            placeholder="Software Engineer"
            {...register("designation")}
            className={errors.designation ? "border-rose-500 focus-visible:ring-rose-500 text-slate-800" : "border-slate-200 text-slate-800"}
          />
          {errors.designation && <p className="text-xs text-rose-500">{errors.designation.message}</p>}
        </div>

        {/* Role ID */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="role_id">System Role</label>
          <select
            id="role_id"
            {...register("role_id")}
            className={`w-full h-10 rounded-lg border px-3 py-2 text-sm bg-white text-slate-700 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
              errors.role_id ? "border-rose-500 focus:border-rose-500" : "border-slate-200"
            }`}
          >
            <option value="1">Administrator</option>
            <option value="2">Regular Employee</option>
          </select>
          {errors.role_id && <p className="text-xs text-rose-500">{errors.role_id.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Department */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="department_id">Department</label>
          <select
            id="department_id"
            {...register("department_id")}
            className={`w-full h-10 rounded-lg border px-3 py-2 text-sm bg-white text-slate-700 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
              errors.department_id ? "border-rose-500 focus:border-rose-500" : "border-slate-200"
            }`}
          >
            <option value="">Select a department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.department_id && <p className="text-xs text-rose-500">{errors.department_id.message}</p>}
        </div>

        {/* Shift */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="shift_id">Shift</label>
          <select
            id="shift_id"
            {...register("shift_id")}
            className={`w-full h-10 rounded-lg border px-3 py-2 text-sm bg-white text-slate-700 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
              errors.shift_id ? "border-rose-500 focus:border-rose-500" : "border-slate-200"
            }`}
          >
            <option value="">Select a shift</option>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name} ({shift.start_time && shift.start_time.substring(0, 5)} - {shift.end_time && shift.end_time.substring(0, 5)})
              </option>
            ))}
          </select>
          {errors.shift_id && <p className="text-xs text-rose-500">{errors.shift_id.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700" htmlFor="status">Status</label>
          <select
            id="status"
            {...register("status")}
            className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white text-slate-700 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
            className="border-slate-200"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
