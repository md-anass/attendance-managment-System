"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeShift } from "@/types/shift";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";

interface WeeklyScheduleProps {
  assignments: EmployeeShift[];
}

export default function WeeklySchedule({ assignments }: WeeklyScheduleProps) {
  const [mondayDate, setMondayDate] = React.useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(today.setDate(diff));
    mon.setHours(0, 0, 0, 0);
    return mon;
  });

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const handlePrevWeek = () => {
    const nextMon = new Date(mondayDate);
    nextMon.setDate(mondayDate.getDate() - 7);
    setMondayDate(nextMon);
  };

  const handleNextWeek = () => {
    const nextMon = new Date(mondayDate);
    nextMon.setDate(mondayDate.getDate() + 7);
    setMondayDate(nextMon);
  };

  const formatWeekRange = () => {
    const opt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    const start = mondayDate.toLocaleDateString("en-US", opt);
    const end = weekDays[6].toLocaleDateString("en-US", opt);
    return `${start} - ${end}`;
  };

  const getShiftForDay = (employeeId: number, date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    
    // Find assignment that covers this date
    const match = assignments.find((assign) => {
      if (assign.employee_id !== employeeId) return false;
      if (assign.effective_from > dateStr) return false;
      if (assign.effective_to && assign.effective_to < dateStr) return false;
      return true;
    });

    return match?.shifts || null;
  };

  // Group unique employees in assignments
  const activeAssignments = React.useMemo(() => {
    const map = new Map<number, EmployeeShift>();
    assignments.forEach((assign) => {
      if (assign.employees && !map.has(assign.employee_id)) {
        map.set(assign.employee_id, assign);
      }
    });
    return Array.from(map.values());
  }, [assignments]);

  const daysOfWeekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-xs text-black">
      <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-500" /> Weekly Shift Schedule
        </CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            {formatWeekRange()}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={handlePrevWeek} className="h-8 w-8 hover:bg-slate-100 rounded-lg">
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextWeek} className="h-8 w-8 hover:bg-slate-100 rounded-lg">
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-5">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-200 bg-slate-50/50">
                <TableHead className="font-semibold text-slate-500 w-[200px]">Employee</TableHead>
                {weekDays.map((date, idx) => (
                  <TableHead key={idx} className="font-semibold text-slate-500 text-center">
                    <span className="block text-xs font-bold text-slate-700">{daysOfWeekLabels[idx]}</span>
                    <span className="block text-[10px] text-slate-400 font-medium">{date.getDate()} {date.toLocaleDateString("en-US", { month: "short" })}</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                    No weekly rosters configured.
                  </TableCell>
                </TableRow>
              ) : (
                activeAssignments.map((assign) => {
                  const emp = assign.employees!;
                  const name = `${emp.first_name} ${emp.last_name}`;

                  return (
                    <TableRow key={assign.id} className="border-slate-100 hover:bg-slate-50/30">
                      <TableCell className="w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <EmployeeAvatar
                            firstName={emp.first_name}
                            lastName={emp.last_name}
                            className="h-8 w-8 text-xs shrink-0"
                          />
                          <div className="truncate max-w-[120px]">
                            <p className="font-bold text-slate-800 text-xs truncate">{name}</p>
                            <p className="text-[10px] text-slate-400 font-medium truncate">{emp.designation}</p>
                          </div>
                        </div>
                      </TableCell>
                      {weekDays.map((date, dateIdx) => {
                        const shift = getShiftForDay(assign.employee_id, date);

                        return (
                          <TableCell key={dateIdx} className="p-2 text-center border-l border-slate-50">
                            {shift ? (
                              <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-1.5 text-[10px] font-bold text-blue-700 space-y-0.5">
                                <span className="block truncate max-w-[90px] mx-auto">{shift.name}</span>
                                <span className="block text-[9px] text-blue-500 font-medium">{shift.start_time} - {shift.end_time}</span>
                              </div>
                            ) : (
                              <div className="bg-slate-50/40 border border-dashed border-slate-200/60 rounded-lg py-3 text-[9px] font-bold text-slate-400">
                                Off Duty
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
