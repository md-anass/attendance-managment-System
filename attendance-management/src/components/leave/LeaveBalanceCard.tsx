"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LeaveBalance } from "@/types/leave";
import { Palmtree, HeartPulse, Sparkles, AlertCircle } from "lucide-react";

interface LeaveBalanceCardProps {
  balances: LeaveBalance[];
}

export default function LeaveBalanceCard({ balances }: LeaveBalanceCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "Annual Leave":
        return <Palmtree className="h-5 w-5" />;
      case "Sick Leave":
        return <HeartPulse className="h-5 w-5" />;
      case "Casual Leave":
        return <Sparkles className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
      case "Annual Leave":
        return { bgClass: "bg-blue-50 text-blue-600", progressColor: "bg-blue-600" };
      case "Sick Leave":
        return { bgClass: "bg-emerald-50 text-emerald-600", progressColor: "bg-emerald-600" };
      case "Casual Leave":
        return { bgClass: "bg-amber-50 text-amber-600", progressColor: "bg-amber-600" };
      default:
        return { bgClass: "bg-indigo-50 text-indigo-600", progressColor: "bg-indigo-600" };
    }
  };

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
      {balances.map((bal, idx) => {
        const pct = Math.min(100, Math.max(0, (bal.used / bal.allocated) * 100));
        const { bgClass, progressColor } = getStyle(bal.leave_type);
        const icon = getIcon(bal.leave_type);

        return (
          <Card key={idx} className="border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${bgClass}`}>
                    {icon}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm truncate max-w-[100px]">{bal.leave_type}</h4>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance</span>
              </div>

              <div className="space-y-2 pt-1 text-xs font-semibold text-slate-600">
                <div className="flex justify-between items-center bg-slate-50/30 px-3 py-2 rounded-xl">
                  <span className="text-slate-400 font-medium">Allocated:</span>
                  <span className="text-slate-800 font-bold">{bal.allocated} days</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50/30 px-3 py-2 rounded-xl">
                  <span className="text-slate-400 font-medium">Used:</span>
                  <span className="text-slate-800 font-bold">{bal.used} days</span>
                </div>
                <div className="flex justify-between items-center bg-blue-50/30 px-3 py-2 rounded-xl border border-blue-100/30">
                  <span className="text-blue-500 font-bold">Remaining:</span>
                  <span className="text-blue-600 font-extrabold">{bal.remaining} days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
