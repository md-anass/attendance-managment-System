import { supabase } from "@/lib/supabase";
import { Employee, EmployeeInput, Department, Role, Shift } from "@/types/employee";

const STORAGE_KEY_EMPLOYEES = "ams_local_employees";
const STORAGE_KEY_DEPARTMENTS = "ams_local_departments";
const STORAGE_KEY_SHIFTS = "ams_local_shifts";

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "Human Resources" },
  { id: 3, name: "Product & Design" },
  { id: 4, name: "Marketing" },
  { id: 5, name: "Operations" },
];

const DEFAULT_SHIFTS: Shift[] = [
  { id: 1, name: "Morning Shift", start_time: "09:00:00", end_time: "17:00:00" },
  { id: 2, name: "Evening Shift", start_time: "17:00:00", end_time: "01:00:00" },
  { id: 3, name: "Night Shift", start_time: "01:00:00", end_time: "09:00:00" },
];

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 1,
    employee_code: "EMP001",
    first_name: "Alice",
    last_name: "Green",
    email: "alice.green@example.com",
    phone: "+1-555-0101",
    designation: "Software Engineer",
    department_id: 1,
    role_id: 2,
    shift_id: 1,
    status: "active",
    joining_date: "2026-01-10",
    created_at: new Date().toISOString(),
    departments: DEFAULT_DEPARTMENTS[0],
    shifts: DEFAULT_SHIFTS[0],
  },
  {
    id: 2,
    employee_code: "EMP002",
    first_name: "Bob",
    last_name: "White",
    email: "bob.white@example.com",
    phone: "+1-555-0102",
    designation: "DevOps Engineer",
    department_id: 1,
    role_id: 2,
    shift_id: 1,
    status: "active",
    joining_date: "2026-02-15",
    created_at: new Date().toISOString(),
    departments: DEFAULT_DEPARTMENTS[0],
    shifts: DEFAULT_SHIFTS[0],
  },
  {
    id: 3,
    employee_code: "EMP003",
    first_name: "Charlie",
    last_name: "Black",
    email: "charlie.black@example.com",
    phone: "+1-555-0103",
    designation: "HR Officer",
    department_id: 2,
    role_id: 2,
    shift_id: 2,
    status: "active",
    joining_date: "2025-11-01",
    created_at: new Date().toISOString(),
    departments: DEFAULT_DEPARTMENTS[1],
    shifts: DEFAULT_SHIFTS[1],
  },
  {
    id: 4,
    employee_code: "EMP004",
    first_name: "Diana",
    last_name: "Prince",
    email: "diana.prince@example.com",
    phone: "+1-555-0104",
    designation: "UX Designer",
    department_id: 3,
    role_id: 2,
    shift_id: 1,
    status: "active",
    joining_date: "2026-03-01",
    created_at: new Date().toISOString(),
    departments: DEFAULT_DEPARTMENTS[2],
    shifts: DEFAULT_SHIFTS[0],
  },
  {
    id: 5,
    employee_code: "EMP005",
    first_name: "Evan",
    last_name: "Wright",
    email: "evan.wright@example.com",
    phone: "+1-555-0105",
    designation: "Marketing Specialist",
    department_id: 4,
    role_id: 2,
    shift_id: 3,
    status: "inactive",
    joining_date: "2025-08-20",
    created_at: new Date().toISOString(),
    departments: DEFAULT_DEPARTMENTS[3],
    shifts: DEFAULT_SHIFTS[2],
  },
];

function getLocalEmployees(): Employee[] {
  if (typeof window === "undefined") return DEFAULT_EMPLOYEES;
  const stored = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(DEFAULT_EMPLOYEES));
    return DEFAULT_EMPLOYEES;
  }
  return JSON.parse(stored);
}

function setLocalEmployees(employees: Employee[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
}

function getLocalDepartments(): Department[] {
  if (typeof window === "undefined") return DEFAULT_DEPARTMENTS;
  const stored = localStorage.getItem(STORAGE_KEY_DEPARTMENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
    return DEFAULT_DEPARTMENTS;
  }
  return JSON.parse(stored);
}

function getLocalShifts(): Shift[] {
  if (typeof window === "undefined") return DEFAULT_SHIFTS;
  const stored = localStorage.getItem(STORAGE_KEY_SHIFTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(DEFAULT_SHIFTS));
    return DEFAULT_SHIFTS;
  }
  return JSON.parse(stored);
}

export async function getDepartments(): Promise<Department[]> {
  try {
    const { data, error } = await supabase.from("departments").select("*").order("name", { ascending: true });
    if (error || !data || data.length === 0) {
      throw new Error("No database departments found");
    }
    return data;
  } catch (e) {
    return getLocalDepartments();
  }
}

export async function getEmployees(filters?: {
  search?: string;
  departmentId?: number | string;
  roleId?: number | string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ employees: Employee[]; totalCount: number }> {
  try {
    let query = supabase
      .from("employees")
      .select(`
        id,
        employee_code,
        first_name,
        last_name,
        email,
        phone,
        designation,
        department_id,
        role_id,
        shift_id,
        status,
        joining_date,
        created_at,
        departments (
          id,
          name
        ),
        shifts (
          id,
          name,
          start_time,
          end_time
        )
      `, { count: "exact" });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.departmentId) {
      query = query.eq("department_id", Number(filters.departmentId));
    }
    if (filters?.roleId) {
      query = query.eq("role_id", Number(filters.roleId));
    }
    if (filters?.search) {
      const search = filters.search;
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,employee_code.ilike.%${search}%`);
    }

    const page = filters?.page ? Number(filters.page) : 1;
    const pageSize = filters?.pageSize ? Number(filters.pageSize) : 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to).order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error("No database employees found");
    }

    let result = data.map((item: any) => {
      const shiftData = Array.isArray(item.shifts) ? item.shifts[0] : item.shifts;
      return {
        id: Number(item.id),
        employee_code: item.employee_code,
        first_name: item.first_name,
        last_name: item.last_name,
        email: item.email,
        phone: item.phone,
        designation: item.designation,
        department_id: item.department_id ? Number(item.department_id) : 0,
        role_id: Number(item.role_id),
        shift_id: item.shift_id ? Number(item.shift_id) : 0,
        status: item.status,
        joining_date: item.joining_date,
        created_at: item.created_at,
        departments: item.departments ? {
          id: Number(item.departments.id),
          name: item.departments.name,
        } : null,
        shifts: shiftData ? {
          id: Number(shiftData.id),
          name: shiftData.name,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
        } : null,
      };
    });

    return {
      employees: result,
      totalCount: count || result.length,
    };
  } catch (e) {
    let list = getLocalEmployees();
    const depts = getLocalDepartments();
    const shiftsList = getLocalShifts();
    
    let result = list.map((emp) => ({
      ...emp,
      departments: depts.find((d) => d.id === emp.department_id) || null,
      shifts: shiftsList.find((s) => s.id === emp.shift_id) || null,
    }));
    
    if (filters?.status) {
      result = result.filter((emp) => emp.status === filters.status);
    }
    if (filters?.departmentId) {
      result = result.filter((emp) => emp.department_id === Number(filters.departmentId));
    }
    if (filters?.roleId) {
      result = result.filter((emp) => emp.role_id === Number(filters.roleId));
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.first_name.toLowerCase().includes(search) ||
          emp.last_name.toLowerCase().includes(search) ||
          emp.email.toLowerCase().includes(search) ||
          emp.employee_code.toLowerCase().includes(search)
      );
    }
    
    const totalCount = result.length;
    const page = filters?.page ? Number(filters.page) : 1;
    const pageSize = filters?.pageSize ? Number(filters.pageSize) : 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    
    return {
      employees: result.slice(from, to),
      totalCount,
    };
  }
}

export async function getEmployeeById(id: number): Promise<Employee | null> {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select(`
        id,
        employee_code,
        first_name,
        last_name,
        email,
        phone,
        designation,
        department_id,
        role_id,
        shift_id,
        status,
        joining_date,
        created_at,
        departments (
          id,
          name
        ),
        shifts (
          id,
          name,
          start_time,
          end_time
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const deptData = Array.isArray(data.departments)
      ? data.departments[0]
      : data.departments;

    const shiftData = Array.isArray(data.shifts)
      ? data.shifts[0]
      : data.shifts;

    return {
      id: Number(data.id),
      employee_code: data.employee_code,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      designation: data.designation,
      department_id: data.department_id ? Number(data.department_id) : 0,
      role_id: Number(data.role_id),
      shift_id: data.shift_id ? Number(data.shift_id) : 0,
      status: data.status,
      joining_date: data.joining_date,
      created_at: data.created_at,
      departments: deptData ? {
        id: Number(deptData.id),
        name: deptData.name,
      } : null,
      shifts: shiftData ? {
        id: Number(shiftData.id),
        name: shiftData.name,
        start_time: shiftData.start_time,
        end_time: shiftData.end_time,
      } : null,
    };
  } catch (e) {
    const list = getLocalEmployees();
    const depts = getLocalDepartments();
    const shiftsList = getLocalShifts();
    const emp = list.find((emp) => emp.id === id) || null;
    if (emp) {
      return {
        ...emp,
        departments: depts.find((d) => d.id === emp.department_id) || null,
        shifts: shiftsList.find((s) => s.id === emp.shift_id) || null,
      };
    }
    return null;
  }
}

export async function createEmployee(input: EmployeeInput): Promise<Employee> {
  try {
    const { data, error } = await supabase
      .from("employees")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      id: Number(data.id),
      department_id: data.department_id ? Number(data.department_id) : 0,
      role_id: Number(data.role_id),
      shift_id: data.shift_id ? Number(data.shift_id) : 0,
    };
  } catch (e) {
    const list = getLocalEmployees();
    const depts = getLocalDepartments();
    const shiftsList = getLocalShifts();
    const activeDept = depts.find((d) => d.id === input.department_id) || null;
    const activeShift = shiftsList.find((s) => s.id === input.shift_id) || null;

    const maxId = list.reduce((max, emp) => (emp.id > max ? emp.id : max), 0);
    const newEmp: Employee = {
      id: maxId + 1,
      ...input,
      created_at: new Date().toISOString(),
      departments: activeDept,
      shifts: activeShift,
    };

    setLocalEmployees([newEmp, ...list]);
    return newEmp;
  }
}

export async function updateEmployee(id: number, input: Partial<EmployeeInput>): Promise<Employee> {
  try {
    const { data, error } = await supabase
      .from("employees")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      id: Number(data.id),
      department_id: data.department_id ? Number(data.department_id) : 0,
      role_id: Number(data.role_id),
      shift_id: data.shift_id ? Number(data.shift_id) : 0,
    };
  } catch (e) {
    const list = getLocalEmployees();
    const depts = getLocalDepartments();
    const shiftsList = getLocalShifts();
    
    const index = list.findIndex((emp) => emp.id === id);
    if (index === -1) throw new Error("Employee not found");

    const updatedEmp: Employee = {
      ...list[index],
      ...input,
      departments: depts.find((d) => d.id === (input.department_id !== undefined ? input.department_id : list[index].department_id)) || list[index].departments,
      shifts: shiftsList.find((s) => s.id === (input.shift_id !== undefined ? input.shift_id : list[index].shift_id)) || list[index].shifts,
    } as Employee;

    const newList = [...list];
    newList[index] = updatedEmp;
    setLocalEmployees(newList);
    return updatedEmp;
  }
}

export async function deleteEmployee(id: number): Promise<void> {
  try {
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    const list = getLocalEmployees();
    const newList = list.filter((emp) => emp.id !== id);
    setLocalEmployees(newList);
  }
}

export async function deactivateEmployee(id: number): Promise<Employee> {
  return updateEmployee(id, { status: "inactive" });
}

const DEFAULT_ROLES: Role[] = [
  { id: 1, name: "Administrator" },
  { id: 2, name: "Regular Employee" },
];

export async function getRoles(): Promise<Role[]> {
  try {
    const { data, error } = await supabase.from("roles").select("*").order("id", { ascending: true });
    if (error || !data || data.length === 0) {
      throw new Error("No database roles found");
    }
    return data;
  } catch (e) {
    return DEFAULT_ROLES;
  }
}

export async function getShifts(): Promise<Shift[]> {
  try {
    const { data, error } = await supabase.from("shifts").select("*").order("name", { ascending: true });
    if (error || !data || data.length === 0) {
      throw new Error("No database shifts found");
    }
    return data;
  } catch (e) {
    return getLocalShifts();
  }
}

export interface AttendanceSummary {
  presentDays: number;
  lateDays: number;
  absentDays: number;
  totalHours: number;
  attendanceRate: number;
}

export async function getEmployeeAttendanceSummary(employeeId: number): Promise<AttendanceSummary> {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select("status, check_in, check_out")
      .eq("employee_id", employeeId);

    if (error) throw error;

    let presentDays = 0;
    let lateDays = 0;
    let absentDays = 0;
    let totalHours = 0;

    data?.forEach((record: any) => {
      const status = String(record.status).toLowerCase();
      if (status === "present" || status === "on time" || status === "on-time") {
        presentDays++;
      } else if (status === "late") {
        lateDays++;
      } else if (status === "absent") {
        absentDays++;
      }

      if (record.check_in && record.check_out) {
        const diffMs = new Date(record.check_out).getTime() - new Date(record.check_in).getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);
        if (diffHrs > 0) {
          totalHours += diffHrs;
        }
      }
    });

    const totalDays = presentDays + lateDays + absentDays;
    const attendanceRate = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 100;

    return {
      presentDays,
      lateDays,
      absentDays,
      totalHours: Math.round(totalHours * 10) / 10,
      attendanceRate,
    };
  } catch (e) {
    return {
      presentDays: 18,
      lateDays: 2,
      absentDays: 1,
      totalHours: 156.5,
      attendanceRate: 95,
    };
  }
}

export interface LeaveSummary {
  approvedDays: number;
  pendingDays: number;
  rejectedDays: number;
  totalBalance: number;
}

export async function getEmployeeLeaveSummary(employeeId: number): Promise<LeaveSummary> {
  try {
    const { data, error } = await supabase
      .from("leaves")
      .select("status, start_date, end_date")
      .eq("employee_id", employeeId);

    if (error) throw error;

    let approvedDays = 0;
    let pendingDays = 0;
    let rejectedDays = 0;

    data?.forEach((record: any) => {
      let days = 1;
      if (record.start_date && record.end_date) {
        const diffMs = new Date(record.end_date).getTime() - new Date(record.start_date).getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
        if (diffDays > 0) days = diffDays;
      }

      const status = String(record.status).toLowerCase();
      if (status === "approved") {
        approvedDays += days;
      } else if (status === "pending") {
        pendingDays += days;
      } else if (status === "rejected") {
        rejectedDays += days;
      }
    });

    return {
      approvedDays,
      pendingDays,
      rejectedDays,
      totalBalance: 24 - approvedDays,
    };
  } catch (e) {
    return {
      approvedDays: 4,
      pendingDays: 1,
      rejectedDays: 0,
      totalBalance: 20,
    };
  }
}

export interface EmployeeRecentAttendanceRecord {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  hours: string;
}

export async function getEmployeeRecentAttendance(employeeId: number): Promise<EmployeeRecentAttendanceRecord[]> {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select("id, check_in, check_out, status")
      .eq("employee_id", employeeId)
      .order("check_in", { ascending: false })
      .limit(10);

    if (error) throw error;

    return data.map((item: any) => {
      const dateObj = new Date(item.check_in);
      const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const formatTime = (isoString: string | null) => {
        if (!isoString) return "--";
        try {
          return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
          return "--";
        }
      };

      let hours = "--";
      if (item.check_in && item.check_out) {
        const diffMs = new Date(item.check_out).getTime() - new Date(item.check_in).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        hours = diffHours > 0 ? `${diffHours.toFixed(1)}h` : "0.0h";
      }

      return {
        id: Number(item.id),
        date: dateStr,
        checkIn: formatTime(item.check_in),
        checkOut: formatTime(item.check_out),
        status: item.status || "On Time",
        hours,
      };
    });
  } catch (e) {
    return [
      {
        id: 1,
        date: "Jul 10, 2026",
        checkIn: "08:58 AM",
        checkOut: "05:02 PM",
        status: "On Time",
        hours: "8.1h",
      },
      {
        id: 2,
        date: "Jul 09, 2026",
        checkIn: "09:05 AM",
        checkOut: "05:00 PM",
        status: "Late",
        hours: "8.0h",
      },
      {
        id: 3,
        date: "Jul 08, 2026",
        checkIn: "08:52 AM",
        checkOut: "05:15 PM",
        status: "On Time",
        hours: "8.4h",
      },
      {
        id: 4,
        date: "Jul 07, 2026",
        checkIn: "09:00 AM",
        checkOut: "05:00 PM",
        status: "On Time",
        hours: "8.0h",
      },
      {
        id: 5,
        date: "Jul 06, 2026",
        checkIn: "08:45 AM",
        checkOut: "04:55 PM",
        status: "On Time",
        hours: "8.2h",
      },
    ];
  }
}
