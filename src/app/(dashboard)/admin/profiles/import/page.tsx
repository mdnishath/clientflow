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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ParsedProfile {
    businessName: string;
    gmbLink?: string;
    category?: string;
    clientName?: string;
    clientId?: string;
    action: "create" | "skip" | "override";
    status: "pending" | "duplicate" | "new";
}

export default function ImportProfilesPage() {
    const [parsedData, setParsedData] = useState<ParsedProfile[]>([]);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState<any>(null);

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
                const json = XLSX.utils.sheet_to_json(worksheet);

                const parsed: ParsedProfile[] = json.map((row: any) => ({
                    businessName: row.businessName || row.BusinessName || row.business_name || "",
                    gmbLink: row.gmbLink || row.GMBLink || row.gmb_link || "",
                    category: row.category || row.Category || "",
                    clientName: row.clientName || row.ClientName || row.client_name || "",
                    clientId: "",
                    action: "create",
                    status: "pending",
                }));

                setParsedData(parsed);
                toast.success(`Parsed ${parsed.length} profiles from file`);
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
        },
        maxFiles: 1,
    });

    const handleImport = async () => {
        if (parsedData.length === 0) {
            toast.error("No data to import");
            return;
        }

        setImporting(true);
        try {
            const res = await fetch("/api/admin/profiles/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profiles: parsedData }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to import");
            }

            const results = await res.json();
            setImportResults(results.results);
            toast.success("Import completed!");
            setParsedData([]);
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
                businessName: "Example Pizza Shop",
                gmbLink: "https://maps.google.com/...",
                category: "Restaurant",
                clientName: "John Doe",
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(template);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Profiles");
        XLSX.writeFile(workbook, "profile_import_template.xlsx");
    };

    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Upload className="text-indigo-400" size={28} />
                        Import GMB Profiles
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Bulk import profiles from Excel file
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

            {/* Upload Area */}
            {parsedData.length === 0 && !importResults && (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-12">
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive
                                    ? "border-indigo-500 bg-indigo-500/10"
                                    : "border-slate-600 hover:border-slate-500"
                                }`}
                        >
                            <input {...getInputProps()} />
                            <FileSpreadsheet className="mx-auto h-16 w-16 text-slate-500 mb-4" />
                            <p className="text-slate-300 font-medium mb-2">
                                {isDragActive
                                    ? "Drop the Excel file here"
                                    : "Drag & drop an Excel file here, or click to select"}
                            </p>
                            <p className="text-slate-500 text-sm">
                                Supports .xlsx and .xls files
                            </p>
                            <p className="text-slate-600 text-xs mt-4">
                                Required columns: businessName (required), gmbLink, category, clientName
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Preview Table */}
            {parsedData.length > 0 && !importResults && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-300">
                            {parsedData.length} profiles ready to import
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setParsedData([])}
                                className="border-slate-700 text-slate-300"
                            >
                                <X size={16} className="mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={importing}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {importing ? (
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                ) : (
                                    <Upload size={16} className="mr-2" />
                                )}
                                Import Profiles
                            </Button>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-700/50 text-slate-300">
                                    <tr>
                                        <th className="p-3 text-left">Business Name</th>
                                        <th className="p-3 text-left">Category</th>
                                        <th className="p-3 text-left">Client</th>
                                        <th className="p-3 text-left">GMB Link</th>
                                        <th className="p-3 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {parsedData.map((profile, index) => (
                                        <tr key={index} className="border-t border-slate-700">
                                            <td className="p-3">{profile.businessName}</td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="text-xs">
                                                    {profile.category || "N/A"}
                                                </Badge>
                                            </td>
                                            <td className="p-3">{profile.clientName}</td>
                                            <td className="p-3 truncate max-w-[200px]">
                                                {profile.gmbLink ? (
                                                    <span className="text-xs text-slate-500">
                                                        {profile.gmbLink.substring(0, 30)}...
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600">No link</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <Select
                                                    value={profile.action}
                                                    onValueChange={(val) => {
                                                        const updated = [...parsedData];
                                                        updated[index].action = val as any;
                                                        setParsedData(updated);
                                                    }}
                                                >
                                                    <SelectTrigger className="w-[120px] h-8 bg-slate-700 border-slate-600">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-800 border-slate-700">
                                                        <SelectItem value="create">Create</SelectItem>
                                                        <SelectItem value="override">Override</SelectItem>
                                                        <SelectItem value="skip">Skip</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Results */}
            {importResults && (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-8">
                        <div className="text-center mb-6">
                            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Import Completed
                            </h2>
                            <p className="text-slate-400">
                                Your profiles have been imported successfully
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
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-2 mb-2">
                                    <AlertCircle className="text-red-400 mt-0.5" size={16} />
                                    <p className="text-red-400 font-medium">Errors:</p>
                                </div>
                                <ul className="text-sm text-slate-400 space-y-1 ml-6">
                                    {importResults.errors.map((error: string, i: number) => (
                                        <li key={i}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Button
                            onClick={() => {
                                setImportResults(null);
                                setParsedData([]);
                            }}
                            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
                        >
                            Import More Profiles
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
