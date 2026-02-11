/**
 * Advanced Export Button Component
 *
 * Export reviews with all active filters applied
 * Supports: Status, Profile, Check Status, Email Search, etc.
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

interface AdvancedExportButtonProps {
  // All active filters
  statusFilter?: string;
  checkStatusFilter?: string;
  profileFilter?: string;
  emailSearch?: string;
  search?: string;
  showArchived?: boolean;

  // Reviews page specific filters
  clientFilter?: string;
  categoryFilter?: string;

  // Selection
  selectedIds?: string[];
  totalFilteredCount: number;
}

export function AdvancedExportButton({
  statusFilter = "all",
  checkStatusFilter = "all",
  profileFilter = "all",
  emailSearch = "",
  search = "",
  showArchived = false,
  clientFilter = "all",
  categoryFilter = "all",
  selectedIds = [],
  totalFilteredCount = 0,
}: AdvancedExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (exportType: "all" | "selected") => {
    setIsExporting(true);

    try {
      const params = new URLSearchParams();

      // Export type
      if (exportType === "selected") {
        if (selectedIds.length === 0) {
          toast.error("No reviews selected");
          setIsExporting(false);
          return;
        }
        params.set("ids", selectedIds.join(","));
      } else {
        // Apply all active filters for "Export All Filtered"
        if (statusFilter && statusFilter !== "all") {
          params.set("status", statusFilter);
        }
        if (checkStatusFilter && checkStatusFilter !== "all") {
          params.set("checkStatus", checkStatusFilter);
        }
        if (profileFilter && profileFilter !== "all") {
          params.set("profileId", profileFilter);
        }
        if (emailSearch) {
          params.set("emailSearch", emailSearch);
        }
        if (search) {
          params.set("search", search);
        }
        if (showArchived) {
          params.set("archived", "true");
        }
        if (clientFilter && clientFilter !== "all") {
          params.set("clientId", clientFilter);
        }
        if (categoryFilter && categoryFilter !== "all") {
          params.set("category", categoryFilter);
        }
      }

      const response = await fetch(`/api/reviews/export?${params}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Export failed" }));
        throw new Error(error.error || "Export failed");
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

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      const count = exportType === "selected" ? selectedIds.length : totalFilteredCount;
      toast.success(`Exported ${count} reviews successfully!`);
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export reviews");
    } finally {
      setIsExporting(false);
    }
  };

  // Build description for current filters
  const getFilterDescription = () => {
    const filters: string[] = [];
    if (statusFilter !== "all") filters.push(`Status: ${statusFilter}`);
    if (checkStatusFilter !== "all") filters.push(`Check: ${checkStatusFilter}`);
    if (profileFilter !== "all") filters.push("Profile filtered");
    if (clientFilter !== "all") filters.push("Client filtered");
    if (categoryFilter !== "all") filters.push(`Category: ${categoryFilter}`);
    if (emailSearch) filters.push(`Email: ${emailSearch}`);
    if (search) filters.push("Search active");
    if (showArchived) filters.push("Archived");

    return filters.length > 0 ? filters.join(" • ") : "All reviews";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700">
        <DropdownMenuLabel className="text-white">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            Export to Excel
          </div>
          <p className="text-xs text-slate-400 font-normal mt-1">
            {getFilterDescription()}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />

        <DropdownMenuItem
          onClick={() => handleExport("all")}
          disabled={isExporting || totalFilteredCount === 0}
          className="text-slate-300 hover:bg-slate-700 cursor-pointer"
        >
          <Download className="mr-2 h-4 w-4" />
          <div className="flex-1">
            <div className="font-medium">Export All Filtered</div>
            <div className="text-xs text-slate-400">
              {totalFilteredCount} reviews with current filters
            </div>
          </div>
        </DropdownMenuItem>

        {selectedIds.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={() => handleExport("selected")}
              disabled={isExporting}
              className="text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4 text-indigo-400" />
              <div className="flex-1">
                <div className="font-medium">Export Selected Only</div>
                <div className="text-xs text-slate-400">
                  {selectedIds.length} selected reviews
                </div>
              </div>
            </DropdownMenuItem>
          </>
        )}

        {totalFilteredCount === 0 && (
          <div className="px-2 py-3 text-center text-xs text-slate-500">
            No reviews to export with current filters
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
