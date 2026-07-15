"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getEmployees } from "@/services/employee.service";
import { applyLeave, getLeaveRequests, getLeaveBalance, LEAVE_TYPE_MAP } from "@/services/leave.service";
import { Employee } from "@/types/employee";
import { User, Layers, Calendar, FileText, Send } from "lucide-react";

// Form Schema definition with Zod
const formSchema = z.object({
  employeeId: z.string().min(1, "Please select an employee."),
  leaveTypeId: z.string().min(1, "Please select a leave category."),
  startDate: z.string().min(1, "Please select start date."),
  endDate: z.string().min(1, "Please select end date."),
  reason: z.string().min(5, "Statement of reason must be at least 5 characters."),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "End date cannot be earlier than start date.",
  path: ["endDate"],
});

type FormValues = z.infer<typeof formSchema>;

export default function LeaveForm() {
  const router = useRouter();
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  // Initialize React Hook Form with resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: "",
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  React.useEffect(() => {
    async function loadEmployees() {
      try {
        const response = await getEmployees({ status: "active", pageSize: 150 });
        setEmployees(response.employees);
      } catch (err) {
        console.error("Failed to load employees", err);
        toast.error("Failed to load employees list.");
      } finally {
        setLoading(false);
      }
    }
    loadEmployees();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const empId = Number(values.employeeId);
      const leaveTypeIdNum = Number(values.leaveTypeId);
      const leaveTypeLabel = LEAVE_TYPE_MAP[leaveTypeIdNum] || "Annual Leave";
      
      const start = new Date(values.startDate);
      const end = new Date(values.endDate);
      const diffMs = end.getTime() - start.getTime();
      const requestedDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;

      // 1. Overlap Check: Load approved leaves for this employee
      const { records: approvedLeaves } = await getLeaveRequests({ status: "Approved" });
      const empApprovedLeaves = approvedLeaves.filter((l) => l.employee_id === empId);
      
      const hasOverlap = empApprovedLeaves.some((l) => {
        // Overlap: (startDate <= l.end_date) && (endDate >= l.start_date)
        return (values.startDate <= l.end_date) && (values.endDate >= l.start_date);
      });

      if (hasOverlap) {
        toast.error("Failed to apply: Requested date range overlaps with an existing approved leave request.");
        setSubmitting(false);
        return;
      }

      // 2. Sufficient Balance Check
      const balances = await getLeaveBalance(empId);
      const categoryBal = balances.find((b) => b.leave_type === leaveTypeLabel);
      const remaining = categoryBal ? categoryBal.remaining : 0;

      if (requestedDays > remaining) {
        toast.error(`Insufficient leave balance: You only have ${remaining} days of ${leaveTypeLabel} remaining (requested: ${requestedDays} days).`);
        setSubmitting(false);
        return;
      }

      // 3. Submit request
      await applyLeave({
        employee_id: empId,
        leave_type_id: leaveTypeIdNum,
        start_date: values.startDate,
        end_date: values.endDate,
        reason: values.reason.trim(),
        total_days: requestedDays,
      });

      toast.success("Leave request applied successfully!");
      toast.info("Notification: HR/Admin notified about a new leave request submission.");
      router.push("/leave");
      router.refresh();
    } catch (err) {
      console.error("Failed to apply for leave", err);
      toast.error("Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-6 text-black">
        {/* Employee Field */}
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-400" /> Apply As Employee
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={loading}>
                <FormControl>
                  <SelectTrigger className="border-slate-200/80 rounded-xl h-11 bg-slate-50/30 text-sm font-medium">
                    <SelectValue placeholder={loading ? "Loading active employees..." : "Choose employee name"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.first_name} {emp.last_name} ({emp.employee_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Leave Category */}
        <FormField
          control={form.control}
          name="leaveTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-slate-400" /> Leave Category
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="border-slate-200/80 rounded-xl h-11 bg-slate-50/30 text-sm font-medium">
                    <SelectValue placeholder="Choose leave category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  <SelectItem value="1">Annual Leave (Vacation)</SelectItem>
                  <SelectItem value="2">Sick Leave (Medical)</SelectItem>
                  <SelectItem value="3">Casual Leave (Personal)</SelectItem>
                  <SelectItem value="4">Maternity Leave (Family)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Ranges */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Start Date */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" /> Start Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="border-slate-200/80 rounded-xl h-11 bg-slate-50/30 text-sm font-medium"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" /> End Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="border-slate-200/80 rounded-xl h-11 bg-slate-50/30 text-sm font-medium"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Reason Statement */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-slate-400" /> Statement of Reason
              </FormLabel>
              <FormControl>
                <textarea
                  rows={4}
                  placeholder="Explain the purpose of your leave request..."
                  {...field}
                  className="w-full p-4 border border-slate-200/80 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/30 text-sm font-medium outline-none resize-none transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 px-6 rounded-xl shadow-xs transition-transform transform active:scale-98 text-sm flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Submitting Application..." : "Submit Leave Application"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
