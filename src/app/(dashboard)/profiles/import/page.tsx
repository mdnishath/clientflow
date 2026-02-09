"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Download,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { read, utils } from "xlsx";

interface ImportRow {
    date?: string;
    businessName: string;
    gmbLink?: string;
    liveLink?: string;
    reviewText?: string;
    status?: string;
    email?: string;
    ordered?: number;
    liveDaily?: number;
    startDate?: string;
    clientName?: string;
    totalEmail?: string;
}

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    row: ImportRow;
    rowIndex: number;
}

export default function ImportPage() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [preview, setPreview] = useState<ValidationResult[]>([]);
    const [summary, setSummary] = useState<{ profiles: number; reviews: number } | null>(null);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsProcessing(true);

        try {
            const data = await selectedFile.arrayBuffer();
            // Force UTF-8 (codepage 65001) to handle accents correctly
            const workbook = read(data, { codepage: 65001 });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = utils.sheet_to_json<any>(worksheet, { header: 1 });

            // Skip header row
            const rows = jsonData.slice(1);

            // Parse rows - propagate business name and GMB link from first row
            let lastBusinessName = "";
            let lastGmbLink = "";

            const parsedRows: ImportRow[] = rows
                .filter((row: any[]) => {
                    // Must have at least business name OR some content in other cells
                    const hasBusinessName = row[1] && String(row[1]).trim();
                    const hasAnyContent = row.some((cell: any) => cell !== null && cell !== undefined && String(cell).trim());
                    return hasBusinessName || hasAnyContent;
                })
                .map((row: any[]) => {
                    // Update last known business name and GMB link if present
                    if (row[1] && String(row[1]).trim()) {
                        lastBusinessName = String(row[1]).trim();
                    }
                    if (row[2] && String(row[2]).trim()) {
                        lastGmbLink = String(row[2]).trim();
                    }

                    return {
                        date: row[0] ? String(row[0]) : undefined,
                        businessName: lastBusinessName, // Use last known business name
                        gmbLink: lastGmbLink || undefined, // Use last known GMB link
                        liveLink: row[3] ? String(row[3]).trim() : undefined,
                        reviewText: row[4] ? String(row[4]).trim() : undefined,
                        status: row[5] ? String(row[5]).trim().toUpperCase() : undefined,
                        email: row[6] ? String(row[6]).trim() : undefined,
                        ordered: row[7] ? Number(row[7]) : undefined,
                        liveDaily: row[8] ? Number(row[8]) : undefined,
                        startDate: row[9] ? String(row[9]) : undefined,
                        clientName: row[10] ? String(row[10]).trim() : undefined,
                        totalEmail: row[11] ? String(row[11]).trim() : undefined,
                    };
                });

            // Validate rows
            const validationResults: ValidationResult[] = parsedRows.map((row, index) => {
                const errors: string[] = [];
                const warnings: string[] = [];

                // Business name should now be propagated to all rows
                // Empty review text is OK (5-star reviews)
                if (!row.businessName) {
                    errors.push("Business name is required (should be in first row)");
                }

                if (row.status) {
                    const validStatuses = ["PENDING", "IN_PROGRESS", "MISSING", "APPLIED", "GOOGLE_ISSUE", "LIVE", "DONE"];
                    if (!validStatuses.includes(row.status)) {
                        warnings.push(`Invalid status "${row.status}", will default to PENDING`);
                    }
                }

                if (row.ordered && row.ordered < 0) {
                    errors.push("Ordered reviews cannot be negative");
                }

                if (row.liveDaily && row.liveDaily < 1) {
                    errors.push("Daily limit must be at least 1");
                }

                return {
                    valid: errors.length === 0,
                    errors,
                    warnings,
                    row,
                    rowIndex: index + 2, // +2 for header and 0-index
                };
            });

            // Calculate summary
            const profileNames = new Set(parsedRows.map(r => r.businessName));

            // Count actual reviews (rows with date OR review data)
            // Every row with a date should be imported as a review
            const actualReviews = parsedRows.filter(r =>
                r.date || r.reviewText || r.status || r.liveLink || r.email
            );

            // Only count auto-reviews if there are NO actual reviews
            // (Ordered is for future auto-generation, not when importing existing reviews)
            const hasActualReviews = actualReviews.length > 0;
            const autoReviewsCount = hasActualReviews ? 0 : parsedRows.reduce((sum, r) => sum + (r.ordered || 0), 0);

            setSummary({
                profiles: profileNames.size,
                reviews: actualReviews.length + autoReviewsCount,
            });

            setPreview(validationResults);
            toast.success("File parsed successfully!");
        } catch (error) {
            console.error("Error parsing file:", error);
            toast.error("Failed to parse file. Please check the format.");
            setFile(null);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const handleImport = async () => {
        if (!file || !isAdmin) {
            toast.error("Unauthorized or no file selected");
            return;
        }

        const hasErrors = preview.some(v => !v.valid);
        if (hasErrors) {
            toast.error("Please fix all errors before importing");
            return;
        }

        setIsImporting(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/profiles/import", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`Imported ${data.profilesCreated} profiles and ${data.reviewsCreated} reviews!`);
                router.push("/profiles");
            } else {
                toast.error(data.error || "Import failed");
            }
        } catch (error) {
            console.error("Import error:", error);
            toast.error("Failed to import");
        } finally {
            setIsImporting(false);
        }
    };

    const validCount = preview.filter(v => v.valid).length;
    const errorCount = preview.filter(v => !v.valid).length;

    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft size={16} className="mr-1" />
                            Back
                        </Button>
                    </div>
                    <h1 className="text-2xl font-bold text-white mt-2">Import Profiles & Reviews</h1>
                    <p className="text-slate-400 mt-1">
                        Upload your Google Sheet to import profiles and reviews
                    </p>
                </div>
            </div>

            {/* Upload Card */}
            {!file && (
                <Card className="bg-slate-800/50 border-slate-700 max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
                            Upload Excel or CSV
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Upload your sheet with columns: Date, Business Name, GMB Link, Review Text, Status, Email, Ordered, Live/Daily, Start Date
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="h-12 w-12 text-slate-400 mb-3" />
                                <p className="mb-2 text-sm text-slate-300">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-slate-500">Excel (.xlsx) or CSV files</p>
                            </div>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                disabled={isProcessing}
                            />
                        </Label>
                    </CardContent>
                </Card>
            )}

            {/* Preview */}
            {file && preview.length > 0 && (
                <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="p-4">
                                <p className="text-sm text-slate-400">Total Rows</p>
                                <p className="text-2xl font-bold text-white">{preview.length}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-green-900/20 border-green-700">
                            <CardContent className="p-4">
                                <p className="text-sm text-green-400">Valid Rows</p>
                                <p className="text-2xl font-bold text-white">{validCount}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-900/20 border-red-700">
                            <CardContent className="p-4">
                                <p className="text-sm text-red-400">Errors</p>
                                <p className="text-2xl font-bold text-white">{errorCount}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-indigo-900/20 border-indigo-700">
                            <CardContent className="p-4">
                                <p className="text-sm text-indigo-400">Will Create</p>
                                <p className="text-2xl font-bold text-white">
                                    {summary?.profiles}P / {summary?.reviews}R
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Preview Table */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Preview</CardTitle>
                            <CardDescription className="text-slate-400">
                                Review the data before importing (showing first 20 rows)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left p-2 text-slate-400">#</th>
                                            <th className="text-left p-2 text-slate-400">Status</th>
                                            <th className="text-left p-2 text-slate-400">Business Name</th>
                                            <th className="text-left p-2 text-slate-400">Review Text</th>
                                            <th className="text-left p-2 text-slate-400">Ordered</th>
                                            <th className="text-left p-2 text-slate-400">Issues</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.slice(0, 20).map((item) => (
                                            <tr
                                                key={item.rowIndex}
                                                className={`border-b border-slate-700/50 ${!item.valid ? "bg-red-900/10" : item.warnings.length > 0 ? "bg-yellow-900/10" : ""
                                                    }`}
                                            >
                                                <td className="p-2 text-slate-400">{item.rowIndex}</td>
                                                <td className="p-2">
                                                    {item.valid ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                    ) : (
                                                        <AlertCircle className="h-4 w-4 text-red-400" />
                                                    )}
                                                </td>
                                                <td className="p-2 text-white">{item.row.businessName}</td>
                                                <td className="p-2 text-slate-300 max-w-xs truncate">
                                                    {item.row.reviewText || "-"}
                                                </td>
                                                <td className="p-2 text-slate-300">{item.row.ordered || 0}</td>
                                                <td className="p-2">
                                                    {item.errors.length > 0 && (
                                                        <p className="text-xs text-red-400">{item.errors.join(", ")}</p>
                                                    )}
                                                    {item.warnings.length > 0 && (
                                                        <p className="text-xs text-yellow-400">{item.warnings.join(", ")}</p>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setFile(null);
                                setPreview([]);
                                setSummary(null);
                            }}
                            className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={errorCount > 0 || isImporting}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Import {summary?.profiles} Profiles & {summary?.reviews} Reviews
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {isProcessing && (
                <div className="flex flex-col items-center justify-center h-48">
                    <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mb-4" />
                    <p className="text-slate-400">Processing file...</p>
                </div>
            )}
        </div>
    );
}
