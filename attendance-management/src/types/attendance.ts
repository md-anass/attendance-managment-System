import { Employee } from "./employee";

export interface Attendance {
  id: number;
  employee_id: number;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  working_hours: number;
  overtime_hours?: number;
  shift_name?: string;
  remarks?: string;
  employees?: Employee | null;
}

export interface AttendanceSummary {
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  attendanceRate: number;
}

export interface AttendanceFilters {
  date?: string; // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  departmentId?: string | number;
  employeeId?: string | number;
  status?: string;
  search?: string;
}

