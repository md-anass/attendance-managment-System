export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeave: number;
}

export interface AttendanceRecord {
  name: string;
  role: string;
  checkIn: string;
  checkOut: string;
  status: string;
  hours: string;
  initials: string;
}

export interface Holiday {
  name: string;
  date: string;
  day: string;
}

export interface LeaveRequest {
  name: string;
  type: string;
  dates: string;
  days: string;
  status: string;
  initials: string;
}
