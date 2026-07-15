"use client";

import * as React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShiftFilters as FiltersType } from "@/types/shift";

interface ShiftFiltersProps {
  onFilterChange: (filters: FiltersType) => void;
}

export default function ShiftFilters({ onFilterChange }: ShiftFiltersProps) {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onFilterChange({ search: val, status });
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    onFilterChange({ search, status: val });
  };

  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs text-black flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative max-w-xs w-full">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search by shift name..."
          value={search}
          onChange={handleSearchChange}
          className="pl-10 h-10 rounded-xl border-slate-200 focus:border-blue-500 text-sm font-semibold bg-slate-50/20"
        />
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-48">
        <Select value={status} onValueChange={(val) => handleStatusChange(val || "All")}>
          <SelectTrigger className="border-slate-200/80 rounded-xl h-10 bg-slate-50/30 text-sm font-medium">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <SelectValue placeholder="Filter by Status" />
            </span>
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Active">Active Only</SelectItem>
            <SelectItem value="Inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
