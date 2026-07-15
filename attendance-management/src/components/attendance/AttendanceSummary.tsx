"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AttendanceSummary as SummaryType } from "@/types/attendance";
import { UserCheck, UserX, Clock, Calendar } from "lucide-react";

interface AttendanceSummaryProps {
  summary: SummaryType;
}

export default function AttendanceSummary({ summary }: AttendanceSummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-black">
      {/* Present Today */}
      <Card className="border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 rounded-2xl">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Present Today</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{summary.present}</p>
          </div>
        </CardContent>
      </Card>

      {/* Absent */}
      <Card className="border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 rounded-2xl">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <UserX className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Absent</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{summary.absent}</p>
          </div>
        </CardContent>
      </Card>

      {/* Late */}
      <Card className="border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 rounded-2xl">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Late</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{summary.late}</p>
          </div>
        </CardContent>
      </Card>

      {/* On Leave */}
      <Card className="border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 rounded-2xl">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On Leave</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{summary.onLeave}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
