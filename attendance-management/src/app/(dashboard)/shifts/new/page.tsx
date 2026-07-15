"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShiftForm from "@/components/shifts/ShiftForm";

export default function NewShiftPage() {
  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/shifts">
          <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Shift Profile</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Configure start, end timings and grace periods.</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <ShiftForm />
      </div>
    </div>
  );
}
