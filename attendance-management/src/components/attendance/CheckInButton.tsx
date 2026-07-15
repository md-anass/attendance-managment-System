"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getDailyAttendance, checkInEmployee } from "@/services/attendance.service";

interface CheckInButtonProps {
  employeeId: number;
  onSuccess: () => void;
  disabled?: boolean;
}

export default function CheckInButton({
  employeeId,
  onSuccess,
  disabled = false,
}: CheckInButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const checkIfHoliday = async (dateStr: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("holidays")
        .select("id")
        .eq("holiday_date", dateStr);
      if (error) throw error;
      return data && data.length > 0;
    } catch (e) {
      console.warn("Holiday check database fallback active:", e);
      // Fallback local holiday dates (Independence Day, Labor Day, etc.)
      const mockHolidays = [
        "2026-07-24", // Independence Day (matches fallback mock)
        "2026-09-07", // Labor Day (matches fallback mock)
        "2026-10-12", // National Feast Day (matches fallback mock)
      ];
      return mockHolidays.includes(dateStr);
    }
  };

  const checkIfOnApprovedLeave = async (empId: number, dateStr: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("leaves")
        .select("id")
        .eq("employee_id", empId)
        .eq("status", "Approved")
        .lte("start_date", dateStr)
        .gte("end_date", dateStr);
      if (error) throw error;
      return data && data.length > 0;
    } catch (e) {
      console.warn("Leave check database fallback active:", e);
      // If DB fails, assume no leaves are approved locally by default to avoid blocking checkin
      return false;
    }
  };

  const handleCheckIn = async () => {
    if (!employeeId) {
      toast.error("No employee selected.");
      return;
    }
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];

      // 1. Check if attendance for today already exists
      const logs = await getDailyAttendance(todayStr);
      const alreadyCheckedIn = logs.some((r) => r.employee_id === employeeId);
      if (alreadyCheckedIn) {
        toast.error("Check-in blocked: You have already checked in today.");
        return;
      }

      // 2. Check if today is a company holiday
      const isHoliday = await checkIfHoliday(todayStr);
      if (isHoliday) {
        toast.error("Check-in blocked: Today is a company holiday.");
        return;
      }

      // 3. Check if employee is on approved leave today
      const isOnLeave = await checkIfOnApprovedLeave(employeeId, todayStr);
      if (isOnLeave) {
        toast.error("Check-in blocked: You have an approved leave for today.");
        return;
      }

      // 4. Create new attendance record with current timestamp and status "Present"
      const now = new Date();
      const timeStr = now.toISOString();
      await checkInEmployee(employeeId, timeStr, "Present");

      toast.success("Checked in successfully!");
      onSuccess();
    } catch (e) {
      console.error("Check-in transaction error:", e);
      toast.error("Failed to check in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      disabled={disabled || loading}
      onClick={handleCheckIn}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-xs transition-colors duration-200"
    >
      <LogIn className="h-4.5 w-4.5" />
      {loading ? "Checking In..." : "Check In"}
    </Button>
  );
}
