"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users,
    Plus,
    Search,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Shield,
    ShieldOff,
    Key,
    TrendingUp,
    Star,
    Award,
    Zap,
    CheckCircle,
    XCircle,
    Loader2,
    Grid,
    List,
    UserCheck,
    Clock,
    Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Worker {
    id: string;
    name: string | null;
    email: string;
    canCreateReviews: boolean;
    canEditReviews: boolean;
    canDeleteReviews: boolean;
    canManageProfiles: boolean;
    createdAt: string;
    stats?: {
        totalLive: number;
        last30Days: number;
        avgCompletionDays: number;
        performanceScore: number;
    };
}

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [displayedWorkers, setDisplayedWorkers] = useState<Worker[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Create Worker Dialog
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newWorkerEmail, setNewWorkerEmail] = useState("");
    const [newWorkerPassword, setNewWorkerPassword] = useState("");
    const [newWorkerName, setNewWorkerName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Edit Permissions Dialog
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
    const [permissions, setPermissions] = useState({
        canCreateReviews: false,
        canEditReviews: false,
        canDeleteReviews: false,
        canManageProfiles: false,
    });
    const [isSavingPermissions, setIsSavingPermissions] = useState(false);

    // Reset Password Dialog
    const [resetWorker, setResetWorker] = useState<Worker | null>(null);
    const [resetPassword, setResetPassword] = useState("");
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    const fetchWorkers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);

            const res = await fetch(`/api/admin/workers?${params}`);
            if (res.ok) {
                const data = await res.json();

                // Fetch stats for each worker
                const workersWithStats = await Promise.all(
                    data.map(async (worker: Worker) => {
                        try {
                            const statsRes = await fetch(`/api/admin/workers/${worker.id}/stats`);
                            if (statsRes.ok) {
                                const stats = await statsRes.json();
                                return { ...worker, stats };
                            }
                        } catch (error) {
                            console.error(`Failed to fetch stats for worker ${worker.id}`);
                        }
                        return worker;
                    })
                );

                setWorkers(workersWithStats);
                setDisplayedWorkers(workersWithStats.slice(0, 50));
            }
        } catch (error) {
            console.error("Failed to fetch workers:", error);
            toast.error("Failed to load workers");
        } finally {
            setIsLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchWorkers();
    }, [fetchWorkers]);

    useEffect(() => {
        setDisplayedWorkers(workers.slice(0, 50));
    }, [workers]);

    const handleCreateWorker = async () => {
        if (!newWorkerEmail || !newWorkerPassword) {
            toast.error("Email and password are required");
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch("/api/admin/workers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: newWorkerEmail,
                    password: newWorkerPassword,
                    name: newWorkerName || null,
                }),
            });

            if (res.ok) {
                toast.success("Worker created successfully!");
                setIsCreateOpen(false);
                setNewWorkerEmail("");
                setNewWorkerPassword("");
                setNewWorkerName("");
                fetchWorkers();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create worker");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditPermissions = (worker: Worker) => {
        setEditingWorker(worker);
        setPermissions({
            canCreateReviews: worker.canCreateReviews,
            canEditReviews: worker.canEditReviews,
            canDeleteReviews: worker.canDeleteReviews,
            canManageProfiles: worker.canManageProfiles,
        });
    };

    const handleSavePermissions = async () => {
        if (!editingWorker) return;

        setIsSavingPermissions(true);
        try {
            const res = await fetch(`/api/admin/workers/${editingWorker.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(permissions),
            });

            if (res.ok) {
                toast.success("Permissions updated!");
                setEditingWorker(null);
                fetchWorkers();
            } else {
                toast.error("Failed to update permissions");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSavingPermissions(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetWorker || !resetPassword) {
            toast.error("Password is required");
            return;
        }

        setIsResettingPassword(true);
        try {
            const res = await fetch(`/api/admin/workers/${resetWorker.id}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: resetPassword }),
            });

            if (res.ok) {
                toast.success("Password reset successfully!");
                setResetWorker(null);
                setResetPassword("");
            } else {
                toast.error("Failed to reset password");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsResettingPassword(false);
        }
    };

    const handleDelete = async (workerId: string) => {
        if (!confirm("Are you sure? This will permanently delete this worker account.")) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/workers/${workerId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Worker deleted");
                fetchWorkers();
            } else {
                toast.error("Failed to delete worker");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const loadMore = () => {
        const currentLength = displayedWorkers.length;
        const newWorkers = workers.slice(0, currentLength + 50);
        setDisplayedWorkers(newWorkers);
    };

    // Stats calculation
    const stats = {
        total: workers.length,
        avgPerformance: workers.reduce((sum, w) => sum + (w.stats?.performanceScore || 0), 0) / (workers.length || 1),
        totalLive: workers.reduce((sum, w) => sum + (w.stats?.totalLive || 0), 0),
        activeWorkers: workers.filter(w => (w.stats?.last30Days || 0) > 0).length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/50">
                            <Users className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">Workers</h1>
                            <p className="text-slate-400 mt-1">Manage your team members and permissions</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Worker
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-300 font-medium">Total Workers</p>
                                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <Users className="text-blue-400" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-cyan-300 font-medium">Active (30d)</p>
                                <p className="text-3xl font-bold text-white mt-2">{stats.activeWorkers}</p>
                            </div>
                            <div className="p-3 bg-cyan-500/20 rounded-xl">
                                <UserCheck className="text-cyan-400" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-300 font-medium">Total Live</p>
                                <p className="text-3xl font-bold text-white mt-2">{stats.totalLive}</p>
                            </div>
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <Target className="text-emerald-400" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-amber-300 font-medium">Avg Performance</p>
                                <p className="text-3xl font-bold text-white mt-2">{Math.round(stats.avgPerformance)}%</p>
                            </div>
                            <div className="p-3 bg-amber-500/20 rounded-xl">
                                <Award className="text-amber-400" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex-1 w-full sm:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                <Input
                                    placeholder="Search workers..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center border border-slate-700 rounded-lg">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode("grid")}
                                className={viewMode === "grid" ? "bg-slate-800" : ""}
                            >
                                <Grid size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode("list")}
                                className={viewMode === "list" ? "bg-slate-800" : ""}
                            >
                                <List size={16} />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && displayedWorkers.length === 0 && (
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardContent className="py-20">
                        <div className="text-center">
                            <Users className="mx-auto text-slate-600 mb-4" size={64} />
                            <h3 className="text-xl font-semibold text-white mb-2">No workers found</h3>
                            <p className="text-slate-400 mb-6">
                                {search ? "Try adjusting your search" : "Get started by adding your first worker"}
                            </p>
                            {!search && (
                                <Button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Worker
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Grid View */}
            {!isLoading && displayedWorkers.length > 0 && viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedWorkers.map((worker) => (
                        <Card
                            key={worker.id}
                            className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-blue-500/50 transition-all group overflow-hidden"
                        >
                            <div className="h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500"></div>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                                            {(worker.name || worker.email).charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <CardTitle className="text-white text-base">{worker.name || "No Name"}</CardTitle>
                                            <p className="text-xs text-slate-400 mt-1">{worker.email}</p>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                                            <DropdownMenuItem
                                                onClick={() => handleEditPermissions(worker)}
                                                className="text-slate-300 hover:text-white cursor-pointer"
                                            >
                                                <Shield size={14} className="mr-2" />
                                                Edit Permissions
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setResetWorker(worker)}
                                                className="text-slate-300 hover:text-white cursor-pointer"
                                            >
                                                <Key size={14} className="mr-2" />
                                                Reset Password
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-slate-800" />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(worker.id)}
                                                className="text-red-400 hover:text-red-300 cursor-pointer"
                                            >
                                                <Trash2 size={14} className="mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Performance Stats */}
                                {worker.stats && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400">Total Live</p>
                                            <p className="text-lg font-bold text-blue-400 mt-1">{worker.stats.totalLive}</p>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400">Last 30d</p>
                                            <p className="text-lg font-bold text-cyan-400 mt-1">{worker.stats.last30Days}</p>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400">Avg Days</p>
                                            <p className="text-lg font-bold text-emerald-400 mt-1">{worker.stats.avgCompletionDays}d</p>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400">Score</p>
                                            <p className="text-lg font-bold text-amber-400 mt-1">{worker.stats.performanceScore}%</p>
                                        </div>
                                    </div>
                                )}

                                {/* Permissions */}
                                <div className="border-t border-slate-800 pt-3">
                                    <p className="text-xs text-slate-400 mb-2">Permissions</p>
                                    <div className="flex flex-wrap gap-1">
                                        {worker.canCreateReviews && (
                                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                                                Create
                                            </Badge>
                                        )}
                                        {worker.canEditReviews && (
                                            <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-0 text-xs">
                                                Edit
                                            </Badge>
                                        )}
                                        {worker.canDeleteReviews && (
                                            <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-0 text-xs">
                                                Delete
                                            </Badge>
                                        )}
                                        {worker.canManageProfiles && (
                                            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                                                Profiles
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* List View */}
            {!isLoading && displayedWorkers.length > 0 && viewMode === "list" && (
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-800/50 border-b border-slate-800">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-xs font-medium text-slate-400 uppercase">Worker</th>
                                        <th className="text-center py-4 px-6 text-xs font-medium text-slate-400 uppercase">Performance</th>
                                        <th className="text-left py-4 px-6 text-xs font-medium text-slate-400 uppercase">Permissions</th>
                                        <th className="text-right py-4 px-6 text-xs font-medium text-slate-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedWorkers.map((worker) => (
                                        <tr key={worker.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                                        {(worker.name || worker.email).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{worker.name || "No Name"}</p>
                                                        <p className="text-xs text-slate-400">{worker.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {worker.stats && (
                                                    <div className="flex items-center justify-center gap-4">
                                                        <div className="text-center">
                                                            <p className="text-lg font-bold text-blue-400">{worker.stats.totalLive}</p>
                                                            <p className="text-xs text-slate-500">Total</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-lg font-bold text-cyan-400">{worker.stats.last30Days}</p>
                                                            <p className="text-xs text-slate-500">30d</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-lg font-bold text-amber-400">{worker.stats.performanceScore}%</p>
                                                            <p className="text-xs text-slate-500">Score</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {worker.canCreateReviews && <Badge className="bg-blue-500/20 text-blue-400 border-0">Create</Badge>}
                                                    {worker.canEditReviews && <Badge className="bg-cyan-500/20 text-cyan-400 border-0">Edit</Badge>}
                                                    {worker.canDeleteReviews && <Badge className="bg-red-500/20 text-red-400 border-0">Delete</Badge>}
                                                    {worker.canManageProfiles && <Badge className="bg-purple-500/20 text-purple-400 border-0">Profiles</Badge>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                                            <MoreVertical size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                                                        <DropdownMenuItem
                                                            onClick={() => handleEditPermissions(worker)}
                                                            className="text-slate-300 hover:text-white cursor-pointer"
                                                        >
                                                            <Shield size={14} className="mr-2" />
                                                            Edit Permissions
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setResetWorker(worker)}
                                                            className="text-slate-300 hover:text-white cursor-pointer"
                                                        >
                                                            <Key size={14} className="mr-2" />
                                                            Reset Password
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-800" />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(worker.id)}
                                                            className="text-red-400 hover:text-red-300 cursor-pointer"
                                                        >
                                                            <Trash2 size={14} className="mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Load More */}
            {!isLoading && displayedWorkers.length < workers.length && (
                <div className="mt-6 text-center">
                    <Button
                        onClick={loadMore}
                        variant="outline"
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                        Load More ({workers.length - displayedWorkers.length} remaining)
                    </Button>
                </div>
            )}

            {/* Create Worker Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="bg-slate-900 border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-white">Add New Worker</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">Name (Optional)</Label>
                            <Input
                                id="name"
                                value={newWorkerName}
                                onChange={(e) => setNewWorkerName(e.target.value)}
                                placeholder="Enter worker name"
                                className="bg-slate-800/50 border-slate-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newWorkerEmail}
                                onChange={(e) => setNewWorkerEmail(e.target.value)}
                                placeholder="worker@example.com"
                                className="bg-slate-800/50 border-slate-700 text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={newWorkerPassword}
                                onChange={(e) => setNewWorkerPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                className="bg-slate-800/50 border-slate-700 text-white"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateOpen(false)}
                            className="border-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateWorker}
                            disabled={isCreating}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Worker"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Permissions Dialog */}
            <Dialog open={!!editingWorker} onOpenChange={() => setEditingWorker(null)}>
                <DialogContent className="bg-slate-900 border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-white">Edit Permissions</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="canCreateReviews" className="text-slate-300">Can Create Reviews</Label>
                            <Switch
                                id="canCreateReviews"
                                checked={permissions.canCreateReviews}
                                onCheckedChange={(checked) => setPermissions({ ...permissions, canCreateReviews: checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="canEditReviews" className="text-slate-300">Can Edit Reviews</Label>
                            <Switch
                                id="canEditReviews"
                                checked={permissions.canEditReviews}
                                onCheckedChange={(checked) => setPermissions({ ...permissions, canEditReviews: checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="canDeleteReviews" className="text-slate-300">Can Delete Reviews</Label>
                            <Switch
                                id="canDeleteReviews"
                                checked={permissions.canDeleteReviews}
                                onCheckedChange={(checked) => setPermissions({ ...permissions, canDeleteReviews: checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="canManageProfiles" className="text-slate-300">Can Manage Profiles</Label>
                            <Switch
                                id="canManageProfiles"
                                checked={permissions.canManageProfiles}
                                onCheckedChange={(checked) => setPermissions({ ...permissions, canManageProfiles: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditingWorker(null)}
                            className="border-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSavePermissions}
                            disabled={isSavingPermissions}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                            {isSavingPermissions ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={!!resetWorker} onOpenChange={() => setResetWorker(null)}>
                <DialogContent className="bg-slate-900 border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-white">Reset Password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={resetPassword}
                                onChange={(e) => setResetPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                className="bg-slate-800/50 border-slate-700 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setResetWorker(null)}
                            className="border-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleResetPassword}
                            disabled={isResettingPassword}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                            {isResettingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
