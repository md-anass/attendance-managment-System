import { Bell } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 text-black">
      <h1 className="text-2xl font-bold">
        Attendance Management System
      </h1>

      <div className="flex items-center gap-6">
        <Bell className="cursor-pointer" />

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-300"></div>

          <div>
            <p className="font-semibold">Admin</p>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;


