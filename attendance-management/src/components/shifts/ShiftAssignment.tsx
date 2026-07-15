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
import { getShifts, assignShiftBulk } from "@/services/shift.service";
import { Employee } from "@/types/employee";
import { Shift } from "@/types/shift";
import { User, Clock, Calendar, Send } from "lucide-react";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";

const formSchema = z.object({
  employeeIds: z.array(z.string()).min(1, "Please select at least one employee."),
  shiftId: z.string().min(1, "Please select a shift profile."),
  effectiveFrom: z.string().min(1, "Please select assignment effective date."),
  effectiveTo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ShiftAssignmentForm() {
  const router = useRouter();
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [employeeSearch, setEmployeeSearch] = React.useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeIds: [],
      shiftId: "",
      effectiveFrom: new Date().toISOString().split("T")[0],
      effectiveTo: "",
    },
  });

  React.useEffect(() => {
    async function loadData() {
      try {
        const [empRes, shiftRes] = await Promise.all([
          getEmployees({ status: "active", pageSize: 150 }),
          getShifts(),
        ]);
        setEmployees(empRes.employees);
        setShifts(shiftRes);
      } catch (err) {
        console.error("Failed to load setup details", err);
        toast.error("Failed to retrieve setup details.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredEmployees = React.useMemo(() => {
    const s = employeeSearch.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.first_name.toLowerCase().includes(s) ||
        emp.last_name.toLowerCase().includes(s) ||
        emp.employee_code.toLowerCase().includes(s)
    );
  }, [employees, employeeSearch]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const ids = values.employeeIds.map(Number);
      await assignShiftBulk(
        ids,
        Number(values.shiftId),
        values.effectiveFrom,
        values.effectiveTo || undefined
      );

      toast.success(`Successfully assigned shift to ${ids.length} employees!`);
      router.push("/shifts");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to register shift assignments.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-6 text-black">
        {/* Bulk Employees Selector */}
        <FormField
          control={form.control}
          name="employeeIds"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <FormLabel className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                  <User className="h-4 w-4 text-slate-400" /> Select Employees ({field.value.length} selected)
                </FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const allIds = filteredEmployees.map((e) => String(e.id));
                      field.onChange(Array.from(new Set([...field.value, ...allIds])));
                    }}
                    className="text-[10px] h-7 px-2 rounded-lg border-slate-200 hover:bg-slate-50 font-semibold"
                  >
                    Select All Filtered
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      field.onChange([]);
                    }}
                    className="text-[10px] h-7 px-2 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Input
                  placeholder="Search employees by name or code..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-sm font-medium bg-slate-50/20"
                />
              </div>

              {/* List Wrapper */}
              <FormControl>
                <div className="border border-slate-200 rounded-xl max-h-56 overflow-y-auto p-3 bg-slate-50/20 divide-y divide-slate-100">
                  {loading ? (
                    <div className="text-center py-6 text-slate-400 text-xs">Loading employees...</div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">No active employees found.</div>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const isChecked = field.value.includes(String(emp.id));
                      return (
                        <div
                          key={emp.id}
                          onClick={() => {
                            if (isChecked) {
                              field.onChange(field.value.filter((val) => val !== String(emp.id)));
                            } else {
                              field.onChange([...field.value, String(emp.id)]);
                            }
                          }}
                          className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-slate-100/50 px-2 rounded-lg transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                          />
                          <div className="flex items-center gap-2">
                            <EmployeeAvatar
                              firstName={emp.first_name}
                              lastName={emp.last_name}
                              className="h-7 w-7 text-[10px]"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                {emp.first_name} {emp.last_name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {emp.employee_code} • {emp.designation}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Shift Template */}
        <FormField
          control={form.control}
          name="shiftId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" /> Select Shift Profile
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={loading}>
                <FormControl>
                  <SelectTrigger className="border-slate-200/80 rounded-xl h-11 bg-slate-50/30 text-sm font-medium">
                    <SelectValue placeholder={loading ? "Loading shifts..." : "Choose shift profile"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  {shifts.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} ({s.start_time} - {s.end_time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Effective From */}
          <FormField
            control={form.control}
            name="effectiveFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" /> Effective From Date
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

          {/* Effective To */}
          <FormField
            control={form.control}
            name="effectiveTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" /> Effective To Date (Optional)
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

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 px-6 rounded-xl shadow-xs transition-transform transform active:scale-98 text-sm flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Assigning Shift..." : "Save Assignment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
