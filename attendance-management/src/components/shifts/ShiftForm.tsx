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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createShift, updateShift } from "@/services/shift.service";
import { Shift } from "@/types/shift";
import { Clock, Send, FileText, Sparkles, Coffee, ToggleLeft } from "lucide-react";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const formSchema = z.object({
  name: z.string().min(3, "Shift profile name must be at least 3 characters."),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time format must be HH:mm (e.g. 09:00)."),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time format must be HH:mm (e.g. 17:00)."),
  grace_minutes: z.string().regex(/^\d+$/, "Grace period must be a positive number of minutes."),
  break_minutes: z.string().regex(/^\d+$/, "Break duration must be a positive number of minutes."),
  status: z.enum(["Active", "Inactive"]),
  description: z.string().optional(),
}).refine((data) => {
  const start = timeToMinutes(data.start_time);
  const end = timeToMinutes(data.end_time);
  return end > start;
}, {
  message: "End time must be after start time.",
  path: ["end_time"],
});

type FormValues = z.infer<typeof formSchema>;

interface ShiftFormProps {
  initialData?: Shift | null;
}

export default function ShiftForm({ initialData }: ShiftFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      start_time: initialData?.start_time || "09:00",
      end_time: initialData?.end_time || "17:00",
      grace_minutes: String(initialData?.grace_minutes ?? 15),
      break_minutes: String(initialData?.break_minutes ?? 60),
      status: initialData?.status || "Active",
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        start_time: values.start_time,
        end_time: values.end_time,
        grace_minutes: parseInt(values.grace_minutes, 10) || 0,
        break_minutes: parseInt(values.break_minutes, 10) || 0,
        status: values.status,
        description: values.description,
      };

      if (initialData) {
        await updateShift(initialData.id, payload);
        toast.success("Shift profile updated successfully!");
      } else {
        await createShift(payload);
        toast.success("New shift profile created successfully!");
      }
      router.push("/shifts");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save shift details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-6 text-black">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-slate-400" /> Shift Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Regular Day Shift, Night Shift"
                  {...field}
                  className="border-slate-200/80 rounded-xl h-11 bg-slate-50/30 text-sm font-medium"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Start Time */}
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" /> Start Time (HH:mm)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="09:00"
                    {...field}
                    className="border-slate-200/80 rounded-xl h-11 bg-slate-50/30 text-sm font-medium"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Time */}
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" /> End Time (HH:mm)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="17:00"
                    {...field}
                    className="border-slate-200/80 rounded-xl h-11 bg-slate-50/30 text-sm font-medium"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Grace Minutes */}
          <FormField
            control={form.control}
            name="grace_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" /> Grace Period (mins)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="15"
                    {...field}
                    className="border-slate-200/80 rounded-xl h-11 bg-slate-50/30 text-sm font-medium"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Break Minutes */}
          <FormField
            control={form.control}
            name="break_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Coffee className="h-4 w-4 text-slate-400" /> Break Duration (mins)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="60"
                    {...field}
                    className="border-slate-200/80 rounded-xl h-11 bg-slate-50/30 text-sm font-medium"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <ToggleLeft className="h-4 w-4 text-slate-400" /> Roster Status
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="border-slate-200/80 rounded-xl h-11 bg-slate-50/30 text-sm font-medium">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-slate-400" /> Description
              </FormLabel>
              <FormControl>
                <textarea
                  rows={3}
                  placeholder="Explain the purpose or notes for this shift profile..."
                  {...field}
                  className="w-full p-4 border border-slate-200/80 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/30 text-sm font-medium outline-none resize-none transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 px-6 rounded-xl shadow-xs transition-transform transform active:scale-98 text-sm flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Saving..." : initialData ? "Update Shift Profile" : "Create Shift Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
