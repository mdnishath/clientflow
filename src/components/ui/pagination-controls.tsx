"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    isLoading,
}: PaginationControlsProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="border-slate-700 text-slate-300 hover:text-white disabled:opacity-50"
            >
                <ChevronLeft size={16} className="mr-1" />
                Prev
            </Button>

            <span className="text-sm text-slate-400">
                Page <span className="text-white font-medium">{currentPage}</span> of{" "}
                <span className="text-white font-medium">{totalPages}</span>
            </span>

            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                className="border-slate-700 text-slate-300 hover:text-white disabled:opacity-50"
            >
                Next
                <ChevronRight size={16} className="ml-1" />
            </Button>
        </div>
    );
}
