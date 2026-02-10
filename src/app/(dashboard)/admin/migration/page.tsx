"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import {
    Upload,
    FileSpreadsheet,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    Settings,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ColumnMapping {
    excelColumn: string;
    mappedTo: string;
}

interface ParsedProfile {
    [key: string]: any;
    _rowNumber?: number;
}

interface ImportResults {
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
}

const AVAILABLE_FIELDS = [
    { value: "skip", label: "Skip Column" },
    { value: "businessName", label: "Business Name *" },
    { value: "gmbLink", label: "GMB Link" },
    { value: "category", label: "Category" },
    { value: "clientName", label: "Client Name *" },
    { value: "clientEmail", label: "Client Email" },
    { value: "reviewText", label: "Review Text" },
    { value: "reviewStatus", label: "Review Status" },
    { value: "liveLink", label: "Live Link" },
    { value: "email", label: "Email Used" },
    { value: "ordered", label: "Reviews Ordered" },
    { value: "liveDaily", label: "Daily Limit" },
    { value: "startDate", label: "Start Date" },
    { value: "dueDate", label: "Due Date" },
];

export default function MigrationPage() {
    const [step, setStep] = useState<"upload" | "mapping" | "preview" | "results">("upload");
    const [headers, setHeaders] = useState<string[]>([]);
    const [rawData, setRawData] = useState<any[]>([]);
    const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
    const [parsedData, setParsedData] = useState<ParsedProfile[]>([]);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState<ImportResults | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                if (json.length < 2) {
                    toast.error("File must have at least a header row and one data row");
                    return;
                }

                // First row is headers
                const detectedHeaders = json[0].map((h: any) => String(h || "").trim());
                setHeaders(detectedHeaders);

                // Rest is data
                const dataRows = json.slice(1).filter(row =>
                    row && row.some(cell => cell !== null && cell !== undefined && String(cell).trim())
                );
                setRawData(dataRows);

                // Auto-detect mappings based on common column names
                const autoMappings: ColumnMapping[] = detectedHeaders.map(header => {
                    const lowerHeader = header.toLowerCase();
                    let mappedTo = "skip";

                    if (lowerHeader.includes("business") && lowerHeader.includes("name")) {
                        mappedTo = "businessName";
                    } else if (lowerHeader.includes("gmb") || lowerHeader.includes("google")) {
                        mappedTo = "gmbLink";
                    } else if (lowerHeader.includes("category")) {
                        mappedTo = "category";
                    } else if (lowerHeader.includes("client") && lowerHeader.includes("name")) {
                        mappedTo = "clientName";
                    } else if (lowerHeader.includes("client") && lowerHeader.includes("email")) {
                        mappedTo = "clientEmail";
                    } else if (lowerHeader.includes("review") && lowerHeader.includes("text")) {
                        mappedTo = "reviewText";
                    } else if (lowerHeader.includes("status")) {
                        mappedTo = "reviewStatus";
                    } else if (lowerHeader.includes("live") && lowerHeader.includes("link")) {
                        mappedTo = "liveLink";
                    } else if (lowerHeader.includes("email")) {
                        mappedTo = "email";
                    } else if (lowerHeader.includes("order")) {
                        mappedTo = "ordered";
                    } else if (lowerHeader.includes("daily") || lowerHeader.includes("limit")) {
                        mappedTo = "liveDaily";
                    } else if (lowerHeader.includes("start") && lowerHeader.includes("date")) {
                        mappedTo = "startDate";
                    } else if (lowerHeader.includes("due") && lowerHeader.includes("date")) {
                        mappedTo = "dueDate";
                    }

                    return {
                        excelColumn: header,
                        mappedTo,
                    };
                });

                setColumnMappings(autoMappings);
                setStep("mapping");
                toast.success(`Found ${detectedHeaders.length} columns and ${dataRows.length} rows`);
            } catch (error) {
                console.error("Error parsing file:", error);
                toast.error("Failed to parse Excel file");
            }
        };

        reader.readAsBinaryString(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
            "text/csv": [".csv"],
        },
        maxFiles: 1,
    });

    const handleMappingChange = (index: number, newMapping: string) => {
        const updated = [...columnMappings];
        updated[index].mappedTo = newMapping;
        setColumnMappings(updated);
    };

    const validateAndPreview = () => {
        // Check if required fields are mapped
        const businessNameMapped = columnMappings.some(m => m.mappedTo === "businessName");
        const clientNameMapped = columnMappings.some(m => m.mappedTo === "clientName");

        if (!businessNameMapped) {
            toast.error("Please map 'Business Name' field (required)");
            return;
        }

        if (!clientNameMapped) {
            toast.error("Please map 'Client Name' field (required)");
            return;
        }

        // Transform raw data based on mappings
        const transformed: ParsedProfile[] = rawData.map((row, rowIndex) => {
            const profile: ParsedProfile = { _rowNumber: rowIndex + 2 }; // +2 for header and 0-index

            columnMappings.forEach((mapping, colIndex) => {
                if (mapping.mappedTo !== "skip") {
                    const cellValue = row[colIndex];
                    if (cellValue !== null && cellValue !== undefined) {
                        profile[mapping.mappedTo] = String(cellValue).trim();
                    }
                }
            });

            return profile;
        });

        setParsedData(transformed);
        setStep("preview");
        toast.success(`Ready to import ${transformed.length} rows`);
    };

    const handleImport = async () => {
        if (parsedData.length === 0) {
            toast.error("No data to import");
            return;
        }

        setImporting(true);
        try {
            const res = await fetch("/api/admin/migration/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profiles: parsedData,
                    mappings: columnMappings
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to import");
            }

            const results = await res.json();
            setImportResults(results.results);
            setStep("results");
            toast.success("Import completed!");
        } catch (error: any) {
            console.error("Import error:", error);
            toast.error(error.message || "Failed to import profiles");
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                "Business Name": "Example Pizza Shop",
                "GMB Link": "https://maps.google.com/...",
                "Category": "Restaurant",
                "Client Name": "John Doe",
                "Client Email": "john@example.com",
                "Review Text": "Great service!",
                "Review Status": "PENDING",
                "Live Link": "",
                "Email Used": "",
                "Reviews Ordered": "10",
                "Daily Limit": "2",
                "Start Date": "2024-01-01",
                "Due Date": "",
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(template);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Migration Template");
        XLSX.writeFile(workbook, "migration_template.xlsx");
        toast.success("Template downloaded!");
    };

    const resetImport = () => {
        setStep("upload");
        setHeaders([]);
        setRawData([]);
        setColumnMappings([]);
        setParsedData([]);
        setImportResults(null);
    };

    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Upload className="text-indigo-400" size={28} />
                        Client Migration Tool
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Import profiles and reviews with flexible column mapping
                    </p>
                </div>
                <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    className="border-slate-700 text-slate-300"
                >
                    <Download size={16} className="mr-2" />
                    Download Template
                </Button>
            </div>

            {/* Step Indicator */}
            <div className="mb-6 flex items-center gap-2 text-sm">
                <Badge variant={step === "upload" ? "default" : "secondary"}>1. Upload</Badge>
                <ArrowRight size={16} className="text-slate-600" />
                <Badge variant={step === "mapping" ? "default" : "secondary"}>2. Map Columns</Badge>
                <ArrowRight size={16} className="text-slate-600" />
                <Badge variant={step === "preview" ? "default" : "secondary"}>3. Preview</Badge>
                <ArrowRight size={16} className="text-slate-600" />
                <Badge variant={step === "results" ? "default" : "secondary"}>4. Results</Badge>
            </div>

            {/* Step 1: Upload */}
            {step === "upload" && (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-12">
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                                isDragActive
                                    ? "border-indigo-500 bg-indigo-500/10"
                                    : "border-slate-600 hover:border-slate-500"
                            }`}
                        >
                            <input {...getInputProps()} />
                            <FileSpreadsheet className="mx-auto h-16 w-16 text-slate-500 mb-4" />
                            <p className="text-slate-300 font-medium mb-2">
                                {isDragActive
                                    ? "Drop the file here"
                                    : "Drag & drop Excel/CSV file, or click to select"}
                            </p>
                            <p className="text-slate-500 text-sm">
                                Supports .xlsx, .xls, and .csv files
                            </p>
                            <p className="text-slate-600 text-xs mt-4">
                                First row should contain column headers
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Column Mapping */}
            {step === "mapping" && (
                <div className="space-y-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Settings size={20} className="text-indigo-400" />
                                Map Your Columns
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Select which field each column should map to. Required fields are marked with *
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {columnMappings.map((mapping, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="text-slate-300 font-medium">
                                                {mapping.excelColumn}
                                            </p>
                                            <p className="text-slate-500 text-xs">
                                                Column {index + 1}
                                            </p>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-600" />
                                        <Select
                                            value={mapping.mappedTo}
                                            onValueChange={(val) => handleMappingChange(index, val)}
                                        >
                                            <SelectTrigger className="w-[240px] bg-slate-700 border-slate-600">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                {AVAILABLE_FIELDS.map((field) => (
                                                    <SelectItem key={field.value} value={field.value}>
                                                        {field.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={resetImport}
                            className="border-slate-700 text-slate-300"
                        >
                            <X size={16} className="mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={validateAndPreview}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            Preview Data
                            <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Preview */}
            {step === "preview" && parsedData.length > 0 && (
                <div className="space-y-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Preview Import Data</CardTitle>
                            <CardDescription className="text-slate-400">
                                Review {parsedData.length} rows before importing (showing first 10)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-700/50 text-slate-300">
                                        <tr>
                                            <th className="p-3 text-left">Row</th>
                                            <th className="p-3 text-left">Business Name</th>
                                            <th className="p-3 text-left">Client Name</th>
                                            <th className="p-3 text-left">Category</th>
                                            <th className="p-3 text-left">GMB Link</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-300">
                                        {parsedData.slice(0, 10).map((profile, index) => (
                                            <tr key={index} className="border-t border-slate-700">
                                                <td className="p-3 text-slate-500">
                                                    {profile._rowNumber}
                                                </td>
                                                <td className="p-3 font-medium">
                                                    {profile.businessName || (
                                                        <span className="text-red-400">Missing</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {profile.clientName || (
                                                        <span className="text-red-400">Missing</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="outline" className="text-xs">
                                                        {profile.category || "N/A"}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 truncate max-w-[200px]">
                                                    {profile.gmbLink ? (
                                                        <span className="text-xs text-slate-500">
                                                            {profile.gmbLink.substring(0, 30)}...
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-600">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setStep("mapping")}
                            className="border-slate-700 text-slate-300"
                        >
                            <ArrowRight size={16} className="mr-2 rotate-180" />
                            Back to Mapping
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={importing}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {importing ? (
                                <>
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} className="mr-2" />
                                    Import {parsedData.length} Rows
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 4: Results */}
            {step === "results" && importResults && (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-8">
                        <div className="text-center mb-6">
                            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Migration Completed
                            </h2>
                            <p className="text-slate-400">
                                Your data has been imported successfully
                            </p>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                                <p className="text-3xl font-bold text-green-400">
                                    {importResults.created}
                                </p>
                                <p className="text-sm text-slate-400 mt-1">Created</p>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                                <p className="text-3xl font-bold text-blue-400">
                                    {importResults.updated}
                                </p>
                                <p className="text-sm text-slate-400 mt-1">Updated</p>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                                <p className="text-3xl font-bold text-yellow-400">
                                    {importResults.skipped}
                                </p>
                                <p className="text-sm text-slate-400 mt-1">Skipped</p>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                                <p className="text-3xl font-bold text-red-400">
                                    {importResults.errors.length}
                                </p>
                                <p className="text-sm text-slate-400 mt-1">Errors</p>
                            </div>
                        </div>

                        {importResults.errors.length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-2 mb-2">
                                    <AlertCircle className="text-red-400 mt-0.5" size={16} />
                                    <p className="text-red-400 font-medium">Errors:</p>
                                </div>
                                <ul className="text-sm text-slate-400 space-y-1 ml-6 list-disc">
                                    {importResults.errors.map((error: string, i: number) => (
                                        <li key={i}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Button
                            onClick={resetImport}
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                            Import More Data
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
