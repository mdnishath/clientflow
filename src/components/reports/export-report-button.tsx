"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
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

interface ExportReportButtonProps {
    filters?: {
        from?: string;
        to?: string;
        clientId?: string;
        category?: string;
    };
}

export function ExportReportButton({ filters }: ExportReportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: "xlsx" | "pdf") => {
        setIsExporting(true);

        try {
            const params = new URLSearchParams();
            params.set("format", format);

            if (filters?.from) params.set("from", filters.from);
            if (filters?.to) params.set("to", filters.to);
            if (filters?.clientId && filters.clientId !== "all") {
                params.set("clientId", filters.clientId);
            }
            if (filters?.category && filters.category !== "all") {
                params.set("category", filters.category);
            }

            const response = await fetch(`/api/reports/export?${params}`);

            if (!response.ok) {
                throw new Error("Export failed");
            }

            // Get filename from headers
            const contentDisposition = response.headers.get("Content-Disposition");
            let filename = `Report_${new Date().toISOString().split("T")[0]}.${format}`;

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
            toast.error("Failed to export report");
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
                    className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                    {isExporting ? (
                        <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download size={16} className="mr-2" />
                            Export Report
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 w-48">
                <DropdownMenuLabel className="text-slate-400">Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                    onClick={() => handleExport("xlsx")}
                    disabled={isExporting}
                    className="text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                    <FileSpreadsheet size={14} className="mr-2 text-green-400" />
                    Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleExport("pdf")}
                    disabled={isExporting}
                    className="text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                    <FileText size={14} className="mr-2 text-red-400" />
                    PDF Report
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
