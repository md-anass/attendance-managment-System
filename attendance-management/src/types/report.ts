export interface AttendanceSummary {
  totalEmployees: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

export interface DailyReportRecord {
  id: number;
  employee_id: number;
  employee_code: string;
  employee_name: string;
  department: string;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  working_hours: number;
  overtime_hours: number;
  shift_name: string;
  status: string;
}

export interface MonthlyReportRecord {
  employee_id: number;
  employee_code: string;
  employee_name: string;
  department: string;
  month: string; // YYYY-MM
  total_working_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  leave_days: number;
  overtime_hours: number;
  attendance_rate: number; // percentage
}

export interface EmployeeAttendanceSummary {
  employee_id: number;
  employee_code: string;
  employee_name: string;
  department: string;
  total_working_hours: number;
  total_overtime_hours: number;
  total_present_days: number;
  total_absent_days: number;
  total_late_days: number;
  total_leave_days: number;
  attendance_rate: number;
}

export interface DepartmentReportRecord {
  department_id: number;
  department_name: string;
  total_employees: number;
  present_today: number;
  absent_today: number;
  on_leave_today: number;
  attendance_rate: number; // percentage
  average_working_hours: number;
  late_arrivals: number;
  leave_requests: number;
}

export interface LeaveReportRecord {
  id: number;
  employee_name: string;
  employee_code: string;
  department: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: string;
  remarks?: string;
}

export interface MonthlyTrendData {
  month: string; // e.g. "Jan", "Feb"
  Present: number;
  Absent: number;
  Leave: number;
}
