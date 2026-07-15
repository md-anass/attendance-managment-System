export interface Department {
  id: number;
  name: string;
  created_at?: string;
}

export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  designation?: string;
  department_id: number;
  role_id: number;
  shift_id?: number;
  status: string;
  joining_date: string;
  created_at?: string;
  departments?: Department | null;
  shifts?: Shift | null;
}

export interface EmployeeInput {
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  designation?: string;
  department_id: number;
  role_id: number;
  shift_id?: number;
  status: string;
  joining_date: string;
}

export interface Role {
  id: number;
  name: string;
  created_at?: string;
}

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  created_at?: string;
}
