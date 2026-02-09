"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Users,
    Plus,
    Loader2,
    Trash2,
    Shield,
    Eye,
    EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Worker {
    id: string;
    email: string;
    name: string | null;
    canCreateReviews: boolean;
    canEditReviews: boolean;
    canDeleteReviews: boolean;
    canManageProfiles: boolean;
    createdAt: string;
}
interface WorkerStats {
    id: string;
    name: string | null;
    email: string;
    stats: {
        created: Record<string, number>;
        updated: Record<string, number>;
        totalCreated: number;
        totalUpdated: number;
        totalLive: number;
    };
}

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [workerStats, setWorkerStats] = useState<WorkerStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [newWorker, setNewWorker] = useState({
        email: "",
        password: "",
        name: "",
        canCreateReviews: true,
        canEditReviews: true,
        canDeleteReviews: false,
        canManageProfiles: false,
    });

    const fetchWorkers = useCallback(async () => {
        try {
            setLoading(true);
            const [workersRes, statsRes] = await Promise.all([
                fetch("/api/admin/workers"),
                fetch("/api/admin/workers/stats"),
            ]);
            if (!workersRes.ok) throw new Error("Failed to fetch");
            const workersData = await workersRes.json();
            setWorkers(workersData.workers || []);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setWorkerStats(statsData || []);
            }
        } catch {
            toast.error("Failed to load workers");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkers();
    }, [fetchWorkers]);

    const handleCreateWorker = async () => {
        if (!newWorker.email.trim() || !newWorker.password.trim()) {
            toast.error("Email and password are required");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/admin/workers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newWorker),
            });

            if (res.ok) {
                toast.success("Worker created successfully");
                setIsDialogOpen(false);
                setNewWorker({
                    email: "",
                    password: "",
                    name: "",
                    canCreateReviews: true,
                    canEditReviews: true,
                    canDeleteReviews: false,
                    canManageProfiles: false,
                });
                fetchWorkers();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create worker");
            }
        } catch {
            toast.error("Failed to create worker");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTogglePermission = async (
        workerId: string,
        permission: string,
        currentValue: boolean
    ) => {
        try {
            const res = await fetch(`/api/admin/workers/${workerId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [permission]: !currentValue }),
            });

            if (res.ok) {
                setWorkers((prev) =>
                    prev.map((w) =>
                        w.id === workerId ? { ...w, [permission]: !currentValue } : w
                    )
                );
                toast.success("Permission updated");
            } else {
                toast.error("Failed to update permission");
            }
        } catch {
            toast.error("Failed to update permission");
        }
    };

    const handleDeleteWorker = async (workerId: string) => {
        if (!confirm("Are you sure you want to delete this worker?")) return;

        try {
            const res = await fetch(`/api/admin/workers/${workerId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setWorkers((prev) => prev.filter((w) => w.id !== workerId));
                toast.success("Worker deleted");
            } else {
                toast.error("Failed to delete worker");
            }
        } catch {
            toast.error("Failed to delete worker");
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="text-indigo-400" />
                        Workers
                    </h1>
                    <p className="text-slate-400">
                        Manage worker accounts and their permissions
                    </p>
                </div>
                <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Worker
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Total Workers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{workers.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Total Reviews Created
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-400">
                            {workerStats.reduce((sum, w) => sum + w.stats.totalCreated, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Total LIVE by Workers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                            {workerStats.reduce((sum, w) => sum + (w.stats.updated['LIVE'] || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Worker Performance Table */}
            {workerStats.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Worker Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-400 border-b border-slate-700">
                                        <th className="text-left py-2 px-3">Worker</th>
                                        <th className="text-center py-2 px-3">Created</th>
                                        <th className="text-center py-2 px-3">LIVE</th>
                                        <th className="text-center py-2 px-3">APPLIED</th>
                                        <th className="text-center py-2 px-3">DONE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workerStats.map((ws) => (
                                        <tr key={ws.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                            <td className="py-2 px-3 text-white">{ws.name || ws.email}</td>
                                            <td className="py-2 px-3 text-center text-slate-300">{ws.stats.totalCreated}</td>
                                            <td className="py-2 px-3 text-center text-green-400">{ws.stats.totalLive || 0}</td>
                                            <td className="py-2 px-3 text-center text-purple-400">{ws.stats.updated['APPLIED'] || 0}</td>
                                            <td className="py-2 px-3 text-center text-emerald-400">{ws.stats.updated['DONE'] || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Workers List */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : workers.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-slate-500 mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-white">
                            No workers yet
                        </h3>
                        <p className="text-slate-400 mb-4">
                            Create a worker account to delegate tasks
                        </p>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Worker
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {workers.map((worker) => (
                        <Card
                            key={worker.id}
                            className="bg-slate-800/50 border-slate-700"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Shield className="h-4 w-4 text-indigo-400" />
                                            <h3 className="font-semibold text-white">
                                                {worker.name || worker.email}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-slate-400">{worker.email}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Created: {format(new Date(worker.createdAt), "PP")}
                                        </p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteWorker(worker.id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Permissions */}
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-slate-300 text-sm">
                                            Create Reviews
                                        </Label>
                                        <Switch
                                            checked={worker.canCreateReviews}
                                            onCheckedChange={() =>
                                                handleTogglePermission(
                                                    worker.id,
                                                    "canCreateReviews",
                                                    worker.canCreateReviews
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-slate-300 text-sm">
                                            Edit Reviews
                                        </Label>
                                        <Switch
                                            checked={worker.canEditReviews}
                                            onCheckedChange={() =>
                                                handleTogglePermission(
                                                    worker.id,
                                                    "canEditReviews",
                                                    worker.canEditReviews
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-slate-300 text-sm">
                                            Delete Reviews
                                        </Label>
                                        <Switch
                                            checked={worker.canDeleteReviews}
                                            onCheckedChange={() =>
                                                handleTogglePermission(
                                                    worker.id,
                                                    "canDeleteReviews",
                                                    worker.canDeleteReviews
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-slate-300 text-sm">
                                            Manage Profiles
                                        </Label>
                                        <Switch
                                            checked={worker.canManageProfiles}
                                            onCheckedChange={() =>
                                                handleTogglePermission(
                                                    worker.id,
                                                    "canManageProfiles",
                                                    worker.canManageProfiles
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Worker Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Create Worker Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">
                                Email <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={newWorker.email}
                                onChange={(e) =>
                                    setNewWorker({ ...newWorker, email: e.target.value })
                                }
                                placeholder="worker@example.com"
                                className="bg-slate-900 border-slate-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">
                                Password <span className="text-red-400">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={newWorker.password}
                                    onChange={(e) =>
                                        setNewWorker({ ...newWorker, password: e.target.value })
                                    }
                                    placeholder="••••••••"
                                    className="bg-slate-900 border-slate-600 text-white pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-white"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">
                                Name (optional)
                            </Label>
                            <Input
                                id="name"
                                value={newWorker.name}
                                onChange={(e) =>
                                    setNewWorker({ ...newWorker, name: e.target.value })
                                }
                                placeholder="Worker Name"
                                className="bg-slate-900 border-slate-600 text-white"
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <Label className="text-slate-300">Permissions</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-400 text-sm">
                                        Create Reviews
                                    </Label>
                                    <Switch
                                        checked={newWorker.canCreateReviews}
                                        onCheckedChange={(checked) =>
                                            setNewWorker({ ...newWorker, canCreateReviews: checked })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-400 text-sm">
                                        Edit Reviews
                                    </Label>
                                    <Switch
                                        checked={newWorker.canEditReviews}
                                        onCheckedChange={(checked) =>
                                            setNewWorker({ ...newWorker, canEditReviews: checked })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-400 text-sm">
                                        Delete Reviews
                                    </Label>
                                    <Switch
                                        checked={newWorker.canDeleteReviews}
                                        onCheckedChange={(checked) =>
                                            setNewWorker({ ...newWorker, canDeleteReviews: checked })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-400 text-sm">
                                        Manage Profiles
                                    </Label>
                                    <Switch
                                        checked={newWorker.canManageProfiles}
                                        onCheckedChange={(checked) =>
                                            setNewWorker({ ...newWorker, canManageProfiles: checked })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="border-slate-600 text-slate-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateWorker}
                            disabled={isSubmitting || !newWorker.email.trim() || !newWorker.password.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Worker"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
