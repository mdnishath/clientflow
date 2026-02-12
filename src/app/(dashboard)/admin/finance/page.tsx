"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    FileText,
    CreditCard,
    BarChart3,
    Download,
} from "lucide-react";

interface FinancialReport {
    overview: {
        revenue: {
            total: number;
            paid: number;
            pending: number;
            overdue: number;
        };
        expenses: {
            totalSalaries: number;
            paidSalaries: number;
            pendingSalaries: number;
        };
        payments: {
            total: number;
            completed: number;
            pending: number;
            failed: number;
            totalAmount: number;
        };
        profit: number;
    };
    clients: Array<{
        clientId: string;
        clientName: string;
        totalBilled: number;
        paid: number;
        pending: number;
    }>;
    workers: Array<{
        workerId: string;
        workerName: string;
        workerEmail: string;
        totalSalary: number;
        paid: number;
        pending: number;
        payments: number;
    }>;
}

export default function FinancePage() {
    const [report, setReport] = useState<FinancialReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ type: "all" });
            if (dateRange.startDate) params.append("startDate", dateRange.startDate);
            if (dateRange.endDate) params.append("endDate", dateRange.endDate);

            const res = await fetch(`/api/finance/reports?${params}`);
            const data = await res.json();
            setReport(data.report);
        } catch (error) {
            console.error("Failed to fetch report:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                    <BarChart3 className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-3xl font-bold text-white">Finance Dashboard</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
                            <CardHeader className="pb-2">
                                <div className="h-4 bg-slate-700 rounded w-24"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-slate-700 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-slate-700 rounded w-20"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="p-8">
                <p className="text-slate-400">Failed to load finance data</p>
            </div>
        );
    }

    const { overview, clients, workers } = report;

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-3xl font-bold text-white">Finance Dashboard</h1>
                </div>
                <Button variant="outline" className="border-slate-700 text-slate-300">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                </Button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            ${overview.revenue.total.toFixed(2)}
                        </div>
                        <p className="text-xs text-blue-100 mt-1">
                            ${overview.revenue.paid.toFixed(2)} paid
                        </p>
                    </CardContent>
                </Card>

                {/* Total Expenses */}
                <Card className="bg-gradient-to-br from-orange-600 to-red-600 border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-orange-100 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" />
                            Total Expenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            ${overview.expenses.totalSalaries.toFixed(2)}
                        </div>
                        <p className="text-xs text-orange-100 mt-1">
                            ${overview.expenses.paidSalaries.toFixed(2)} paid
                        </p>
                    </CardContent>
                </Card>

                {/* Net Profit */}
                <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Net Profit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            ${overview.profit.toFixed(2)}
                        </div>
                        <p className="text-xs text-green-100 mt-1">
                            {((overview.profit / overview.revenue.total) * 100).toFixed(1)}% margin
                        </p>
                    </CardContent>
                </Card>

                {/* Payments */}
                <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Payments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {overview.payments.total}
                        </div>
                        <p className="text-xs text-purple-100 mt-1">
                            {overview.payments.completed} completed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="clients" className="space-y-6">
                <TabsList className="bg-slate-800 border border-slate-700">
                    <TabsTrigger value="clients" className="data-[state=active]:bg-cyan-600">
                        <Users className="w-4 h-4 mr-2" />
                        Clients
                    </TabsTrigger>
                    <TabsTrigger value="workers" className="data-[state=active]:bg-cyan-600">
                        <Users className="w-4 h-4 mr-2" />
                        Workers
                    </TabsTrigger>
                    <TabsTrigger value="invoices" className="data-[state=active]:bg-cyan-600">
                        <FileText className="w-4 h-4 mr-2" />
                        Invoices
                    </TabsTrigger>
                </TabsList>

                {/* Clients Tab */}
                <TabsContent value="clients" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Client Billing Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {clients.map((client) => (
                                    <div
                                        key={client.clientId}
                                        className="flex items-center justify-between p-4 bg-slate-900 rounded-lg"
                                    >
                                        <div>
                                            <h3 className="text-white font-medium">{client.clientName}</h3>
                                            <p className="text-sm text-slate-400">
                                                Total: ${client.totalBilled.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-green-400 font-medium">
                                                +${client.paid.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                Pending: ${client.pending.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Workers Tab */}
                <TabsContent value="workers" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Worker Salary Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {workers.map((worker) => (
                                    <div
                                        key={worker.workerId}
                                        className="flex items-center justify-between p-4 bg-slate-900 rounded-lg"
                                    >
                                        <div>
                                            <h3 className="text-white font-medium">{worker.workerName}</h3>
                                            <p className="text-sm text-slate-400">{worker.workerEmail}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-orange-400 font-medium">
                                                -${worker.totalSalary.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                {worker.payments} payments
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Invoices Tab */}
                <TabsContent value="invoices" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Invoice Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400 mb-4">Invoice management coming soon</p>
                                    <Button className="bg-cyan-600 hover:bg-cyan-700">
                                        Create Invoice
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
