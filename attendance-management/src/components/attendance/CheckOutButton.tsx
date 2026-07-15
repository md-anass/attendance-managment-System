"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { checkOutEmployee } from "@/services/attendance.service";

interface CheckOutButtonProps {
  attendanceId: number;
  onSuccess: () => void;
  disabled?: boolean;
}

export default function CheckOutButton({
  attendanceId,
  onSuccess,
  disabled = false,
}: CheckOutButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleCheckOut = async () => {
    if (!attendanceId) {
      toast.error("Invalid attendance record.");
      return;
    }
    setLoading(true);
    try {
      const now = new Date();
      const timeStr = now.toISOString();
      await checkOutEmployee(attendanceId, timeStr);
      toast.success("Checked out successfully!");
      onSuccess();
    } catch (e) {
      console.error("Check-out transaction error:", e);
      toast.error("Failed to check out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      disabled={disabled || loading}
      onClick={handleCheckOut}
      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-2 shadow-xs transition-colors duration-200"
    >
      <LogOut className="h-4.5 w-4.5" />
      {loading ? "Checking Out..." : "Check Out"}
    </Button>
  );
}
