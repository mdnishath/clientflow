/**
 * Export Reviews Button Component
 *
 * Download reviews in XLSX format with filters
 */

"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ExportButtonProps {
  currentStatusFilter?: string;
}

export function ExportButton({ currentStatusFilter = "all" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (filter: string) => {
    setIsExporting(true);

    try {
      const params = new URLSearchParams();
      params.set("filter", filter);
      if (currentStatusFilter !== "all") {
        params.set("status", currentStatusFilter);
      }

      const response = await fetch(`/api/reviews/export?${params}`);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get filename from headers or create default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "Reviews_Export.xlsx";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Downloaded: ${filename}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export reviews");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10 hover:text-blue-300"
        >
          {isExporting ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download size={16} className="mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 w-56">
        <DropdownMenuLabel className="text-slate-400">Export to XLSX</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem
          onClick={() => handleExport("all")}
          disabled={isExporting}
          className="text-slate-200 hover:bg-slate-700 cursor-pointer"
        >
          <FileSpreadsheet size={14} className="mr-2 text-slate-400" />
          All Reviews
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("live")}
          disabled={isExporting}
          className="text-slate-200 hover:bg-slate-700 cursor-pointer"
        >
          <FileSpreadsheet size={14} className="mr-2 text-green-400" />
          Live Only
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("missing")}
          disabled={isExporting}
          className="text-slate-200 hover:bg-slate-700 cursor-pointer"
        >
          <FileSpreadsheet size={14} className="mr-2 text-red-400" />
          Missing Only
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("error")}
          disabled={isExporting}
          className="text-slate-200 hover:bg-slate-700 cursor-pointer"
        >
          <FileSpreadsheet size={14} className="mr-2 text-orange-400" />
          Error Only
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
