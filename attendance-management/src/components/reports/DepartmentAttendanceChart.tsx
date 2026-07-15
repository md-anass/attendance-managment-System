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
import { Building2 } from "lucide-react";

interface DepartmentAttendanceChartProps {
  data: Array<{
    name: string;
    rate: number;
  }>;
}

export default function DepartmentAttendanceChart({ data }: DepartmentAttendanceChartProps) {
  return (
    <Card className="shadow-xs bg-white border border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-slate-500" />
          <div>
            <CardTitle className="text-base font-bold">Department Performance</CardTitle>
            <CardDescription>Average attendance rate per department</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-64 w-full">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">
              No department data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`${val}%`, "Attendance Rate"]}
                />
                <Bar dataKey="rate" fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
