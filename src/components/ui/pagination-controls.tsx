"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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
    const [inputPage, setInputPage] = useState("");

    if (totalPages <= 1) return null;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showEllipsis = totalPages > 7;

        if (!showEllipsis) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) pages.push("...");

            // Show 2 pages around current
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push("...");

            // Always show last page
            if (totalPages > 1) pages.push(totalPages);
        }

        return pages;
    };

    const handleGoToPage = () => {
        const pageNum = parseInt(inputPage);
        if (pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum);
            setInputPage("");
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
                {/* First Page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage <= 1 || isLoading}
                    className="border-slate-700 text-slate-300 hover:text-white disabled:opacity-50 h-8 w-8 p-0"
                >
                    <ChevronsLeft size={14} />
                </Button>

                {/* Prev */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                    className="border-slate-700 text-slate-300 hover:text-white disabled:opacity-50 h-8 px-2"
                >
                    <ChevronLeft size={14} />
                </Button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-500">...</span>
                    ) : (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page as number)}
                            disabled={isLoading}
                            className={`h-8 w-8 p-0 ${currentPage === page
                                    ? "bg-indigo-600 text-white"
                                    : "border-slate-700 text-slate-300 hover:text-white"
                                }`}
                        >
                            {page}
                        </Button>
                    )
                )}

                {/* Next */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoading}
                    className="border-slate-700 text-slate-300 hover:text-white disabled:opacity-50 h-8 px-2"
                >
                    <ChevronRight size={14} />
                </Button>

                {/* Last Page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage >= totalPages || isLoading}
                    className="border-slate-700 text-slate-300 hover:text-white disabled:opacity-50 h-8 w-8 p-0"
                >
                    <ChevronsRight size={14} />
                </Button>
            </div>

            {/* Go to Page Input */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Go to:</span>
                <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={inputPage}
                    onChange={(e) => setInputPage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
                    placeholder={`1-${totalPages}`}
                    className="w-20 h-8 bg-slate-900 border-slate-700 text-white text-sm"
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGoToPage}
                    disabled={isLoading}
                    className="border-slate-700 text-slate-300 hover:text-white h-8"
                >
                    Go
                </Button>
            </div>
        </div>
    );
}
