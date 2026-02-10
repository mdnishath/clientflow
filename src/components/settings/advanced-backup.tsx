"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Download, Loader2, Database } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface Client {
    id: string;
    name: string;
}

export function AdvancedBackup() {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);

    const [mapping, setMapping] = useState({
        includeUsers: false,
        includeClients: true,
        includeProfiles: true,
        includeReviews: true,
        includeCategories: true,
        includeTemplates: true,
    });

    const [dateRange, setDateRange] = useState({
        enabled: false,
        from: "",
        to: "",
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch("/api/clients");
            if (res.ok) {
                const data = await res.json();
                setClients(data.clients || []);
            }
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        }
    };

    const handleClientToggle = (clientId: string) => {
        setSelectedClients((prev) =>
            prev.includes(clientId)
                ? prev.filter((id) => id !== clientId)
                : [...prev, clientId]
        );
    };

    const handleSelectAllClients = () => {
        if (selectedClients.length === clients.length) {
            setSelectedClients([]);
        } else {
            setSelectedClients(clients.map((c) => c.id));
        }
    };

    const handleBackup = async () => {
        setLoading(true);
        try {
            const payload: any = {
                ...mapping,
                clientIds: selectedClients,
            };

            if (dateRange.enabled && dateRange.from && dateRange.to) {
                payload.dateFrom = dateRange.from;
                payload.dateTo = dateRange.to;
            }

            const res = await fetch("/api/admin/backup-advanced", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `backup-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                toast.success(
                    `Backup created successfully! (${data.statistics.totalReviews} reviews, ${data.statistics.totalProfiles} profiles)`
                );
            } else {
                toast.error("Failed to create backup");
            }
        } catch (error) {
            toast.error("Failed to create backup");
            console.error("Backup error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-indigo-400" />
                    Advanced Backup with Data Mapping
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Choose exactly what data to include in your backup
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Data Types Selection */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white">Data Types to Include</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={mapping.includeUsers}
                                onCheckedChange={(checked) =>
                                    setMapping({ ...mapping, includeUsers: checked })
                                }
                            />
                            <Label className="text-slate-300">Users</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={mapping.includeClients}
                                onCheckedChange={(checked) =>
                                    setMapping({ ...mapping, includeClients: checked })
                                }
                            />
                            <Label className="text-slate-300">Clients</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={mapping.includeProfiles}
                                onCheckedChange={(checked) =>
                                    setMapping({ ...mapping, includeProfiles: checked })
                                }
                            />
                            <Label className="text-slate-300">Profiles</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={mapping.includeReviews}
                                onCheckedChange={(checked) =>
                                    setMapping({ ...mapping, includeReviews: checked })
                                }
                            />
                            <Label className="text-slate-300">Reviews</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={mapping.includeCategories}
                                onCheckedChange={(checked) =>
                                    setMapping({ ...mapping, includeCategories: checked })
                                }
                            />
                            <Label className="text-slate-300">Categories</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={mapping.includeTemplates}
                                onCheckedChange={(checked) =>
                                    setMapping({ ...mapping, includeTemplates: checked })
                                }
                            />
                            <Label className="text-slate-300">Templates</Label>
                        </div>
                    </div>
                </div>

                {/* Client Selection */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">
                            Select Specific Clients (Optional)
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectAllClients}
                            className="text-indigo-400 hover:text-indigo-300"
                        >
                            {selectedClients.length === clients.length ? "Deselect All" : "Select All"}
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                        {clients.map((client) => (
                            <div key={client.id} className="flex items-center space-x-2">
                                <Checkbox
                                    checked={selectedClients.includes(client.id)}
                                    onCheckedChange={() => handleClientToggle(client.id)}
                                />
                                <label className="text-sm text-slate-300 cursor-pointer">
                                    {client.name}
                                </label>
                            </div>
                        ))}
                        {clients.length === 0 && (
                            <p className="text-slate-400 text-sm col-span-3 text-center py-4">
                                No clients available
                            </p>
                        )}
                    </div>
                    <p className="text-xs text-slate-500">
                        Leave empty to backup all clients. {selectedClients.length} selected.
                    </p>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={dateRange.enabled}
                            onCheckedChange={(checked) =>
                                setDateRange({ ...dateRange, enabled: checked })
                            }
                        />
                        <Label className="text-white">Filter by Date Range</Label>
                    </div>

                    {dateRange.enabled && (
                        <div className="grid grid-cols-2 gap-4 pl-8">
                            <div className="space-y-2">
                                <Label className="text-slate-300 text-sm">From Date</Label>
                                <Input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) =>
                                        setDateRange({ ...dateRange, from: e.target.value })
                                    }
                                    className="bg-slate-900 border-slate-600 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300 text-sm">To Date</Label>
                                <Input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) =>
                                        setDateRange({ ...dateRange, to: e.target.value })
                                    }
                                    className="bg-slate-900 border-slate-600 text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Backup Button */}
                <div className="pt-4 border-t border-slate-700">
                    <Button
                        onClick={handleBackup}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Backup...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Create Advanced Backup
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
