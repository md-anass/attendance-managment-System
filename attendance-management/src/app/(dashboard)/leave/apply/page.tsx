"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LeaveForm from "@/components/leave/LeaveForm";

export default function ApplyLeavePage() {
  return (
    <div className="space-y-6 text-black">
      {/* Header title */}
      <div>
        <Link href="/leave" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1.5 mb-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Leave dashboard
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Apply for Leave</h2>
        <p className="text-muted-foreground">Submit a new request for vacation, medical, or casual leave.</p>
      </div>

      <div className="max-w-2xl">
        <LeaveForm />
      </div>
    </div>
  );
}
