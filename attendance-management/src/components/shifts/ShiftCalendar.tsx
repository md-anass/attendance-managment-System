"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeShift } from "@/types/shift";

interface ShiftCalendarProps {
  assignments: EmployeeShift[];
}

export default function ShiftCalendar({ assignments }: ShiftCalendarProps) {
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

  const getAssignmentsForDay = (day: number) => {
    const yyyy = String(year);
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    return assignments.filter((assign) => {
      if (assign.effective_from > dateStr) return false;
      if (assign.effective_to && assign.effective_to < dateStr) return false;
      return true;
    });
  };

  const renderCells = () => {
    const cells = [];

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-[72px] bg-slate-50/30 border border-slate-100/50" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const activeAssigns = getAssignmentsForDay(day);
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;

      cells.push(
        <div
          key={`day-${day}`}
          className={`min-h-[72px] p-2 border border-slate-100 flex flex-col justify-between group transition-colors hover:bg-slate-50/50 ${
            isToday ? "bg-blue-50/20 border-blue-200" : "bg-white"
          }`}
        >
          <div>
            <span
              className={`text-xs font-bold ${
                isToday
                  ? "bg-blue-600 text-white h-5 w-5 rounded-full flex items-center justify-center"
                  : "text-slate-500"
              }`}
            >
              {day}
            </span>
          </div>

          <div className="space-y-1 mt-1 overflow-y-auto max-h-[44px] scrollbar-thin">
            {activeAssigns.map((assign) => {
              const name = assign.employees
                ? `${assign.employees.first_name[0]}. ${assign.employees.last_name}`
                : "Emp";
              const shiftName = assign.shifts?.name || "Shift";

              return (
                <div
                  key={assign.id}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-100 bg-blue-50/50 text-blue-700 truncate flex items-center gap-0.5"
                  title={`${assign.employees ? `${assign.employees.first_name} ${assign.employees.last_name}` : "Unknown"} - ${shiftName}`}
                >
                  <User className="h-2 w-2 shrink-0 text-blue-500" />
                  <span className="truncate">{name}: {shiftName}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const totalCells = firstDayIndex + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) {
      cells.push(<div key={`empty-end-${i}`} className="min-h-[72px] bg-slate-50/30 border border-slate-100/50" />);
    }

    return cells;
  };

  return (
    <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-xs text-black">
      <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-500" /> Monthly Shift Calendar • {monthNames[month]} {year}
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8 hover:bg-slate-100 rounded-lg">
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8 hover:bg-slate-100 rounded-lg">
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-5">
        <div className="grid grid-cols-7 gap-0 border-t border-l border-slate-100 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 py-1.5">
          <div className="border-r border-slate-100">Sun</div>
          <div className="border-r border-slate-100">Mon</div>
          <div className="border-r border-slate-100">Tue</div>
          <div className="border-r border-slate-100">Wed</div>
          <div className="border-r border-slate-100">Thu</div>
          <div className="border-r border-slate-100">Fri</div>
          <div className="border-r border-slate-100">Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-0 border-r border-b border-slate-100">
          {renderCells()}
        </div>
      </CardContent>
    </Card>
  );
}
