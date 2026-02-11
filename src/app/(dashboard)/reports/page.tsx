"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart3,
    TrendingUp,
    Users,
    FileText,
    Download,
    Calendar,
    Filter,
    RefreshCcw,
    PieChart,
    Activity,
    CheckCircle2,
    Clock,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Report Card Component for isolated reports
interface ReportCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onExport?: () => void;
    onRefresh?: () => void;
    exportFormats?: ("pdf" | "excel" | "csv")[];
    loading?: boolean;
}

function ReportCard({
    title,
    description,
    icon,
    children,
    onExport,
    onRefresh,
    exportFormats = ["excel"],
    loading = false,
}: ReportCardProps) {
    return (
        <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
            <CardHeader className="border-b border-slate-700/50">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-600/20 rounded-lg">
                            {icon}
                        </div>
                        <div>
                            <CardTitle className="text-lg text-white">{title}</CardTitle>
                            <CardDescription className="text-slate-400 text-sm mt-1">
                                {description}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onRefresh && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onRefresh}
                                disabled={loading}
                                className="text-slate-400 hover:text-white"
                            >
                                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                            </Button>
                        )}
                        {onExport && exportFormats.length > 0 && (
                            <div className="flex gap-2">
                                {exportFormats.includes("pdf") && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onExport()}
                                        className="border-red-600/50 text-red-400 hover:bg-red-600/10"
                                    >
                                        <Download size={14} className="mr-1" />
                                        PDF
                                    </Button>
                                )}
                                {exportFormats.includes("excel") && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onExport()}
                                        className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10"
                                    >
                                        <Download size={14} className="mr-1" />
                                        Excel
                                    </Button>
                                )}
                                {exportFormats.includes("csv") && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onExport()}
                                        className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10"
                                    >
                                        <Download size={14} className="mr-1" />
                                        CSV
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCcw className="animate-spin text-slate-400" size={32} />
                    </div>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(false);

    const handleExportOverview = async () => {
        try {
            const response = await fetch("/api/reports/overview/export");
            if (!response.ok) throw new Error("Export failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Overview_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Report exported successfully!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export report");
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        toast.success("Report refreshed!");
    };

    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="text-indigo-400" size={32} />
                            Reports & Analytics
                        </h1>
                        <p className="text-slate-400 mt-2">
                            Comprehensive insights and performance metrics
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:text-white"
                        >
                            <Calendar size={16} className="mr-2" />
                            Date Range
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:text-white"
                        >
                            <Filter size={16} className="mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs for Different Report Categories */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="bg-slate-800/50 border border-slate-700">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600">
                        <Activity size={16} className="mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="data-[state=active]:bg-indigo-600">
                        <TrendingUp size={16} className="mr-2" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="clients" className="data-[state=active]:bg-indigo-600">
                        <Users size={16} className="mr-2" />
                        Clients
                    </TabsTrigger>
                    <TabsTrigger value="profiles" className="data-[state=active]:bg-indigo-600">
                        <PieChart size={16} className="mr-2" />
                        Profiles
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* KPI Summary Report */}
                    <ReportCard
                        title="Key Performance Indicators"
                        description="Summary of your review metrics and success rates"
                        icon={<BarChart3 className="text-indigo-400" size={20} />}
                        onExport={handleExportOverview}
                        onRefresh={handleRefresh}
                        exportFormats={["excel", "pdf"]}
                        loading={loading}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400 uppercase">Total Reviews</span>
                                    <FileText size={16} className="text-indigo-400" />
                                </div>
                                <div className="text-2xl font-bold text-white">1,234</div>
                                <div className="text-xs text-green-400 mt-1">+12% from last month</div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400 uppercase">Live Reviews</span>
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                </div>
                                <div className="text-2xl font-bold text-emerald-400">892</div>
                                <div className="text-xs text-slate-400 mt-1">72% success rate</div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400 uppercase">Pending</span>
                                    <Clock size={16} className="text-amber-400" />
                                </div>
                                <div className="text-2xl font-bold text-amber-400">156</div>
                                <div className="text-xs text-slate-400 mt-1">13% of total</div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400 uppercase">Issues</span>
                                    <AlertTriangle size={16} className="text-red-400" />
                                </div>
                                <div className="text-2xl font-bold text-red-400">34</div>
                                <div className="text-xs text-slate-400 mt-1">Needs attention</div>
                            </div>
                        </div>
                    </ReportCard>

                    {/* Review Growth Report */}
                    <ReportCard
                        title="Review Growth Trends"
                        description="Track review creation and completion over time"
                        icon={<TrendingUp className="text-emerald-400" size={20} />}
                        onExport={() => toast.success("Exporting growth report...")}
                        onRefresh={handleRefresh}
                        exportFormats={["excel", "csv"]}
                    >
                        <div className="h-64 flex items-center justify-center text-slate-500">
                            <div className="text-center">
                                <BarChart3 size={48} className="mx-auto mb-2 opacity-30" />
                                <p>Chart component will be here</p>
                                <p className="text-xs mt-1">Showing last 30 days</p>
                            </div>
                        </div>
                    </ReportCard>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6 mt-6">
                    <ReportCard
                        title="Worker Performance"
                        description="Track individual worker productivity and quality"
                        icon={<Users className="text-blue-400" size={20} />}
                        onExport={() => toast.success("Exporting performance report...")}
                        exportFormats={["excel"]}
                    >
                        <div className="text-center py-12 text-slate-400">
                            Worker performance data will appear here
                        </div>
                    </ReportCard>

                    <ReportCard
                        title="Completion Time Analysis"
                        description="Average time from creation to live status"
                        icon={<Clock className="text-cyan-400" size={20} />}
                        onExport={() => toast.success("Exporting completion report...")}
                        exportFormats={["excel", "pdf"]}
                    >
                        <div className="text-center py-12 text-slate-400">
                            Completion time metrics will appear here
                        </div>
                    </ReportCard>
                </TabsContent>

                {/* Clients Tab */}
                <TabsContent value="clients" className="space-y-6 mt-6">
                    <ReportCard
                        title="Client Performance Ranking"
                        description="Top performing clients by review volume and success rate"
                        icon={<Users className="text-purple-400" size={20} />}
                        onExport={() => toast.success("Exporting client report...")}
                        exportFormats={["excel", "pdf"]}
                    >
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
                                            {i}
                                        </div>
                                        <span className="font-medium text-slate-200">Client {i}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-slate-400">120 reviews</span>
                                        <span className="text-sm font-medium text-green-400">85%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ReportCard>
                </TabsContent>

                {/* Profiles Tab */}
                <TabsContent value="profiles" className="space-y-6 mt-6">
                    <ReportCard
                        title="Profile Progress Report"
                        description="Track completion status across all profiles"
                        icon={<PieChart className="text-pink-400" size={20} />}
                        onExport={() => {
                            window.open("/api/reports/profile-progress/export?format=excel", "_blank");
                        }}
                        exportFormats={["excel", "pdf"]}
                    >
                        <div className="text-center py-12">
                            <Link
                                href="/api/reports/profile-progress/export?format=excel"
                                className="text-indigo-400 hover:text-indigo-300 underline"
                            >
                                View Full Profile Progress Report
                            </Link>
                        </div>
                    </ReportCard>
                </TabsContent>
            </Tabs>
        </div>
    );
}
