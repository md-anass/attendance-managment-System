import * as React from "react";
import { Users, UserCheck, UserX, Palmtree, Percent } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

interface AttendanceSummaryProps {
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  attendanceRate?: number;
}

export default function AttendanceSummary({
  present,
  late,
  absent,
  onLeave,
  attendanceRate,
}: AttendanceSummaryProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      <StatCard
        title="Present Employees"
        value={present}
        icon={UserCheck}
        color="green"
      />
      <StatCard
        title="Late Arrivals"
        value={late}
        icon={Users}
        color="amber"
      />
      <StatCard
        title="Absent Today"
        value={absent}
        icon={UserX}
        color="red"
      />
      <StatCard
        title="On Leave"
        value={onLeave}
        icon={Palmtree}
        color="orange"
      />
      {attendanceRate !== undefined && (
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={Percent}
          color="blue"
        />
      )}
    </div>
  );
}
