import { supabase } from "@/lib/supabase";
import { Shift, EmployeeShift, ShiftInput, EmployeeShiftInput, ShiftFilters } from "@/types/shift";

const STORAGE_KEY_SHIFTS = "ams_local_shifts";
const STORAGE_KEY_SHIFT_ASSIGNMENTS = "ams_local_shift_assignments";

const DEFAULT_SHIFTS: Shift[] = [
  {
    id: 1,
    name: "Regular Day Shift",
    start_time: "09:00",
    end_time: "17:00",
    grace_minutes: 15,
    break_minutes: 60,
    status: "Active",
    description: "Standard morning to evening corporate workday shift profile.",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Evening Swing Shift",
    start_time: "14:00",
    end_time: "22:00",
    grace_minutes: 15,
    break_minutes: 45,
    status: "Active",
    description: "Late afternoon shift primarily supporting operational overlaps.",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Overnight Grave Shift",
    start_time: "22:00",
    end_time: "06:00",
    grace_minutes: 20,
    break_minutes: 30,
    status: "Active",
    description: "Night time shift roster with premium allowance differentials.",
    created_at: new Date().toISOString(),
  }
];

const DEFAULT_SHIFT_ASSIGNMENTS: EmployeeShift[] = [
  {
    id: 1,
    employee_id: 1,
    shift_id: 1,
    effective_from: "2026-01-10",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    employee_id: 2,
    shift_id: 1,
    effective_from: "2026-02-15",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    employee_id: 4,
    shift_id: 2,
    effective_from: "2026-03-01",
    created_at: new Date().toISOString(),
  }
];

function getLocalShifts(): Shift[] {
  if (typeof window === "undefined") return DEFAULT_SHIFTS;
  const stored = localStorage.getItem(STORAGE_KEY_SHIFTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(DEFAULT_SHIFTS));
    return DEFAULT_SHIFTS;
  }
  return JSON.parse(stored);
}

function setLocalShifts(shifts: Shift[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(shifts));
}

function getLocalShiftAssignments(): EmployeeShift[] {
  if (typeof window === "undefined") return DEFAULT_SHIFT_ASSIGNMENTS;
  const stored = localStorage.getItem(STORAGE_KEY_SHIFT_ASSIGNMENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_SHIFT_ASSIGNMENTS, JSON.stringify(DEFAULT_SHIFT_ASSIGNMENTS));
    return DEFAULT_SHIFT_ASSIGNMENTS;
  }
  return JSON.parse(stored);
}

function setLocalShiftAssignments(assigns: EmployeeShift[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_SHIFT_ASSIGNMENTS, JSON.stringify(assigns));
}

// 1. getShifts
export async function getShifts(filters?: ShiftFilters): Promise<Shift[]> {
  try {
    let query = supabase.from("shifts").select("*");
    
    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    if (filters?.status && filters.status !== "All") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query.order("id", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No shifts found in database");

    return data.map((d: any) => ({
      id: Number(d.id),
      name: d.name,
      start_time: d.start_time,
      end_time: d.end_time,
      grace_minutes: Number(d.grace_minutes || d.grace_period || 0),
      break_minutes: Number(d.break_minutes || 0),
      status: d.status || "Active",
      description: d.description || "",
      created_at: d.created_at,
    }));
  } catch (e) {
    let list = getLocalShifts();
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(s));
    }
    if (filters?.status && filters.status !== "All") {
      list = list.filter((item) => item.status === filters.status);
    }
    return list;
  }
}

// 2. getShiftById
export async function getShiftById(id: number): Promise<Shift | null> {
  try {
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: Number(data.id),
      name: data.name,
      start_time: data.start_time,
      end_time: data.end_time,
      grace_minutes: Number(data.grace_minutes || data.grace_period || 0),
      break_minutes: Number(data.break_minutes || 0),
      status: data.status || "Active",
      description: data.description || "",
      created_at: data.created_at,
    };
  } catch (e) {
    const list = getLocalShifts();
    return list.find((item) => item.id === id) || null;
  }
}

// 3. createShift
export async function createShift(data: ShiftInput): Promise<Shift> {
  try {
    const { data: res, error } = await supabase
      .from("shifts")
      .insert({
        name: data.name,
        start_time: data.start_time,
        end_time: data.end_time,
        grace_minutes: data.grace_minutes,
        break_minutes: data.break_minutes,
        status: data.status,
        description: data.description,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...res,
      id: Number(res.id),
      grace_minutes: Number(res.grace_minutes),
      break_minutes: Number(res.break_minutes || 0),
    };
  } catch (e) {
    const list = getLocalShifts();
    const maxId = list.reduce((max, s) => (s.id > max ? s.id : max), 0);
    const newShift: Shift = {
      id: maxId + 1,
      name: data.name,
      start_time: data.start_time,
      end_time: data.end_time,
      grace_minutes: data.grace_minutes,
      break_minutes: data.break_minutes,
      status: data.status,
      description: data.description,
      created_at: new Date().toISOString(),
    };
    setLocalShifts([...list, newShift]);
    return newShift;
  }
}

// 4. updateShift
export async function updateShift(id: number, data: ShiftInput): Promise<Shift> {
  try {
    const { data: res, error } = await supabase
      .from("shifts")
      .update({
        name: data.name,
        start_time: data.start_time,
        end_time: data.end_time,
        grace_minutes: data.grace_minutes,
        break_minutes: data.break_minutes,
        status: data.status,
        description: data.description,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...res,
      id: Number(res.id),
      grace_minutes: Number(res.grace_minutes),
      break_minutes: Number(res.break_minutes || 0),
    };
  } catch (e) {
    const list = getLocalShifts();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Shift profile not found");
    
    const updated = {
      ...list[idx],
      name: data.name,
      start_time: data.start_time,
      end_time: data.end_time,
      grace_minutes: data.grace_minutes,
      break_minutes: data.break_minutes,
      status: data.status,
      description: data.description,
    };
    const newList = [...list];
    newList[idx] = updated;
    setLocalShifts(newList);
    return updated;
  }
}

// 5. deleteShift
export async function deleteShift(id: number): Promise<void> {
  try {
    const { error } = await supabase.from("shifts").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    const list = getLocalShifts();
    const newList = list.filter((s) => s.id !== id);
    setLocalShifts(newList);
  }
}

// 6. getShiftAssignments
export async function getShiftAssignments(): Promise<EmployeeShift[]> {
  try {
    const { data, error } = await supabase
      .from("shift_assignments")
      .select(`
        id,
        employee_id,
        shift_id,
        effective_from,
        effective_to,
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
        ),
        shifts (
          id,
          name,
          start_time,
          end_time,
          grace_minutes,
          break_minutes,
          status,
          description
        )
      `);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No shift assignments found");

    return data.map((d: any) => ({
      id: Number(d.id),
      employee_id: Number(d.employee_id),
      shift_id: Number(d.shift_id),
      effective_from: d.effective_from,
      effective_to: d.effective_to || undefined,
      created_at: d.created_at,
      employees: Array.isArray(d.employees) ? d.employees[0] : d.employees,
      shifts: Array.isArray(d.shifts) ? d.shifts[0] : d.shifts,
    }));
  } catch (e) {
    const list = getLocalShiftAssignments();
    
    let emps: any[] = [];
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ams_local_employees");
      emps = stored ? JSON.parse(stored) : [];
    }

    const shifts = getLocalShifts();

    return list.map((assign) => {
      const matchedEmp = emps.find((emp) => emp.id === assign.employee_id) || undefined;
      const matchedShift = shifts.find((s) => s.id === assign.shift_id) || undefined;
      return {
        ...assign,
        employees: matchedEmp,
        shifts: matchedShift,
      };
    });
  }
}

// 7. assignShift
export async function assignShift(
  employeeId: number,
  shiftId: number,
  effectiveFrom?: string,
  effectiveTo?: string
): Promise<EmployeeShift> {
  const effFrom = effectiveFrom || new Date().toISOString().split("T")[0];
  try {
    const { data: res, error } = await supabase
      .from("shift_assignments")
      .insert({
        employee_id: employeeId,
        shift_id: shiftId,
        effective_from: effFrom,
        effective_to: effectiveTo,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...res,
      id: Number(res.id),
      employee_id: Number(res.employee_id),
      shift_id: Number(res.shift_id),
      effective_from: res.effective_from,
      effective_to: res.effective_to || undefined,
    };
  } catch (e) {
    const list = getLocalShiftAssignments();
    const maxId = list.reduce((max, s) => (s.id > max ? s.id : max), 0);
    
    const filteredList = list.filter((s) => s.employee_id !== employeeId);
    
    let emps: any[] = [];
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ams_local_employees");
      emps = stored ? JSON.parse(stored) : [];
    }
    const shifts = getLocalShifts();
    const matchedEmp = emps.find((emp) => emp.id === employeeId) || undefined;
    const matchedShift = shifts.find((s) => s.id === shiftId) || undefined;

    const newAssign: EmployeeShift = {
      id: maxId + 1,
      employee_id: employeeId,
      shift_id: shiftId,
      effective_from: effFrom,
      effective_to: effectiveTo,
      created_at: new Date().toISOString(),
      employees: matchedEmp,
      shifts: matchedShift,
    };
    
    if (typeof window !== "undefined" && matchedEmp) {
      const updatedEmps = emps.map((emp) => {
        if (emp.id === employeeId) {
          return { ...emp, shift_id: shiftId };
        }
        return emp;
      });
      localStorage.setItem("ams_local_employees", JSON.stringify(updatedEmps));
    }

    setLocalShiftAssignments([...filteredList, newAssign]);
    return newAssign;
  }
}

// 8. getEmployeeSchedule
export async function getEmployeeSchedule(employeeId: number): Promise<EmployeeShift | null> {
  try {
    const { data, error } = await supabase
      .from("shift_assignments")
      .select(`
        id,
        employee_id,
        shift_id,
        effective_from,
        effective_to,
        created_at,
        shifts (
          id,
          name,
          start_time,
          end_time,
          grace_minutes,
          break_minutes,
          status,
          description
        )
      `)
      .eq("employee_id", employeeId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: Number(data.id),
      employee_id: Number(data.employee_id),
      shift_id: Number(data.shift_id),
      effective_from: data.effective_from,
      effective_to: data.effective_to || undefined,
      created_at: data.created_at,
      shifts: Array.isArray(data.shifts) ? data.shifts[0] : data.shifts,
    };
  } catch (e) {
    const list = getLocalShiftAssignments();
    const match = list.find((s) => s.employee_id === employeeId) || null;
    if (!match) return null;
    const shifts = getLocalShifts();
    const matchedShift = shifts.find((s) => s.id === match.shift_id) || undefined;
    return {
      ...match,
      shifts: matchedShift,
    };
  }
}

// 9. getWeeklySchedule
export async function getWeeklySchedule(): Promise<EmployeeShift[]> {
  return getShiftAssignments();
}

// 10. assignShiftBulk
export async function assignShiftBulk(
  employeeIds: number[],
  shiftId: number,
  effectiveFrom?: string,
  effectiveTo?: string
): Promise<EmployeeShift[]> {
  const promises = employeeIds.map((empId) =>
    assignShift(empId, shiftId, effectiveFrom, effectiveTo)
  );
  return Promise.all(promises);
}
