import { supabase } from "@/lib/supabase";
import { Attendance, AttendanceSummary, AttendanceFilters } from "@/types/attendance";
import { getEmployeeSchedule } from "./shift.service";

const STORAGE_KEY_ATTENDANCE = "ams_local_attendance";

// Mock Fallback Data matching Attendance type
const DEFAULT_ATTENDANCE: Attendance[] = [
  {
    id: 1,
    employee_id: 1,
    attendance_date: new Date().toISOString().split("T")[0],
    check_in: `${new Date().toISOString().split("T")[0]}T08:58:00.000Z`,
    check_out: `${new Date().toISOString().split("T")[0]}T17:02:00.000Z`,
    status: "On Time",
    working_hours: 8.1,
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
    attendance_date: new Date().toISOString().split("T")[0],
    check_in: `${new Date().toISOString().split("T")[0]}T09:15:00.000Z`,
    check_out: null,
    status: "Late",
    working_hours: 0,
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
    employee_id: 3,
    attendance_date: new Date().toISOString().split("T")[0],
    check_in: `${new Date().toISOString().split("T")[0]}T08:45:00.000Z`,
    check_out: `${new Date().toISOString().split("T")[0]}T16:45:00.000Z`,
    status: "On Time",
    working_hours: 8.0,
    employees: {
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
    }
  }
];

function getLocalAttendance(): Attendance[] {
  if (typeof window === "undefined") return DEFAULT_ATTENDANCE;
  const stored = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(DEFAULT_ATTENDANCE));
    return DEFAULT_ATTENDANCE;
  }
  return JSON.parse(stored);
}

function setLocalAttendance(records: Attendance[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(records));
}

function computeWorkingHours(checkIn: string | null, checkOut: string | null): number {
  if (!checkIn || !checkOut) return 0;
  try {
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 ? Math.round(diffHours * 10) / 10 : 0;
  } catch {
    return 0;
  }
}

function computeOvertimeHours(checkOutTimeStr: string, shiftEndTimeStr: string): number {
  try {
    const checkOutDate = new Date(checkOutTimeStr);
    const [h, m] = shiftEndTimeStr.split(":").map(Number);
    const shiftEndLimit = new Date(checkOutDate);
    shiftEndLimit.setHours(h, m, 0, 0);
    
    if (checkOutDate > shiftEndLimit) {
      const diffMs = checkOutDate.getTime() - shiftEndLimit.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return Math.round(diffHours * 10) / 10;
    }
    return 0;
  } catch (e) {
    return 0;
  }
}

function determineCheckInStatus(checkInTimeStr: string, shiftStartTime: string, graceMinutes: number): string {
  try {
    const checkInDate = new Date(checkInTimeStr);
    const [h, m] = shiftStartTime.split(":").map(Number);
    
    const limit = new Date(checkInDate);
    limit.setHours(h, m, 0, 0);
    limit.setMinutes(limit.getMinutes() + graceMinutes);

    return checkInDate > limit ? "Late" : "On Time";
  } catch (e) {
    return "On Time";
  }
}

export async function getDailyAttendance(date: string): Promise<Attendance[]> {
  try {
    const startOfToday = `${date}T00:00:00.000Z`;
    const endOfToday = `${date}T23:59:59.999Z`;

    const { data, error } = await supabase
      .from("attendance")
      .select(`
        id,
        employee_id,
        check_in,
        check_out,
        status,
        shift_name,
        overtime_hours,
        employees (
          id,
          employee_code,
          first_name,
          last_name,
          email,
          phone,
          designation,
          department_id,
          role_id,
          status,
          joining_date
        )
      `)
      .gte("check_in", startOfToday)
      .lte("check_in", endOfToday);

    if (error) throw error;
    
    return data.map((item: any) => ({
      id: Number(item.id),
      employee_id: Number(item.employee_id),
      attendance_date: item.check_in ? item.check_in.split("T")[0] : date,
      check_in: item.check_in,
      check_out: item.check_out,
      status: item.status,
      working_hours: computeWorkingHours(item.check_in, item.check_out),
      overtime_hours: Number(item.overtime_hours || 0),
      shift_name: item.shift_name || "Regular Day Shift",
      employees: Array.isArray(item.employees) ? item.employees[0] : item.employees,
    }));
  } catch (e) {
    const list = getLocalAttendance();
    return list.filter((r) => r.check_in && r.check_in.startsWith(date));
  }
}

export async function getAttendanceHistory(
  filters?: AttendanceFilters,
  page = 1,
  pageSize = 10
): Promise<{ records: Attendance[]; totalCount: number }> {
  try {
    let query = supabase
      .from("attendance")
      .select(`
        id,
        employee_id,
        check_in,
        check_out,
        status,
        shift_name,
        overtime_hours,
        employees (
          id,
          employee_code,
          first_name,
          last_name,
          email,
          phone,
          designation,
          department_id,
          role_id,
          status,
          joining_date
        )
      `, { count: "exact" });

    if (filters?.date) {
      const start = `${filters.date}T00:00:00.000Z`;
      const end = `${filters.date}T23:59:59.999Z`;
      query = query.gte("check_in", start).lte("check_in", end);
    }
    if (filters?.startDate) {
      const start = `${filters.startDate}T00:00:00.000Z`;
      query = query.gte("check_in", start);
    }
    if (filters?.endDate) {
      const end = `${filters.endDate}T23:59:59.999Z`;
      query = query.lte("check_in", end);
    }
    if (filters?.status) {
      if (filters.status === "Present") {
        query = query.in("status", ["On Time", "Present"]);
      } else if (filters.status === "Leave") {
        query = query.in("status", ["On Leave", "Leave"]);
      } else {
        query = query.eq("status", filters.status);
      }
    }
    if (filters?.employeeId) {
      query = query.eq("employee_id", Number(filters.employeeId));
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to).order("check_in", { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    let records = data.map((item: any) => ({
      id: Number(item.id),
      employee_id: Number(item.employee_id),
      attendance_date: item.check_in ? item.check_in.split("T")[0] : "",
      check_in: item.check_in,
      check_out: item.check_out,
      status: item.status,
      working_hours: computeWorkingHours(item.check_in, item.check_out),
      overtime_hours: Number(item.overtime_hours || 0),
      shift_name: item.shift_name || "Regular Day Shift",
      employees: Array.isArray(item.employees) ? item.employees[0] : item.employees,
    }));

    if (filters?.departmentId) {
      records = records.filter(
        (r) => r.employees?.department_id === Number(filters.departmentId)
      );
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      records = records.filter(
        (r) =>
          r.employees?.first_name.toLowerCase().includes(search) ||
          r.employees?.last_name.toLowerCase().includes(search) ||
          r.employees?.employee_code.toLowerCase().includes(search)
      );
    }

    return {
      records,
      totalCount: count || records.length,
    };
  } catch (e) {
    let list = getLocalAttendance();

    if (filters?.date) {
      list = list.filter((r) => r.check_in && r.check_in.startsWith(filters.date!));
    }
    if (filters?.startDate) {
      list = list.filter((r) => r.check_in && r.check_in >= `${filters.startDate!}T00:00:00.000Z`);
    }
    if (filters?.endDate) {
      list = list.filter((r) => r.check_in && r.check_in <= `${filters.endDate!}T23:59:59.999Z`);
    }
    if (filters?.status) {
      const statusLower = filters.status.toLowerCase();
      if (statusLower === "present") {
        list = list.filter((r) => r.status.toLowerCase() === "on time" || r.status.toLowerCase() === "present");
      } else if (statusLower === "leave") {
        list = list.filter((r) => r.status.toLowerCase() === "on leave" || r.status.toLowerCase() === "leave");
      } else {
        list = list.filter((r) => r.status.toLowerCase() === statusLower);
      }
    }
    if (filters?.employeeId) {
      list = list.filter((r) => r.employee_id === Number(filters.employeeId));
    }
    if (filters?.departmentId) {
      list = list.filter((r) => r.employees?.department_id === Number(filters.departmentId));
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.employees?.first_name.toLowerCase().includes(search) ||
          r.employees?.last_name.toLowerCase().includes(search) ||
          r.employees?.employee_code.toLowerCase().includes(search)
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

export async function checkInEmployee(
  employeeId: number,
  checkInTime: string,
  status: string,
  shiftName?: string
): Promise<Attendance> {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .insert({
        employee_id: employeeId,
        check_in: checkInTime,
        status: status,
        shift_name: shiftName,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: Number(data.id),
      employee_id: Number(data.employee_id),
      attendance_date: data.check_in ? data.check_in.split("T")[0] : new Date().toISOString().split("T")[0],
      check_in: data.check_in,
      check_out: data.check_out,
      status: data.status,
      working_hours: 0,
      shift_name: data.shift_name || shiftName || "Regular Day Shift",
      overtime_hours: Number(data.overtime_hours || 0),
    };
  } catch (e) {
    const list = getLocalAttendance();
    const maxId = list.reduce((max, r) => (r.id > max ? r.id : max), 0);
    
    const newRecord: Attendance = {
      id: maxId + 1,
      employee_id: employeeId,
      attendance_date: checkInTime.split("T")[0],
      check_in: checkInTime,
      check_out: null,
      status: status,
      working_hours: 0,
      shift_name: shiftName || "Regular Day Shift",
      overtime_hours: 0,
      employees: {
        id: employeeId,
        employee_code: `EMP00${employeeId}`,
        first_name: "Mock",
        last_name: "Employee",
        email: "mock@example.com",
        department_id: 1,
        role_id: 2,
        status: "active",
        joining_date: "2026-01-01",
        created_at: new Date().toISOString(),
      }
    };
    
    setLocalAttendance([newRecord, ...list]);
    return newRecord;
  }
}

export async function checkOutEmployee(attendanceId: number, checkOutTime: string): Promise<Attendance> {
  let overtime = 0;
  let shiftEndTime = "17:00";
  let empId = 0;
  
  try {
    const record = await getAttendanceRecordById(attendanceId);
    if (record) {
      empId = record.employee_id;
      const schedule = await getEmployeeSchedule(record.employee_id);
      if (schedule && schedule.shifts) {
        shiftEndTime = schedule.shifts.end_time;
        overtime = computeOvertimeHours(checkOutTime, shiftEndTime);
      }
    }
  } catch (err) {
    console.error("Failed to resolve shift for checkout overtime: ", err);
  }

  try {
    const { data, error } = await supabase
      .from("attendance")
      .update({ 
        check_out: checkOutTime,
        overtime_hours: overtime,
      })
      .eq("id", attendanceId)
      .select()
      .single();

    if (error) throw error;
    return {
      id: Number(data.id),
      employee_id: Number(data.employee_id),
      attendance_date: data.check_in ? data.check_in.split("T")[0] : new Date().toISOString().split("T")[0],
      check_in: data.check_in,
      check_out: data.check_out,
      status: data.status,
      working_hours: computeWorkingHours(data.check_in, data.check_out),
      shift_name: data.shift_name || "Regular Day Shift",
      overtime_hours: Number(data.overtime_hours || overtime || 0),
    };
  } catch (e) {
    const list = getLocalAttendance();
    const index = list.findIndex((r) => r.id === attendanceId);
    if (index === -1) throw new Error("Attendance record not found");

    if (empId === 0) empId = list[index].employee_id;
    const schedule = await getEmployeeSchedule(empId);
    if (schedule && schedule.shifts) {
      shiftEndTime = schedule.shifts.end_time;
    }
    const computedOvertime = computeOvertimeHours(checkOutTime, shiftEndTime);

    const updated = {
      ...list[index],
      check_out: checkOutTime,
      working_hours: computeWorkingHours(list[index].check_in, checkOutTime),
      overtime_hours: computedOvertime,
    };
    const newList = [...list];
    newList[index] = updated;
    setLocalAttendance(newList);
    return updated;
  }
}

export async function getAttendanceRecordById(id: number): Promise<Attendance | null> {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select(`
        id,
        employee_id,
        check_in,
        check_out,
        status,
        remarks,
        shift_name,
        overtime_hours,
        employees (
          id,
          employee_code,
          first_name,
          last_name,
          email,
          phone,
          designation,
          department_id,
          role_id,
          status,
          joining_date,
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
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const empData = Array.isArray(data.employees) ? data.employees[0] : data.employees;
    const mappedEmployee = empData ? {
      ...empData,
      departments: Array.isArray(empData.departments) ? empData.departments[0] : empData.departments,
      shifts: Array.isArray(empData.shifts) ? empData.shifts[0] : empData.shifts,
    } : null;

    return {
      id: Number(data.id),
      employee_id: Number(data.employee_id),
      attendance_date: data.check_in ? data.check_in.split("T")[0] : "",
      check_in: data.check_in,
      check_out: data.check_out,
      status: data.status,
      remarks: data.remarks,
      working_hours: computeWorkingHours(data.check_in, data.check_out),
      overtime_hours: Number(data.overtime_hours || 0),
      shift_name: data.shift_name || "Regular Day Shift",
      employees: mappedEmployee,
    };
  } catch (e) {
    const list = getLocalAttendance();
    const record = list.find((r) => r.id === id) || null;
    if (record && record.employees) {
      if (typeof window !== "undefined") {
        const storedDepts = localStorage.getItem("ams_local_departments");
        const storedShifts = localStorage.getItem("ams_local_shifts");
        const depts = storedDepts ? JSON.parse(storedDepts) : [];
        const shifts = storedShifts ? JSON.parse(storedShifts) : [];
        
        record.employees.departments = depts.find((d: any) => d.id === record.employees?.department_id) || null;
        record.employees.shifts = shifts.find((s: any) => s.id === record.employees?.shift_id) || null;
      }
    }
    return record;
  }
}

export async function getDailyAttendanceSummary(date: string): Promise<AttendanceSummary> {
  try {
    const startOfToday = `${date}T00:00:00.000Z`;
    const endOfToday = `${date}T23:59:59.999Z`;

    const [presentRes, lateRes, leaveRes] = await Promise.all([
      supabase.from("attendance").select("id", { count: "exact", head: true }).eq("status", "On Time").gte("check_in", startOfToday).lte("check_in", endOfToday),
      supabase.from("attendance").select("id", { count: "exact", head: true }).eq("status", "Late").gte("check_in", startOfToday).lte("check_in", endOfToday),
      supabase.from("leaves").select("id", { count: "exact", head: true }).eq("status", "Approved").lte("start_date", date).gte("end_date", date),
    ]);

    const { count: totalEmpCount } = await supabase.from("employees").select("*", { count: "exact", head: true });

    const present = presentRes.count || 0;
    const late = lateRes.count || 0;
    const onLeave = leaveRes.count || 0;
    const totalEmployees = totalEmpCount || 10;
    const absent = Math.max(0, totalEmployees - (present + late + onLeave));
    const attendanceRate = totalEmployees > 0 ? Math.round(((present + late) / totalEmployees) * 100) : 100;

    return {
      present,
      late,
      absent,
      onLeave,
      attendanceRate,
    };
  } catch (e) {
    return {
      present: 18,
      late: 2,
      absent: 1,
      onLeave: 1,
      attendanceRate: 95,
    };
  }
}

export async function getTodayAttendance(): Promise<Attendance[]> {
  const todayStr = new Date().toISOString().split("T")[0];
  return getDailyAttendance(todayStr);
}

export async function checkIn(employeeId: number): Promise<Attendance> {
  const now = new Date();
  const checkInTime = now.toISOString();
  
  let shiftName = "Regular Day Shift";
  let shiftStart = "09:00";
  let grace = 15;
  
  try {
    const schedule = await getEmployeeSchedule(employeeId);
    if (schedule && schedule.shifts) {
      shiftName = schedule.shifts.name;
      shiftStart = schedule.shifts.start_time;
      grace = schedule.shifts.grace_minutes;
    }
  } catch (err) {
    console.error("Failed to fetch shift details for check-in: ", err);
  }

  const status = determineCheckInStatus(checkInTime, shiftStart, grace);
  return checkInEmployee(employeeId, checkInTime, status, shiftName);
}

export async function checkOut(employeeId: number): Promise<Attendance> {
  const todayStr = new Date().toISOString().split("T")[0];
  const logs = await getDailyAttendance(todayStr);
  const activeRecord = logs.find((r) => r.employee_id === employeeId && !r.check_out);
  if (!activeRecord) {
    throw new Error("No active check-in record found for today.");
  }
  const now = new Date();
  return checkOutEmployee(activeRecord.id, now.toISOString());
}

export async function markAttendance(data: {
  employee_id: number;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  remarks?: string;
}): Promise<Attendance> {
  try {
    const { data: existing, error: checkError } = await supabase
      .from("attendance")
      .select("id")
      .eq("employee_id", data.employee_id)
      .gte("check_in", `${data.attendance_date}T00:00:00.000Z`)
      .lte("check_in", `${data.attendance_date}T23:59:59.999Z`)
      .maybeSingle();

    let result;
    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from("attendance")
        .update({
          check_in: data.check_in,
          check_out: data.check_out,
          status: data.status,
          remarks: data.remarks,
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (updateError) throw updateError;
      result = updated;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("attendance")
        .insert({
          employee_id: data.employee_id,
          check_in: data.check_in || `${data.attendance_date}T09:00:00.000Z`,
          check_out: data.check_out,
          status: data.status,
          remarks: data.remarks,
        })
        .select()
        .single();
      if (insertError) throw insertError;
      result = inserted;
    }

    return {
      id: Number(result.id),
      employee_id: Number(result.employee_id),
      attendance_date: data.attendance_date,
      check_in: result.check_in,
      check_out: result.check_out,
      status: result.status,
      working_hours: computeWorkingHours(result.check_in, result.check_out),
      remarks: result.remarks,
    };
  } catch (e) {
    const list = getLocalAttendance();
    const existingIndex = list.findIndex(
      (r) =>
        r.employee_id === data.employee_id &&
        r.check_in &&
        r.check_in.startsWith(data.attendance_date)
    );

    if (existingIndex !== -1) {
      const updated = {
        ...list[existingIndex],
        check_in: data.check_in,
        check_out: data.check_out,
        status: data.status,
        remarks: data.remarks,
        working_hours: computeWorkingHours(data.check_in, data.check_out),
      };
      const newList = [...list];
      newList[existingIndex] = updated;
      setLocalAttendance(newList);
      return updated;
    } else {
      const maxId = list.reduce((max, r) => (r.id > max ? r.id : max), 0);
      const newRecord: Attendance = {
        id: maxId + 1,
        employee_id: data.employee_id,
        attendance_date: data.attendance_date,
        check_in: data.check_in || `${data.attendance_date}T09:00:00.000Z`,
        check_out: data.check_out,
        status: data.status,
        working_hours: computeWorkingHours(data.check_in, data.check_out),
        remarks: data.remarks,
        employees: {
          id: data.employee_id,
          employee_code: `EMP00${data.employee_id}`,
          first_name: "Mock",
          last_name: "Employee",
          email: "mock@example.com",
          department_id: 1,
          role_id: 2,
          status: "active",
          joining_date: "2026-01-01",
          created_at: new Date().toISOString(),
        }
      };
      setLocalAttendance([newRecord, ...list]);
      return newRecord;
    }
  }
}

export async function getAttendanceSummary(): Promise<AttendanceSummary> {
  const todayStr = new Date().toISOString().split("T")[0];
  return getDailyAttendanceSummary(todayStr);
}
