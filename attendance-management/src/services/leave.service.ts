import { supabase } from "@/lib/supabase";
import { LeaveRequest, LeaveInput, LeaveFilters, LeaveBalance, EmployeeLeaveBalances } from "@/types/leave";

const STORAGE_KEY_LEAVES = "ams_local_leaves";

export const LEAVE_TYPE_MAP: Record<number, string> = {
  1: "Annual Leave",
  2: "Sick Leave",
  3: "Casual Leave",
  4: "Maternity Leave",
};

export const LEAVE_TYPE_REVERSE_MAP: Record<string, number> = {
  "Annual Leave": 1,
  "Sick Leave": 2,
  "Casual Leave": 3,
  "Maternity Leave": 4,
};

const DEFAULT_LEAVES: LeaveRequest[] = [
  {
    id: 1,
    employee_id: 1,
    leave_type_id: 1,
    start_date: "2026-07-15",
    end_date: "2026-07-18",
    total_days: 4,
    status: "Approved",
    reason: "Family trip planning",
    created_at: new Date().toISOString(),
    employees: {
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
    }
  },
  {
    id: 2,
    employee_id: 2,
    leave_type_id: 2,
    start_date: "2026-07-20",
    end_date: "2026-07-21",
    total_days: 2,
    status: "Pending",
    reason: "Medical checkup appointment",
    created_at: new Date().toISOString(),
    employees: {
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
    }
  },
  {
    id: 3,
    employee_id: 4,
    leave_type_id: 3,
    start_date: "2026-07-10",
    end_date: "2026-07-10",
    total_days: 1,
    status: "Rejected",
    reason: "Urgent personal matter",
    created_at: new Date().toISOString(),
    employees: {
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
    }
  }
];

function calculateDays(start: string, end: string): number {
  try {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 1;
  } catch {
    return 1;
  }
}

function getLocalLeaves(): LeaveRequest[] {
  if (typeof window === "undefined") return DEFAULT_LEAVES;
  const stored = localStorage.getItem(STORAGE_KEY_LEAVES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_LEAVES, JSON.stringify(DEFAULT_LEAVES));
    return DEFAULT_LEAVES;
  }
  return JSON.parse(stored);
}

function setLocalLeaves(leaves: LeaveRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_LEAVES, JSON.stringify(leaves));
}

// 1. getLeaveRequests
export async function getLeaveRequests(
  filters?: LeaveFilters,
  page = 1,
  pageSize = 10
): Promise<{ records: LeaveRequest[]; totalCount: number }> {
  try {
    let query = supabase
      .from("leaves")
      .select(`
        id,
        employee_id,
        leave_type,
        leave_type_id,
        start_date,
        end_date,
        total_days,
        status,
        reason,
        created_at,
        employees (
          id,
          employee_code,
          first_name,
          last_name,
          email,
          designation,
          department_id,
          role_id,
          status,
          joining_date
        )
      `, { count: "exact" });

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters?.leaveTypeId && filters.leaveTypeId !== "all") {
      const typeStr = LEAVE_TYPE_MAP[Number(filters.leaveTypeId)];
      if (typeStr) {
        query = query.or(`leave_type.eq."${typeStr}",leave_type_id.eq.${filters.leaveTypeId}`);
      } else {
        query = query.eq("leave_type_id", filters.leaveTypeId);
      }
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to).order("created_at", { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No leaves found");

    let records = data.map((item: any) => {
      const dbTypeId = Number(item.leave_type_id || LEAVE_TYPE_REVERSE_MAP[item.leave_type] || 1);
      return {
        id: Number(item.id),
        employee_id: Number(item.employee_id),
        leave_type_id: dbTypeId,
        start_date: item.start_date,
        end_date: item.end_date,
        total_days: Number(item.total_days || calculateDays(item.start_date, item.end_date)),
        status: item.status,
        reason: item.reason || "",
        created_at: item.created_at,
        employees: Array.isArray(item.employees) ? item.employees[0] : item.employees,
      };
    });

    if (filters?.departmentId && filters.departmentId !== "all") {
      records = records.filter(
        (r) => r.employees?.department_id === Number(filters.departmentId)
      );
    }

    if (filters?.search) {
      const s = filters.search.toLowerCase();
      records = records.filter(
        (r) =>
          r.employees?.first_name.toLowerCase().includes(s) ||
          r.employees?.last_name.toLowerCase().includes(s) ||
          r.employees?.employee_code.toLowerCase().includes(s)
      );
    }

    return {
      records,
      totalCount: count || records.length,
    };
  } catch (e) {
    let list = getLocalLeaves();

    if (filters?.status && filters.status !== "all") {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters?.leaveTypeId && filters.leaveTypeId !== "all") {
      list = list.filter((r) => r.leave_type_id === Number(filters.leaveTypeId));
    }
    if (filters?.departmentId && filters.departmentId !== "all") {
      list = list.filter((r) => r.employees?.department_id === Number(filters.departmentId));
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.employees?.first_name.toLowerCase().includes(s) ||
          r.employees?.last_name.toLowerCase().includes(s) ||
          r.employees?.employee_code.toLowerCase().includes(s)
      );
    }

    const totalCount = list.length;
    const from = (page - 1) * pageSize;
    const to = from + pageSize;

    return {
      records: list.slice(from, to),
      totalCount,
    };
  }
}

// 2. getLeaveRequestById
export async function getLeaveRequestById(id: number): Promise<LeaveRequest | null> {
  try {
    const { data, error } = await supabase
      .from("leaves")
      .select(`
        id,
        employee_id,
        leave_type,
        leave_type_id,
        start_date,
        end_date,
        total_days,
        status,
        reason,
        created_at,
        employees (
          id,
          employee_code,
          first_name,
          last_name,
          email,
          designation,
          department_id,
          role_id,
          status,
          joining_date
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const dbTypeId = Number(data.leave_type_id || LEAVE_TYPE_REVERSE_MAP[data.leave_type] || 1);

    return {
      id: Number(data.id),
      employee_id: Number(data.employee_id),
      leave_type_id: dbTypeId,
      start_date: data.start_date,
      end_date: data.end_date,
      total_days: Number(data.total_days || calculateDays(data.start_date, data.end_date)),
      status: data.status,
      reason: data.reason || "",
      created_at: data.created_at,
      employees: Array.isArray(data.employees) ? data.employees[0] : data.employees,
    };
  } catch (e) {
    const list = getLocalLeaves();
    return list.find((r) => r.id === id) || null;
  }
}

// 3. applyLeave
export async function applyLeave(data: LeaveInput): Promise<LeaveRequest> {
  try {
    const leaveTypeStr = LEAVE_TYPE_MAP[data.leave_type_id] || "Annual Leave";
    const { data: resData, error } = await supabase
      .from("leaves")
      .insert({
        employee_id: data.employee_id,
        leave_type: leaveTypeStr,
        leave_type_id: data.leave_type_id,
        start_date: data.start_date,
        end_date: data.end_date,
        total_days: data.total_days,
        reason: data.reason,
        status: "Pending",
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...resData,
      id: Number(resData.id),
      employee_id: Number(resData.employee_id),
      leave_type_id: Number(resData.leave_type_id || data.leave_type_id),
      total_days: Number(resData.total_days || data.total_days),
    };
  } catch (e) {
    const list = getLocalLeaves();
    const maxId = list.reduce((max, r) => (r.id > max ? r.id : max), 0);
    
    let empDetail = null;
    if (typeof window !== "undefined") {
      const storedEmps = localStorage.getItem("ams_local_employees");
      const emps = storedEmps ? JSON.parse(storedEmps) : [];
      empDetail = emps.find((emp: any) => emp.id === data.employee_id) || null;
    }

    const newRecord: LeaveRequest = {
      id: maxId + 1,
      employee_id: data.employee_id,
      leave_type_id: data.leave_type_id,
      start_date: data.start_date,
      end_date: data.end_date,
      total_days: data.total_days,
      status: "Pending",
      reason: data.reason,
      created_at: new Date().toISOString(),
      employees: empDetail,
    };

    setLocalLeaves([newRecord, ...list]);
    return newRecord;
  }
}

// 4. approveLeave
export async function approveLeave(id: number): Promise<LeaveRequest> {
  try {
    const { data, error } = await supabase
      .from("leaves")
      .update({ status: "Approved" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Fetch full leave request to extract date range
    const leaveReq = await getLeaveRequestById(id);
    if (leaveReq) {
      const start = new Date(leaveReq.start_date);
      const end = new Date(leaveReq.end_date);
      let curr = new Date(start);

      while (curr <= end) {
        const todayStr = curr.toISOString().split("T")[0];

        // Check if attendance log already exists for this day
        const { data: existing, error: existError } = await supabase
          .from("attendance")
          .select("id")
          .eq("employee_id", leaveReq.employee_id)
          .gte("check_in", `${todayStr}T00:00:00`)
          .lte("check_in", `${todayStr}T23:59:59`)
          .maybeSingle();

        if (!existError) {
          if (existing) {
            await supabase
              .from("attendance")
              .update({ status: "On Leave" })
              .eq("id", existing.id);
          } else {
            await supabase
              .from("attendance")
              .insert({
                employee_id: leaveReq.employee_id,
                check_in: `${todayStr}T09:00:00.000Z`,
                status: "On Leave",
              });
          }
        }
        curr.setDate(curr.getDate() + 1);
      }
    }

    return {
      ...data,
      id: Number(data.id),
      employee_id: Number(data.employee_id),
      leave_type_id: Number(data.leave_type_id || 1),
      total_days: Number(data.total_days || 1),
    };
  } catch (e) {
    const list = getLocalLeaves();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Leave record not found");

    const updated = {
      ...list[index],
      status: "Approved" as const,
    };
    const newList = [...list];
    newList[index] = updated;
    setLocalLeaves(newList);

    // Also update local storage attendance logs
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ams_local_attendance");
      let attLogs: any[] = stored ? JSON.parse(stored) : [];

      const start = new Date(updated.start_date);
      const end = new Date(updated.end_date);
      let curr = new Date(start);

      while (curr <= end) {
        const todayStr = curr.toISOString().split("T")[0];
        const logIndex = attLogs.findIndex(
          (log) => log.employee_id === updated.employee_id && log.check_in && log.check_in.startsWith(todayStr)
        );

        if (logIndex !== -1) {
          attLogs[logIndex].status = "On Leave";
        } else {
          const maxAttId = attLogs.reduce((max, log) => (log.id > max ? log.id : max), 0);
          attLogs.push({
            id: maxAttId + 1,
            employee_id: updated.employee_id,
            check_in: `${todayStr}T09:00:00.000Z`,
            check_out: null,
            status: "On Leave",
            working_hours: 0,
            employees: updated.employees,
          });
        }
        curr.setDate(curr.getDate() + 1);
      }
      localStorage.setItem("ams_local_attendance", JSON.stringify(attLogs));
    }

    return updated;
  }
}

// 5. rejectLeave
export async function rejectLeave(id: number): Promise<LeaveRequest> {
  try {
    const { data, error } = await supabase
      .from("leaves")
      .update({ status: "Rejected" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      id: Number(data.id),
      employee_id: Number(data.employee_id),
      leave_type_id: Number(data.leave_type_id || 1),
      total_days: Number(data.total_days || 1),
    };
  } catch (e) {
    const list = getLocalLeaves();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Leave record not found");

    const updated = {
      ...list[index],
      status: "Rejected" as const,
    };
    const newList = [...list];
    newList[index] = updated;
    setLocalLeaves(newList);
    return updated;
  }
}

// 6. getLeaveBalance (Calculates balance for single employeeId)
export async function getLeaveBalance(employeeId: number): Promise<LeaveBalance[]> {
  try {
    const { data, error } = await supabase
      .from("leaves")
      .select("leave_type, leave_type_id, status, start_date, end_date, total_days")
      .eq("employee_id", employeeId)
      .eq("status", "Approved");

    if (error) throw error;
    const leaves = data || [];

    const getUsedDays = (typeId: number, typeStr: string) => {
      return leaves
        .filter((l: any) => Number(l.leave_type_id) === typeId || l.leave_type === typeStr)
        .reduce((sum, l) => sum + Number(l.total_days || calculateDays(l.start_date, l.end_date)), 0);
    };

    const annualUsed = getUsedDays(1, "Annual Leave");
    const sickUsed = getUsedDays(2, "Sick Leave");
    const casualUsed = getUsedDays(3, "Casual Leave");
    const maternityUsed = getUsedDays(4, "Maternity Leave");

    return [
      { leave_type: "Annual Leave", allocated: 20, used: annualUsed, remaining: Math.max(0, 20 - annualUsed) },
      { leave_type: "Sick Leave", allocated: 10, used: sickUsed, remaining: Math.max(0, 10 - sickUsed) },
      { leave_type: "Casual Leave", allocated: 5, used: casualUsed, remaining: Math.max(0, 5 - casualUsed) },
      { leave_type: "Maternity Leave", allocated: 90, used: maternityUsed, remaining: Math.max(0, 90 - maternityUsed) },
    ];
  } catch (e) {
    const leaves = getLocalLeaves().filter((l) => l.employee_id === employeeId && l.status === "Approved");

    const getUsedDays = (typeId: number) => {
      return leaves
        .filter((l) => l.leave_type_id === typeId)
        .reduce((sum, l) => sum + l.total_days, 0);
    };

    const annualUsed = getUsedDays(1);
    const sickUsed = getUsedDays(2);
    const casualUsed = getUsedDays(3);
    const maternityUsed = getUsedDays(4);

    return [
      { leave_type: "Annual Leave", allocated: 20, used: annualUsed, remaining: Math.max(0, 20 - annualUsed) },
      { leave_type: "Sick Leave", allocated: 10, used: sickUsed, remaining: Math.max(0, 10 - sickUsed) },
      { leave_type: "Casual Leave", allocated: 5, used: casualUsed, remaining: Math.max(0, 5 - casualUsed) },
      { leave_type: "Maternity Leave", allocated: 90, used: maternityUsed, remaining: Math.max(0, 90 - maternityUsed) },
    ];
  }
}

// 7. getPendingRequests
export async function getPendingRequests(page = 1, pageSize = 10): Promise<{ records: LeaveRequest[]; totalCount: number }> {
  return getLeaveRequests({ status: "Pending" }, page, pageSize);
}

// 8. getAllLeaveBalances (Internal helper supporting whole roster check balance display)
export async function getAllLeaveBalances(): Promise<EmployeeLeaveBalances[]> {
  try {
    const [employeesRes, leavesRes] = await Promise.all([
      supabase.from("employees").select(`
        id,
        employee_code,
        first_name,
        last_name,
        departments (
          name
        )
      `),
      supabase.from("leaves").select("employee_id, leave_type, leave_type_id, status, start_date, end_date, total_days").eq("status", "Approved")
    ]);

    if (employeesRes.error) throw employeesRes.error;
    
    const employees = employeesRes.data || [];
    const leaves = leavesRes.data || [];

    return employees.map((emp: any) => {
      const empLeaves = leaves.filter((l: any) => l.employee_id === emp.id);

      const getUsedDays = (typeId: number, typeStr: string) => {
        return empLeaves
          .filter((l: any) => Number(l.leave_type_id) === typeId || l.leave_type === typeStr)
          .reduce((sum, l) => sum + Number(l.total_days || calculateDays(l.start_date, l.end_date)), 0);
      };

      const annualUsed = getUsedDays(1, "Annual Leave");
      const sickUsed = getUsedDays(2, "Sick Leave");
      const casualUsed = getUsedDays(3, "Casual Leave");
      const maternityUsed = getUsedDays(4, "Maternity Leave");

      const deptName = Array.isArray(emp.departments) 
        ? emp.departments[0]?.name 
        : emp.departments?.name;

      return {
        employeeId: Number(emp.id),
        employeeCode: emp.employee_code,
        firstName: emp.first_name,
        lastName: emp.last_name,
        departmentName: deptName || "Unassigned",
        balances: [
          { leave_type: "Annual Leave", allocated: 20, used: annualUsed, remaining: Math.max(0, 20 - annualUsed) },
          { leave_type: "Sick Leave", allocated: 10, used: sickUsed, remaining: Math.max(0, 10 - sickUsed) },
          { leave_type: "Casual Leave", allocated: 5, used: casualUsed, remaining: Math.max(0, 5 - casualUsed) },
          { leave_type: "Maternity Leave", allocated: 90, used: maternityUsed, remaining: Math.max(0, 90 - maternityUsed) },
        ],
      };
    });
  } catch (e) {
    let employees: any[] = [];
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ams_local_employees");
      const storedDepts = localStorage.getItem("ams_local_departments");
      const depts = storedDepts ? JSON.parse(storedDepts) : [];
      employees = stored ? JSON.parse(stored) : [];
      employees.forEach(emp => {
        emp.departments = depts.find((d: any) => d.id === emp.department_id) || null;
      });
    }

    const leaves = getLocalLeaves().filter((l) => l.status === "Approved");

    return employees.map((emp) => {
      const empLeaves = leaves.filter((l) => l.employee_id === emp.id);

      const getUsedDays = (typeId: number) => {
        return empLeaves
          .filter((l) => l.leave_type_id === typeId)
          .reduce((sum, l) => sum + l.total_days, 0);
      };

      const annualUsed = getUsedDays(1);
      const sickUsed = getUsedDays(2);
      const casualUsed = getUsedDays(3);
      const maternityUsed = getUsedDays(4);

      return {
        employeeId: emp.id,
        employeeCode: emp.employee_code,
        firstName: emp.first_name,
        lastName: emp.last_name,
        departmentName: emp.departments?.name || "Unassigned",
        balances: [
          { leave_type: "Annual Leave", allocated: 20, used: annualUsed, remaining: Math.max(0, 20 - annualUsed) },
          { leave_type: "Sick Leave", allocated: 10, used: sickUsed, remaining: Math.max(0, 10 - sickUsed) },
          { leave_type: "Casual Leave", allocated: 5, used: casualUsed, remaining: Math.max(0, 5 - casualUsed) },
          { leave_type: "Maternity Leave", allocated: 90, used: maternityUsed, remaining: Math.max(0, 90 - maternityUsed) },
        ],
      };
    });
  }
}

export async function cancelLeaveRequest(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from("leaves")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (e) {
    const list = getLocalLeaves();
    const newList = list.filter((r) => r.id !== id);
    setLocalLeaves(newList);
  }
}
