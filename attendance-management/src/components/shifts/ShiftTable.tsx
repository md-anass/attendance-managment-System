"use client";

import * as React from "react";
import Link from "next/link";
import { Edit2, Trash2, Clock, Coffee, ShieldAlert } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shift } from "@/types/shift";

interface ShiftTableProps {
  data: Shift[];
  onDelete: (id: number) => void;
}

export default function ShiftTable({ data, onDelete }: ShiftTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-black">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-slate-200 bg-slate-50/50">
            <TableHead className="font-semibold text-slate-500">Shift Name</TableHead>
            <TableHead className="font-semibold text-slate-500 text-center">Start Time</TableHead>
            <TableHead className="font-semibold text-slate-500 text-center">End Time</TableHead>
            <TableHead className="font-semibold text-slate-500 text-center">Grace Period</TableHead>
            <TableHead className="font-semibold text-slate-500 text-center">Break Duration</TableHead>
            <TableHead className="font-semibold text-slate-500 text-center">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-500">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                No shift profiles defined.
              </TableCell>
            </TableRow>
          ) : (
            data.map((shift) => (
              <TableRow key={shift.id} className="border-slate-100 hover:bg-slate-50/30">
                <TableCell className="font-bold text-slate-800 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                      <Clock className="h-4 w-4" />
                    </div>
                    {shift.name}
                  </div>
                </TableCell>
                <TableCell className="text-center font-semibold text-slate-600 text-sm">
                  {shift.start_time}
                </TableCell>
                <TableCell className="text-center font-semibold text-slate-600 text-sm">
                  {shift.end_time}
                </TableCell>
                <TableCell className="text-center text-slate-600 text-sm font-semibold">
                  {shift.grace_minutes} mins
                </TableCell>
                <TableCell className="text-center text-slate-600 text-sm font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <Coffee className="h-3.5 w-3.5 text-slate-400" />
                    {shift.break_minutes} mins
                  </div>
                </TableCell>
                <TableCell className="text-center">
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
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Link href={`/shifts/${shift.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-slate-600" title="Edit Shift">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete the shift "${shift.name}"?`)) {
                          onDelete(shift.id);
                        }
                      }}
                      className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600 text-slate-500"
                      title="Delete Shift"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
