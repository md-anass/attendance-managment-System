"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, UserCheck, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LeaveBalanceCard from "@/components/leave/LeaveBalanceCard";
import { getAllLeaveBalances } from "@/services/leave.service";
import { EmployeeLeaveBalances } from "@/types/leave";

export default function LeaveBalancesPage() {
  const [balances, setBalances] = React.useState<EmployeeLeaveBalances[]>([]);
  const [selectedEmpId, setSelectedEmpId] = React.useState<string>("");
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadBalances() {
      try {
        const data = await getAllLeaveBalances();
        setBalances(data);
        if (data.length > 0) {
          setSelectedEmpId(String(data[0].employeeId));
        }
      } catch (err) {
        console.error("Failed to load leave balances", err);
        toast.error("Unable to load leave balance details.");
      } finally {
        setLoading(false);
      }
    }
    loadBalances();
  }, []);

  const activeBalance = React.useMemo(() => {
    if (!selectedEmpId) return null;
    return balances.find((b) => String(b.employeeId) === selectedEmpId) || null;
  }, [selectedEmpId, balances]);

  const filteredBalances = React.useMemo(() => {
    return balances.filter((b) => {
      const s = search.toLowerCase();
      const code = b.employeeCode.toLowerCase();
      const name = `${b.firstName} ${b.lastName}`.toLowerCase();
      const dept = b.departmentName.toLowerCase();
      return name.includes(s) || code.includes(s) || dept.includes(s);
    });
  }, [balances, search]);

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div>
        <Link href="/leave" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-1.5 mb-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Leave dashboard
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Leave Balances</h2>
        <p className="text-muted-foreground">Track employee balance metrics across vacation types.</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Individual Focus Selector */}
          <div className="bg-slate-50/50 border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="max-w-xs space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-slate-400" /> Focus Employee Card
              </label>
              <Select value={selectedEmpId} onValueChange={(val) => setSelectedEmpId(val || "")}>
                <SelectTrigger className="border-slate-200 bg-white rounded-xl h-10 text-sm font-semibold">
                  <SelectValue placeholder="Choose employee name" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {balances.map((b) => (
                    <SelectItem key={b.employeeId} value={String(b.employeeId)}>
                      {b.firstName} {b.lastName} ({b.employeeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Render Cards Grid for Active Employee */}
            {activeBalance && <LeaveBalanceCard balances={activeBalance.balances} />}
          </div>

          {/* Overview List Table */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Eye className="h-5 w-5 text-slate-500" /> Organization Overview
              </h3>
              
              {/* Simple search filter */}
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Filter name, code, dept..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 rounded-xl border-slate-200 focus:border-blue-500 text-xs font-semibold bg-white"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-200 bg-slate-50/50">
                    <TableHead className="font-semibold text-slate-500 text-xs">Employee</TableHead>
                    <TableHead className="font-semibold text-slate-500 text-xs">Department</TableHead>
                    <TableHead className="font-semibold text-slate-500 text-xs text-center">Annual Used</TableHead>
                    <TableHead className="font-semibold text-slate-500 text-xs text-center">Sick Used</TableHead>
                    <TableHead className="font-semibold text-slate-500 text-xs text-center">Casual Used</TableHead>
                    <TableHead className="font-semibold text-slate-500 text-xs text-center">Total Used</TableHead>
                    <TableHead className="font-semibold text-slate-500 text-xs text-right">Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBalances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                        No employee leave balances found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBalances.map((b) => {
                      const annual = b.balances.find((bal) => bal.leave_type === "Annual Leave");
                      const sick = b.balances.find((bal) => bal.leave_type === "Sick Leave");
                      const casual = b.balances.find((bal) => bal.leave_type === "Casual Leave");
                      
                      const totalUsed = b.balances.reduce((sum, bal) => sum + bal.used, 0);
                      const totalRemaining = b.balances.reduce((sum, bal) => sum + bal.remaining, 0);
                      
                      return (
                        <TableRow 
                          key={b.employeeId} 
                          className="border-slate-100 hover:bg-slate-50/30 cursor-pointer"
                          onClick={() => setSelectedEmpId(String(b.employeeId))}
                        >
                          <TableCell className="font-semibold text-slate-800 text-sm">
                            {b.firstName} {b.lastName}
                            <span className="block text-[10px] text-slate-400 font-medium">{b.employeeCode}</span>
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm font-semibold">{b.departmentName}</TableCell>
                          <TableCell className="text-center text-slate-600 text-sm font-medium">
                            {annual ? `${annual.used} / ${annual.allocated}` : "0 / 20"}
                          </TableCell>
                          <TableCell className="text-center text-slate-600 text-sm font-medium">
                            {sick ? `${sick.used} / ${sick.allocated}` : "0 / 10"}
                          </TableCell>
                          <TableCell className="text-center text-slate-600 text-sm font-medium">
                            {casual ? `${casual.used} / ${casual.allocated}` : "0 / 5"}
                          </TableCell>
                          <TableCell className="text-center text-slate-600 text-sm font-bold">{totalUsed} days</TableCell>
                          <TableCell className="text-right text-sm font-bold text-blue-600">{totalRemaining} days</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
