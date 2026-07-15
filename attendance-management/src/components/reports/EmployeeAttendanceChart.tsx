"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Clock } from "lucide-react";

interface EmployeeAttendanceChartProps {
  data: Array<{
    date: string;
    hours: number;
    overtime: number;
  }>;
}

export default function EmployeeAttendanceChart({ data }: EmployeeAttendanceChartProps) {
  return (
    <Card className="shadow-xs bg-white border border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-500" />
          <div>
            <CardTitle className="text-base font-bold">Hours Worked History</CardTitle>
            <CardDescription>Daily regular and overtime hours timeline</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-64 w-full">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">
              No historical hours logs found.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="hours" name="Regular Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="overtime" name="Overtime Hours" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
