"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Printer } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/services/report.service";

interface ExportButtonsProps {
  data: any[];
  title?: string;
  filtersText?: string;
  filename?: string;
  headers?: string[];
  keys?: string[];
}

export default function ExportButtons({
  data,
  title = "Report",
  filtersText = "None",
  filename,
  headers = [],
  keys = [],
}: ExportButtonsProps) {
  // If keys/headers are specified, filter and map raw records
  const filteredData = React.useMemo(() => {
    if (keys.length === 0) return data;
    return data.map((item) => {
      const filteredItem: any = {};
      keys.forEach((key, idx) => {
        const label = headers[idx] || key;
        filteredItem[label] = item[key];
      });
      return filteredItem;
    });
  }, [data, keys, headers]);

  const activeTitle = filename || title;

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => exportToExcel(filteredData, activeTitle, filtersText)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-10 px-4 flex items-center gap-2 text-sm transition-transform active:scale-95 shadow-xs"
      >
        <FileSpreadsheet className="h-4 w-4" /> Export Excel
      </Button>
      <Button
        onClick={() => exportToPDF(filteredData, activeTitle, filtersText)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-10 px-4 flex items-center gap-2 text-sm transition-transform active:scale-95 shadow-xs"
      >
        <Printer className="h-4 w-4" /> Print PDF
      </Button>
    </div>
  );
}
