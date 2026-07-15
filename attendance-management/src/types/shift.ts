import { Employee } from "./employee";

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
  break_minutes: number;
  status: "Active" | "Inactive";
  description?: string;
  created_at?: string;
}

export interface EmployeeShift {
  id: number;
  employee_id: number;
  shift_id: number;
  effective_from: string; // YYYY-MM-DD
  effective_to?: string;  // YYYY-MM-DD
  created_at?: string;
  employees?: Employee;
  shifts?: Shift;
}

export interface ShiftInput {
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
  break_minutes: number;
  status: "Active" | "Inactive";
  description?: string;
}

export interface EmployeeShiftInput {
  employee_id: number;
  shift_id: number;
  effective_from: string;
  effective_to?: string;
}

export interface ShiftFilters {
  search?: string;
  status?: string;
}
