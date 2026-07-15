"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface AttendanceChartProps {
  data: Array<{
    name: string;
    Present: number;
    Absent: number;
    Leave: number;
  }>;
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <Card className="shadow-xs bg-white border border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Attendance Overview</CardTitle>
            <CardDescription>Line chart overview for the past 7 days</CardDescription>
          </div>
          <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full gap-1">
            <TrendingUp className="h-3 w-3" /> +1.2% this week
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Line type="monotone" dataKey="Present" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Absent" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
