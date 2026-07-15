import { Employee } from "./employee";

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approved_by?: number;
  created_at: string;
  employees?: Employee | null;
}

export interface LeaveBalance {
  leave_type: string;
  allocated: number;
  used: number;
  remaining: number;
}

export interface LeaveFilters {
  search?: string;
  status?: string;
  leaveTypeId?: string | number;
  departmentId?: string | number;
}

export interface LeaveInput {
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  total_days: number;
}

export interface EmployeeLeaveBalances {
  employeeId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  departmentName: string;
  balances: LeaveBalance[];
}
