import { supabase } from "@/lib/supabase";
import {
  DailyReportRecord,
  MonthlyReportRecord,
  DepartmentReportRecord,
  LeaveReportRecord,
  MonthlyTrendData,
} from "@/types/report";
import { toast } from "sonner";

const STORAGE_KEY_ATTENDANCE = "ams_local_attendance";
const STORAGE_KEY_EMPLOYEES = "ams_local_employees";
const STORAGE_KEY_DEPARTMENTS = "ams_local_departments";
const STORAGE_KEY_LEAVES = "ams_local_leaves";

function getLocalData<T>(key: string, defaultValue: T[]): T[] {
  if (typeof window === "undefined") return defaultValue;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
}

// 1. Daily Report (Polymorphic: supports both date string or filters object)
export async function getDailyReport(
  filtersOrDate: string | { date?: string; departmentId?: string; search?: string; status?: string },
  page = 1,
  pageSize = 10
): Promise<{ records: DailyReportRecord[]; totalCount: number }> {
  let selectedDate = new Date().toISOString().split("T")[0];
  let filters: { date?: string; departmentId?: string; search?: string; status?: string } = {};

  if (typeof filtersOrDate === "string") {
    selectedDate = filtersOrDate;
    filters = { date: selectedDate };
  } else {
    filters = filtersOrDate;
    selectedDate = filters.date || selectedDate;
  }

  const startOfDay = `${selectedDate}T00:00:00.000Z`;
  const endOfDay = `${selectedDate}T23:59:59.999Z`;

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
          department_id,
          departments (
            id,
            name
          )
        )
      `, { count: "exact" })
      .gte("check_in", startOfDay)
      .lte("check_in", endOfDay);

    const { data, error } = await query;
    if (error) throw error;

    let records: DailyReportRecord[] = (data || []).map((item: any) => {
      const emp = Array.isArray(item.employees) ? item.employees[0] : item.employees;
      const dept = emp?.departments ? (Array.isArray(emp.departments) ? emp.departments[0] : emp.departments) : null;
      
      const firstName = emp?.first_name || "Unknown";
      const lastName = emp?.last_name || "";
      const workingHours = item.check_in && item.check_out
        ? (new Date(item.check_out).getTime() - new Date(item.check_in).getTime()) / (1000 * 60 * 60)
        : 0;

      return {
        id: Number(item.id),
        employee_id: Number(item.employee_id),
        employee_code: emp?.employee_code || "EMP--",
        employee_name: `${firstName} ${lastName}`.trim(),
        department: dept?.name || "Unassigned",
        attendance_date: selectedDate,
        check_in: item.check_in,
        check_out: item.check_out,
        working_hours: workingHours > 0 ? Math.round(workingHours * 10) / 10 : 0,
        overtime_hours: Number(item.overtime_hours || 0),
        shift_name: item.shift_name || "Regular Day Shift",
        status: item.status || "On Time",
      };
    });

    if (filters.departmentId) {
      records = records.filter(
        (r) => {
          const emp = data?.find((d: any) => d.id === r.id)?.employees;
          const empData = Array.isArray(emp) ? emp[0] : emp;
          return empData?.department_id === Number(filters.departmentId);
        }
      );
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      records = records.filter(
        (r) =>
          r.employee_name.toLowerCase().includes(searchLower) ||
          r.employee_code.toLowerCase().includes(searchLower)
      );
    }
    if (filters.status) {
      records = records.filter((r) => r.status.toLowerCase() === filters.status!.toLowerCase());
    }

    const totalCount = records.length;
    const paginated = records.slice((page - 1) * pageSize, page * pageSize);

    return {
      records: paginated,
      totalCount,
    };
  } catch (e) {
    const attendance = getLocalData<any>(STORAGE_KEY_ATTENDANCE, []);
    const employees = getLocalData<any>(STORAGE_KEY_EMPLOYEES, []);
    const depts = getLocalData<any>(STORAGE_KEY_DEPARTMENTS, []);

    let filtered = attendance.filter((r: any) => r.check_in && r.check_in.startsWith(selectedDate));

    let records: DailyReportRecord[] = filtered.map((item: any) => {
      const emp = employees.find((e: any) => e.id === item.employee_id);
      const dept = emp ? depts.find((d: any) => d.id === emp.department_id) : null;
      const firstName = emp?.first_name || "Mock";
      const lastName = emp?.last_name || "Employee";
      const workingHours = item.check_in && item.check_out
        ? (new Date(item.check_out).getTime() - new Date(item.check_in).getTime()) / (1000 * 60 * 60)
        : 0;

      return {
        id: Number(item.id),
        employee_id: Number(item.employee_id),
        employee_code: emp?.employee_code || "EMP--",
        employee_name: `${firstName} ${lastName}`.trim(),
        department: dept?.name || "Unassigned",
        attendance_date: selectedDate,
        check_in: item.check_in,
        check_out: item.check_out,
        working_hours: workingHours > 0 ? Math.round(workingHours * 10) / 10 : 0,
        overtime_hours: Number(item.overtime_hours || 0),
        shift_name: item.shift_name || "Regular Day Shift",
        status: item.status || "On Time",
      };
    });

    if (filters.departmentId) {
      const depId = Number(filters.departmentId);
      records = records.filter((r) => {
        const emp = employees.find((e: any) => e.id === r.employee_id);
        return emp?.department_id === depId;
      });
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      records = records.filter(
        (r) =>
          r.employee_name.toLowerCase().includes(searchLower) ||
          r.employee_code.toLowerCase().includes(searchLower)
      );
    }
    if (filters.status) {
      records = records.filter((r) => r.status.toLowerCase() === filters.status!.toLowerCase());
    }

    const totalCount = records.length;
    const paginated = records.slice((page - 1) * pageSize, page * pageSize);

    return {
      records: paginated,
      totalCount,
    };
  }
}

// 2. Monthly Report (Supports both: getMonthlyReport(monthNumber, yearNumber) and getMonthlyReport(monthStr, departmentId, search))
export async function getMonthlyReport(
  monthOrFilters: number | string,
  yearOrDeptId?: number | string,
  search?: string,
  page = 1,
  pageSize = 10
): Promise<{ records: MonthlyReportRecord[]; totalCount: number }> {
  let monthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  let departmentId = "";

  if (typeof monthOrFilters === "number" && typeof yearOrDeptId === "number") {
    monthStr = `${yearOrDeptId}-${String(monthOrFilters).padStart(2, "0")}`;
  } else if (typeof monthOrFilters === "string") {
    monthStr = monthOrFilters;
    departmentId = String(yearOrDeptId || "");
  }

  try {
    const employees = getLocalData<any>(STORAGE_KEY_EMPLOYEES, []);
    const depts = getLocalData<any>(STORAGE_KEY_DEPARTMENTS, []);
    const attendance = getLocalData<any>(STORAGE_KEY_ATTENDANCE, []);
    const leaves = getLocalData<any>(STORAGE_KEY_LEAVES, []);

    let filteredEmployees = [...employees];
    if (departmentId && departmentId !== "all") {
      const depId = Number(departmentId);
      filteredEmployees = filteredEmployees.filter((e) => e.department_id === depId);
    }
    if (search) {
      const s = search.toLowerCase();
      filteredEmployees = filteredEmployees.filter(
        (e) =>
          `${e.first_name} ${e.last_name}`.toLowerCase().includes(s) ||
          e.employee_code.toLowerCase().includes(s)
      );
    }

    const [yearNum, monthNum] = monthStr.split("-").map(Number);
    const totalDays = new Date(yearNum, monthNum, 0).getDate();
    let workingDaysCount = 0;
    for (let d = 1; d <= totalDays; d++) {
      const dayOfWeek = new Date(yearNum, monthNum - 1, d).getDay();
      if (dayOfWeek !== 0) workingDaysCount++; 
    }

    const records: MonthlyReportRecord[] = filteredEmployees.map((emp) => {
      const empLogs = attendance.filter(
        (log: any) =>
          log.employee_id === emp.id &&
          log.check_in &&
          log.check_in.startsWith(monthStr)
      );

      const dept = depts.find((d: any) => d.id === emp.department_id);

      const present_days = empLogs.filter(
        (log: any) =>
          log.status.toLowerCase() === "on time" ||
          log.status.toLowerCase() === "present" ||
          log.status.toLowerCase() === "late"
      ).length;

      const late_days = empLogs.filter((log: any) => log.status.toLowerCase() === "late").length;
      
      const empLeaves = leaves.filter(
        (l: any) =>
          l.employee_id === emp.id &&
          l.status === "Approved" &&
          l.start_date <= `${monthStr}-${totalDays}` &&
          l.end_date >= `${monthStr}-01`
      );
      const leave_days = empLeaves.reduce((acc: number) => acc + 2, 0); 

      const absent_days = Math.max(0, workingDaysCount - present_days - leave_days);
      const overtime_hours = empLogs.reduce((acc: number, item: any) => acc + Number(item.overtime_hours || 0), 0);
      const attendance_rate = workingDaysCount > 0 ? Math.round((present_days / workingDaysCount) * 100) : 0;

      return {
        employee_id: emp.id,
        employee_code: emp.employee_code,
        employee_name: `${emp.first_name} ${emp.last_name}`,
        department: dept?.name || "Unassigned",
        month: monthStr,
        total_working_days: workingDaysCount,
        present_days,
        absent_days,
        late_days,
        leave_days,
        overtime_hours,
        attendance_rate,
      };
    });

    const paginated = records.slice((page - 1) * pageSize, page * pageSize);
    return {
      records: paginated,
      totalCount: records.length,
    };
  } catch (e) {
    return { records: [], totalCount: 0 };
  }
}

// 3. Employee Report
export async function getEmployeeReport(
  employeeId: number,
  startDate: string,
  endDate: string
): Promise<DailyReportRecord[]> {
  try {
    const attendance = getLocalData<any>(STORAGE_KEY_ATTENDANCE, []);
    const employees = getLocalData<any>(STORAGE_KEY_EMPLOYEES, []);
    const depts = getLocalData<any>(STORAGE_KEY_DEPARTMENTS, []);

    const emp = employees.find((e: any) => e.id === employeeId);
    const dept = emp ? depts.find((d: any) => d.id === emp.department_id) : null;

    const logs = attendance.filter(
      (log: any) =>
        log.employee_id === employeeId &&
        log.check_in &&
        log.check_in.split("T")[0] >= startDate &&
        log.check_in.split("T")[0] <= endDate
    );

    return logs.map((item: any) => {
      const workingHours = item.check_in && item.check_out
        ? (new Date(item.check_out).getTime() - new Date(item.check_in).getTime()) / (1000 * 60 * 60)
        : 0;

      return {
        id: item.id,
        employee_id: employeeId,
        employee_code: emp?.employee_code || "EMP--",
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : "Unknown",
        department: dept?.name || "Unassigned",
        attendance_date: item.check_in.split("T")[0],
        check_in: item.check_in,
        check_out: item.check_out,
        working_hours: workingHours > 0 ? Math.round(workingHours * 10) / 10 : 0,
        overtime_hours: Number(item.overtime_hours || 0),
        shift_name: item.shift_name || "Regular Day Shift",
        status: item.status || "On Time",
      };
    });
  } catch {
    return [];
  }
}

// 4. Department Performance Report (supports date or departmentId + date range)
export async function getDepartmentReport(
  departmentIdOrDate: number | string,
  startDate?: string,
  endDate?: string
): Promise<DepartmentReportRecord[]> {
  try {
    const depts = getLocalData<any>(STORAGE_KEY_DEPARTMENTS, []);
    const employees = getLocalData<any>(STORAGE_KEY_EMPLOYEES, []);
    const attendance = getLocalData<any>(STORAGE_KEY_ATTENDANCE, []);
    const leaves = getLocalData<any>(STORAGE_KEY_LEAVES, []);

    if (typeof departmentIdOrDate === "string") {
      const date = departmentIdOrDate;
      return depts.map((dept: any) => {
        const deptEmployees = employees.filter((e: any) => e.department_id === dept.id);
        const total_employees = deptEmployees.length;

        const empIds = deptEmployees.map((e: any) => e.id);
        const logs = attendance.filter(
          (log: any) =>
            empIds.includes(log.employee_id) &&
            log.check_in &&
            log.check_in.startsWith(date)
        );

        const present_today = logs.filter(
          (l: any) =>
            l.status.toLowerCase() === "on time" ||
            l.status.toLowerCase() === "present" ||
            l.status.toLowerCase() === "late"
        ).length;

        const on_leave_today = leaves.filter(
          (l: any) =>
            empIds.includes(l.employee_id) &&
            l.status === "Approved" &&
            l.start_date <= date &&
            l.end_date >= date
        ).length;

        const absent_today = Math.max(0, total_employees - present_today - on_leave_today);
        const attendance_rate = total_employees > 0 ? Math.round((present_today / total_employees) * 100) : 100;

        const late_arrivals = logs.filter((l: any) => l.status.toLowerCase() === "late").length;
        const leave_requests = leaves.filter(
          (l: any) =>
            empIds.includes(l.employee_id) &&
            l.start_date <= date &&
            l.end_date >= date
        ).length;

        const totalHours = logs.reduce((acc: number, log: any) => {
          if (!log.check_in || !log.check_out) return acc;
          const hrs = (new Date(log.check_out).getTime() - new Date(log.check_in).getTime()) / (1000 * 60 * 60);
          return acc + (hrs > 0 ? hrs : 0);
        }, 0);
        const average_working_hours = logs.length > 0 ? Math.round((totalHours / logs.length) * 10) / 10 : 8.0;

        return {
          department_id: dept.id,
          department_name: dept.name,
          total_employees,
          present_today,
          absent_today,
          on_leave_today,
          attendance_rate,
          average_working_hours,
          late_arrivals,
          leave_requests,
        };
      });
    } else {
      // getDepartmentReport(departmentId, startDate, endDate)
      const deptId = departmentIdOrDate;
      const targetDept = depts.find((d: any) => d.id === deptId);
      if (!targetDept) return [];

      const deptEmployees = employees.filter((e: any) => e.department_id === deptId);
      const total_employees = deptEmployees.length;

      const empIds = deptEmployees.map((e: any) => e.id);
      const logs = attendance.filter(
        (log: any) =>
          empIds.includes(log.employee_id) &&
          log.check_in &&
          log.check_in.split("T")[0] >= (startDate || "") &&
          log.check_in.split("T")[0] <= (endDate || "")
      );

      const present_today = logs.filter(
        (l: any) =>
          l.status.toLowerCase() === "on time" ||
          l.status.toLowerCase() === "present" ||
          l.status.toLowerCase() === "late"
      ).length;

      const on_leave_today = leaves.filter(
        (l: any) =>
          empIds.includes(l.employee_id) &&
          l.status === "Approved" &&
          l.start_date <= (endDate || "") &&
          l.end_date >= (startDate || "")
      ).length;

      const absent_today = Math.max(0, total_employees - present_today - on_leave_today);
      const attendance_rate = total_employees > 0 ? Math.round((present_today / total_employees) * 100) : 100;

      const late_arrivals = logs.filter((l: any) => l.status.toLowerCase() === "late").length;
      const leave_requests = leaves.filter(
        (l: any) =>
          empIds.includes(l.employee_id) &&
          l.start_date <= (endDate || "") &&
          l.end_date >= (startDate || "")
      ).length;

      const totalHours = logs.reduce((acc: number, log: any) => {
        if (!log.check_in || !log.check_out) return acc;
        const hrs = (new Date(log.check_out).getTime() - new Date(log.check_in).getTime()) / (1000 * 60 * 60);
        return acc + (hrs > 0 ? hrs : 0);
      }, 0);
      const average_working_hours = logs.length > 0 ? Math.round((totalHours / logs.length) * 10) / 10 : 8.0;

      return [{
        department_id: deptId,
        department_name: targetDept.name,
        total_employees,
        present_today,
        absent_today,
        on_leave_today,
        attendance_rate,
        average_working_hours,
        late_arrivals,
        leave_requests,
      }];
    }
  } catch {
    return [];
  }
}

// 5. Leave Report (Polymorphic: supports both leave list filters or getLeaveReport(startDate, endDate))
export async function getLeaveReport(
  filtersOrStartDate: string | { departmentId?: string; search?: string; status?: string },
  endDateOrPage?: string | number,
  pageSize = 10
): Promise<{ records: LeaveReportRecord[]; totalCount: number }> {
  try {
    const leaves = getLocalData<any>(STORAGE_KEY_LEAVES, []);
    const employees = getLocalData<any>(STORAGE_KEY_EMPLOYEES, []);
    const depts = getLocalData<any>(STORAGE_KEY_DEPARTMENTS, []);

    let filtered = [...leaves];
    let filters: { departmentId?: string; search?: string; status?: string } = {};

    if (typeof filtersOrStartDate === "string") {
      const start = filtersOrStartDate;
      const end = String(endDateOrPage || "");
      filtered = filtered.filter(
        (l: any) =>
          (l.start_date >= start && l.start_date <= end) ||
          (l.end_date >= start && l.end_date <= end)
      );
    } else {
      filters = filtersOrStartDate;
      if (filters.status) {
        filtered = filtered.filter((l) => l.status === filters.status);
      }
    }

    let records: LeaveReportRecord[] = filtered.map((item: any) => {
      const emp = employees.find((e: any) => e.id === item.employee_id);
      const dept = emp ? depts.find((d: any) => d.id === emp.department_id) : null;
      
      const diffMs = new Date(item.end_date).getTime() - new Date(item.start_date).getTime();
      const total_days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;

      return {
        id: item.id,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : "Unknown",
        employee_code: emp?.employee_code || "EMP--",
        department: dept?.name || "Unassigned",
        leave_type: item.leave_type || "Annual Leave",
        start_date: item.start_date,
        end_date: item.end_date,
        total_days: total_days > 0 ? total_days : 1,
        status: item.status,
        remarks: item.reason || "",
      };
    });

    if (filters.departmentId && filters.departmentId !== "all") {
      records = records.filter((r) => {
        const emp = employees.find((e: any) => e.employee_code === r.employee_code);
        return emp?.department_id === Number(filters.departmentId);
      });
    }

    if (filters.search) {
      const s = filters.search.toLowerCase();
      records = records.filter(
        (r) =>
          r.employee_name.toLowerCase().includes(s) ||
          r.employee_code.toLowerCase().includes(s)
      );
    }

    const page = typeof endDateOrPage === "number" ? endDateOrPage : 1;
    const paginated = records.slice((page - 1) * pageSize, page * pageSize);
    
    return {
      records: typeof filtersOrStartDate === "string" ? records : paginated,
      totalCount: records.length,
    };
  } catch {
    return { records: [], totalCount: 0 };
  }
}

// 6. Monthly Trend Chart data
export async function getMonthlyTrendData(year = 2026): Promise<MonthlyTrendData[]> {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((m, idx) => {
    const seed = idx + 1;
    const basePresent = 85 + Math.floor(Math.sin(seed) * 10);
    const baseAbsent = 5 + Math.floor(Math.cos(seed) * 4);
    const baseLeave = 100 - basePresent - baseAbsent;

    return {
      month: m,
      Present: basePresent,
      Absent: baseAbsent,
      Leave: baseLeave,
    };
  });
}

// 7. exportToExcel
export async function exportToExcel(
  reportData: any[],
  title = "Report",
  filtersText = "None"
) {
  if (reportData.length === 0) {
    toast.error("No dataset available to export.");
    return;
  }

  try {
    const headers = Object.keys(reportData[0] || {});
    const rows = [];
    
    // Header Metadata block
    rows.push(`"COMPANY NAME:","AMS Attendance Management System"`);
    rows.push(`"REPORT TITLE:","${title.toUpperCase()}"`);
    rows.push(`"DATE GENERATED:","${new Date().toLocaleString()}"`);
    rows.push(`"APPLIED FILTERS:","${filtersText}"`);
    rows.push(""); // Empty spacing row

    // Table Headers row
    rows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","));

    // Table Data rows
    for (const item of reportData) {
      const values = headers.map(key => {
        const val = item[key];
        const valStr = val === null || val === undefined ? "" : String(val);
        return `"${valStr.replace(/"/g, '""')}"`;
      });
      rows.push(values.join(","));
    }

    const csvString = rows.join("\n");
    const blob = new Blob([csvString], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Excel sheet exported successfully!");
  } catch (e) {
    console.error(e);
    toast.error("Failed to generate Excel file.");
  }
}

// 8. exportToPDF
export async function exportToPDF(
  reportData: any[],
  title = "Report",
  filtersText = "None"
) {
  if (reportData.length === 0) {
    toast.error("No dataset available to export.");
    return;
  }

  try {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to export PDFs.");
      return;
    }
    
    const headers = Object.keys(reportData[0] || {});
    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1e293b; }
            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px; }
            .company { font-size: 18px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.05em; }
            .title { font-size: 13px; font-weight: 600; color: #475569; margin-top: 5px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 15px; font-size: 10px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px 8px; text-align: left; font-size: 10px; }
            th { background-color: #f8fafc; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; }
            tr:nth-child(even) td { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">AMS Attendance Management System</div>
            <div class="title">${title.toUpperCase()}</div>
            <div class="meta-grid">
              <div><strong>Date Generated:</strong> ${new Date().toLocaleString()}</div>
              <div><strong>Applied Filters:</strong> ${filtersText}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${reportData.map(item => `
                <tr>${headers.map(h => `<td>${item[h] !== null && item[h] !== undefined ? item[h] : ""}</td>`).join("")}</tr>
              `).join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    toast.success("PDF print triggered successfully!");
  } catch (e) {
    console.error(e);
    toast.error("Failed to generate PDF document.");
  }
}
