"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlignLeft, ShieldCheck, Coffee, ToggleLeft } from "lucide-react";
import { Shift } from "@/types/shift";

interface ShiftCardProps {
  shift: Shift;
}

export default function ShiftCard({ shift }: ShiftCardProps) {
  return (
    <Card className="border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 rounded-2xl text-black">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-lg">{shift.name}</h4>
              <p className="text-xs text-slate-400 font-semibold">Shift Profile Template</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              shift.status === "Active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }
          >
            {shift.status}
          </Badge>
        </div>

        {/* Details stack */}
        <div className="space-y-2.5 pt-1 text-sm font-semibold text-slate-600">
          <div className="flex justify-between items-center bg-slate-50/30 px-3 py-2 rounded-xl">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" /> Start Time:
            </span>
            <span className="text-slate-800 font-bold">{shift.start_time}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-50/30 px-3 py-2 rounded-xl">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" /> End Time:
            </span>
            <span className="text-slate-800 font-bold">{shift.end_time}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-50/30 px-3 py-2 rounded-xl">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-slate-400" /> Grace Period:
            </span>
            <span className="text-slate-800 font-bold">{shift.grace_minutes} mins</span>
          </div>

          <div className="flex justify-between items-center bg-slate-50/30 px-3 py-2 rounded-xl">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Coffee className="h-4 w-4 text-slate-400" /> Break Duration:
            </span>
            <span className="text-slate-800 font-bold">{shift.break_minutes} mins</span>
          </div>
        </div>

        {/* Description */}
        {shift.description && (
          <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 font-medium leading-relaxed flex gap-2">
            <AlignLeft className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p>{shift.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
