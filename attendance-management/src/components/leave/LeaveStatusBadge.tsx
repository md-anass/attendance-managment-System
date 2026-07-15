"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";

interface LeaveStatusBadgeProps {
  status: "Pending" | "Approved" | "Rejected";
}

export default function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50";
      case "Pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50";
    }
  };

  return (
    <Badge className={`${getBadgeStyle()} border font-semibold text-xs px-2.5 py-0.5 rounded-full`}>
      {status}
    </Badge>
  );
}
