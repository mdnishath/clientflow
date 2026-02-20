"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    BarChart3,
    TrendingUp,
    Users,
    FileText,
    Download,
    Calendar,
    RefreshCcw,
    PieChart,
    Activity,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ProfileProgressReport } from "@/components/reports/profile-progress-report";

// Report Card Component for isolated reports
interface ReportCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onExport?: (format: string) => void;
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
                                {exportFormats.includes("excel") && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onExport("excel")}
                                        className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10"
                                    >
                                        <Download size={14} className="mr-1" />
                                        Excel
                                    </Button>
                                )}
                                {exportFormats.includes("pdf") && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onExport("pdf")}
                                        className="border-red-600/50 text-red-400 hover:bg-red-600/10"
                                    >
                                        <Download size={14} className="mr-1" />
                                        PDF
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
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                    </div>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}

interface KPIData {
    totalReviews: number;
    liveReviews: number;
    doneReviews: number;
    pendingReviews: number;
    issueReviews: number;
    successRate: number;
    last30Days: number;
    last7Days: number;
    avgCompletionDays: number;
}

interface WorkerPerformance {
    id: string;
    name: string;
    email: string;
    totalLive: number;
    last30Days: number;
    avgDays: number;
}

interface ClientRanking {
    id: string;
    name: string;
    totalReviews: number;
    liveReviews: number;
    doneReviews: number;
    successRate: number;
}

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [kpiData, setKpiData] = useState<KPIData | null>(null);
    const [workers, setWorkers] = useState<WorkerPerformance[]>([]);
    const [clients, setClients] = useState<ClientRanking[]>([]);
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        to: new Date().toISOString().split("T")[0],
    });

    // Fetch KPI data
    const fetchKPIData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/reports/kpi?from=${dateRange.from}&to=${dateRange.to}`);
            if (response.ok) {
                const data = await response.json();
                setKpiData(data);
            }
        } catch (error) {
            console.error("Failed to fetch KPI data:", error);
            toast.error("Failed to load KPI data");
        } finally {
            setLoading(false);
        }
    };

    // Fetch worker performance
    const fetchWorkerPerformance = async () => {
        try {
            const response = await fetch("/api/reports/workers");
            if (response.ok) {
                const data = await response.json();
                setWorkers(data);
            }
        } catch (error) {
            console.error("Failed to fetch worker data:", error);
        }
    };

    // Fetch client rankings
    const fetchClientRankings = async () => {
        try {
            const response = await fetch(`/api/reports/clients?from=${dateRange.from}&to=${dateRange.to}`);
            if (response.ok) {
                const data = await response.json();
                setClients(data);
            }
        } catch (error) {
            console.error("Failed to fetch client data:", error);
        }
    };

    useEffect(() => {
        fetchKPIData();
        fetchWorkerPerformance();
        fetchClientRankings();
    }, [dateRange]);

    const handleExportOverview = async (format: string) => {
        try {
            const response = await fetch(`/api/reports/overview/export?format=${format}`);
            if (!response.ok) throw new Error("Export failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const ext = format === "pdf" ? "pdf" : "xlsx";
            a.download = `Overview_Report_${new Date().toISOString().split("T")[0]}.${ext}`;
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

    const handleExportPerformance = async (format: string) => {
        try {
            const response = await fetch(`/api/reports/performance/export?format=${format}`);
            if (!response.ok) throw new Error("Export failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const ext = format === "pdf" ? "pdf" : "xlsx";
            a.download = `Worker_Performance_${new Date().toISOString().split("T")[0]}.${ext}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Performance report exported!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export performance report");
        }
    };

    const handleExportClients = async (format: string) => {
        try {
            const response = await fetch(
                `/api/reports/clients/export?format=${format}&from=${dateRange.from}&to=${dateRange.to}`
            );
            if (!response.ok) throw new Error("Export failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const ext = format === "pdf" ? "pdf" : "xlsx";
            a.download = `Client_Rankings_${new Date().toISOString().split("T")[0]}.${ext}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Client rankings exported!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export client rankings");
        }
    };

    const handleRefresh = () => {
        fetchKPIData();
        fetchWorkerPerformance();
        fetchClientRankings();
        toast.success("Reports refreshed!");
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
                        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg p-2">
                            <Calendar size={16} className="text-slate-400" />
                            <Input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                className="bg-transparent border-0 text-sm w-32 text-white"
                            />
                            <span className="text-slate-500">to</span>
                            <Input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                className="bg-transparent border-0 text-sm w-32 text-white"
                            />
                        </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400 uppercase">Total Reviews</span>
                                    <FileText size={16} className="text-indigo-400" />
                                </div>
                                <div className="text-2xl font-bold text-white">{kpiData?.totalReviews || 0}</div>
                                <div className="text-xs text-emerald-400 mt-1">
                                    <ArrowUpRight size={12} className="inline" /> {kpiData?.last30Days || 0} last 30 days
                                </div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400 uppercase">Live Reviews</span>
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                </div>
                                <div className="text-2xl font-bold text-emerald-400">{kpiData?.liveReviews || 0}</div>
                                <div className="text-xs text-slate-400 mt-1">Currently live</div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400 uppercase">Done</span>
                                    <CheckCircle2 size={16} className="text-cyan-400" />
                                </div>
                                <div className="text-2xl font-bold text-cyan-400">{kpiData?.doneReviews || 0}</div>
                                <div className="text-xs text-slate-400 mt-1">Completed</div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400 uppercase">Pending</span>
                                    <Clock size={16} className="text-amber-400" />
                                </div>
                                <div className="text-2xl font-bold text-amber-400">{kpiData?.pendingReviews || 0}</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    {kpiData?.totalReviews ? Math.round(((kpiData?.pendingReviews || 0) / kpiData.totalReviews) * 100) : 0}% of total
                                </div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400 uppercase">Issues</span>
                                    <AlertTriangle size={16} className="text-red-400" />
                                </div>
                                <div className="text-2xl font-bold text-red-400">{kpiData?.issueReviews || 0}</div>
                                <div className="text-xs text-slate-400 mt-1">Needs attention</div>
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
                        onExport={handleExportPerformance}
                        exportFormats={["excel", "pdf"]}
                    >
                        {workers.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Users size={48} className="mx-auto mb-3 opacity-30" />
                                <p>No worker data available</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {workers.map((worker, i) => (
                                    <div
                                        key={worker.id}
                                        className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                                i === 0 ? "bg-yellow-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-700" : "bg-slate-700"
                                            }`}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <span className="font-medium text-slate-200">{worker.name}</span>
                                                <p className="text-xs text-slate-500">{worker.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-white">{worker.totalLive}</span>
                                                <span className="text-xs text-slate-500 ml-1">total</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm text-emerald-400">{worker.last30Days}</span>
                                                <span className="text-xs text-slate-500 ml-1">this month</span>
                                            </div>
                                            <div className="text-right min-w-[60px]">
                                                <span className="text-sm text-cyan-400">{worker.avgDays}d</span>
                                                <span className="text-xs text-slate-500 ml-1">avg</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ReportCard>
                </TabsContent>

                {/* Clients Tab */}
                <TabsContent value="clients" className="space-y-6 mt-6">
                    <ReportCard
                        title="Client Performance Ranking"
                        description="Top performing clients by review volume and success rate"
                        icon={<Users className="text-purple-400" size={20} />}
                        onExport={handleExportClients}
                        exportFormats={["excel", "pdf"]}
                    >
                        {clients.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Users size={48} className="mx-auto mb-3 opacity-30" />
                                <p>No client data available</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {clients.map((client, i) => (
                                    <Link
                                        key={client.id}
                                        href={`/clients/${client.id}`}
                                        className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                                i === 0 ? "bg-yellow-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-700" : "bg-indigo-600"
                                            }`}>
                                                {i + 1}
                                            </div>
                                            <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                                                {client.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-slate-400">{client.totalReviews} reviews</span>
                                            <span className="text-sm text-emerald-400">{client.liveReviews} live</span>
                                            <span className="text-sm text-cyan-400">{client.doneReviews || 0} done</span>
                                            <span className={`text-sm font-medium ${
                                                client.successRate >= 70 ? "text-green-400" : client.successRate >= 40 ? "text-yellow-400" : "text-red-400"
                                            }`}>
                                                {client.successRate}%
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </ReportCard>
                </TabsContent>

                {/* Profiles Tab */}
                <TabsContent value="profiles" className="space-y-6 mt-6">
                    <ReportCard
                        title="Profile Progress Report"
                        description="Track completion status across all profiles"
                        icon={<PieChart className="text-pink-400" size={20} />}
                        onExport={(format) => {
                            window.open(`/api/reports/profile-progress/export?format=${format}`, "_blank");
                        }}
                        exportFormats={["excel", "pdf"]}
                    >
                        <ProfileProgressReport />
                    </ReportCard>
                </TabsContent>
            </Tabs>
        </div>
    );
}
