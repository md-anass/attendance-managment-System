"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttendanceCalendarProps {
  employeeId?: number;
}

export default function AttendanceCalendar({ employeeId }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getMockDayStatus = (day: number) => {
    const today = new Date();
    const cellDate = new Date(year, month, day);
    
    if (cellDate > today) return 0;
    
    const dayOfWeek = cellDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return 0;
    
    if (day % 15 === 0) return 3;
    if (day % 11 === 0) return 4;
    if (day % 7 === 0) return 2;
    return 1;
  };

  const renderCells = () => {
    const cells = [];
    
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="h-10 w-full" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const status = getMockDayStatus(day);
      let statusColor = "bg-slate-50 text-slate-400 hover:bg-slate-100";
      
      if (status === 1) {
        statusColor = "bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-100";
      } else if (status === 2) {
        statusColor = "bg-amber-50 border border-amber-200 text-amber-700 font-bold hover:bg-amber-100";
      } else if (status === 3) {
        statusColor = "bg-rose-50 border border-rose-200 text-rose-700 font-bold hover:bg-rose-100";
      } else if (status === 4) {
        statusColor = "bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100";
      }

      cells.push(
        <div
          key={`day-${day}`}
          className={`h-10 w-full flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer select-none ${statusColor}`}
          title={
            status === 1 ? "Present (On Time)" : 
            status === 2 ? "Late" : 
            status === 3 ? "Absent" : 
            status === 4 ? "On Leave" : "No record"
          }
        >
          {day}
        </div>
      );
    }

    return cells;
  };

  return (
    <Card className="border border-slate-200 bg-white p-6 shadow-xs text-black">
      <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold text-slate-800">
          {monthNames[month]} {year}
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8 hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8 hover:bg-slate-100">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-6">
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {renderCells()}
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-md bg-emerald-50 border border-emerald-200" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-md bg-amber-50 border border-amber-200" />
            <span>Late</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-md bg-rose-50 border border-rose-200" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-md bg-indigo-50 border border-indigo-200" />
            <span>On Leave</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
