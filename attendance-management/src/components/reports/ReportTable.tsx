"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportTableProps {
  headers: string[];
  children: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
}

export default function ReportTable({
  headers,
  children,
  loading = false,
  empty = false,
  emptyMessage = "No matching records found.",
}: ReportTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-black">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-slate-200 bg-slate-50/50">
            {headers.map((h, i) => (
              <TableHead key={i} className="font-semibold text-slate-500">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-slate-100">
                {headers.map((_, idx) => (
                  <TableCell key={idx} className="py-4">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : empty ? (
            <TableRow>
              <TableCell colSpan={headers.length} className="text-center py-12 text-slate-400 font-medium">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            children
          )}
        </TableBody>
      </Table>
    </div>
  );
}
