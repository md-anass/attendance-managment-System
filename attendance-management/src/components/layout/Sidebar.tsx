"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Clock3,
  Plane,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Employees", href: "/employees", icon: Users },
  { title: "Departments", href: "/departments", icon: Building2 },
  { title: "Attendance", href: "/attendance", icon: CalendarCheck },
  { title: "Shifts", href: "/shifts", icon: Clock3 },
  { title: "Leave", href: "/leave", icon: Plane },
  { title: "Holidays", href: "/holidays", icon: Calendar },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white">
      <div className="p-6 text-xl font-bold border-b border-slate-700">
        AMS
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                pathname === item.href
                  ? "bg-blue-600"
                  : "hover:bg-slate-800"
              }`}
            >
              <Icon size={20} />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;

