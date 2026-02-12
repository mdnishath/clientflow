"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Users,
    Plus,
    Search,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Archive,
    RotateCcw,
    Mail,
    Phone,
    FileText,
    TrendingUp,
    Star,
    UserPlus,
    CheckCircle,
    XCircle,
    Loader2,
    Download,
    Filter,
    Grid,
    List,
    Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientForm } from "@/components/clients/client-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
    isArchived: boolean;
    _count: { gmbProfiles: number };
    userAccount: {
        id: string;
        email: string;
        name: string | null;
    } | null;
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [displayedClients, setDisplayedClients] = useState<Client[]>([]);
    const [search, setSearch] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const fetchClients = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (showArchived) params.set("archived", "true");
            params.set("limit", "1000");

            const res = await fetch(`/api/clients?${params}`);
            if (res.ok) {
                const data = await res.json();
                setClients(data.data);
                setDisplayedClients(data.data.slice(0, 50));
            }
        } catch (error) {
            console.error("Failed to fetch clients:", error);
            toast.error("Failed to load clients");
        } finally {
            setIsLoading(false);
        }
    }, [search, showArchived]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    useEffect(() => {
        setDisplayedClients(clients.slice(0, 50));
    }, [clients]);

    const handleArchive = async (clientId: string, archive: boolean) => {
        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isArchived: archive }),
            });

            if (res.ok) {
                toast.success(archive ? "Client archived" : "Client restored");
                fetchClients();
            } else {
                toast.error("Failed to update client");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDelete = async (clientId: string) => {
        if (!confirm("Are you sure? This will permanently delete this client and all associated data.")) {
            return;
        }

        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Client deleted permanently");
                fetchClients();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete client");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingClient(null);
        fetchClients();
    };

    const loadMore = () => {
        const currentLength = displayedClients.length;
        const newClients = clients.slice(0, currentLength + 50);
        setDisplayedClients(newClients);
    };

    // Stats calculation
    const stats = {
        total: clients.filter(c => !c.isArchived).length,
        archived: clients.filter(c => c.isArchived).length,
        withAccounts: clients.filter(c => c.userAccount).length,
        totalProfiles: clients.reduce((sum, c) => sum + c._count.gmbProfiles, 0),
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/50">
                            <Users className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">Clients</h1>
                            <p className="text-slate-400 mt-1">Manage your client accounts and relationships</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingClient(null);
                            setIsFormOpen(true);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Client
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-300 font-medium">Total Clients</p>
                                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-indigo-500/20 rounded-xl">
                                <Users className="text-indigo-400" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-300 font-medium">With Accounts</p>
                                <p className="text-3xl font-bold text-white mt-2">{stats.withAccounts}</p>
                            </div>
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <Crown className="text-purple-400" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-pink-300 font-medium">Total Profiles</p>
                                <p className="text-3xl font-bold text-white mt-2">{stats.totalProfiles}</p>
                            </div>
                            <div className="p-3 bg-pink-500/20 rounded-xl">
                                <FileText className="text-pink-400" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-300 font-medium">Archived</p>
                                <p className="text-3xl font-bold text-white mt-2">{stats.archived}</p>
                            </div>
                            <div className="p-3 bg-orange-500/20 rounded-xl">
                                <Archive className="text-orange-400" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Controls */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex-1 w-full sm:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                <Input
                                    placeholder="Search clients..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant={showArchived ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowArchived(!showArchived)}
                                className={showArchived ? "bg-orange-600 hover:bg-orange-700" : "border-slate-700 text-slate-300"}
                            >
                                <Archive size={16} className="mr-2" />
                                {showArchived ? "Hide" : "Show"} Archived
                            </Button>

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
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-purple-500" size={40} />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && displayedClients.length === 0 && (
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardContent className="py-20">
                        <div className="text-center">
                            <Users className="mx-auto text-slate-600 mb-4" size={64} />
                            <h3 className="text-xl font-semibold text-white mb-2">No clients found</h3>
                            <p className="text-slate-400 mb-6">
                                {search ? "Try adjusting your search" : "Get started by adding your first client"}
                            </p>
                            {!search && (
                                <Button
                                    onClick={() => setIsFormOpen(true)}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Client
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Grid View */}
            {!isLoading && displayedClients.length > 0 && viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedClients.map((client) => (
                        <Card
                            key={client.id}
                            className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-purple-500/50 transition-all group overflow-hidden"
                        >
                            <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            {client.name}
                                            {client.userAccount && (
                                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                                    <Crown className="w-3 h-3 mr-1" />
                                                    Account
                                                </Badge>
                                            )}
                                        </CardTitle>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-slate-400 hover:text-white"
                                            >
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href={`/clients/${client.id}`}
                                                    className="flex items-center text-slate-300 hover:text-white cursor-pointer"
                                                >
                                                    <Eye size={14} className="mr-2" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleEdit(client)}
                                                className="text-slate-300 hover:text-white cursor-pointer"
                                            >
                                                <Edit size={14} className="mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-slate-800" />
                                            {!client.isArchived ? (
                                                <DropdownMenuItem
                                                    onClick={() => handleArchive(client.id, true)}
                                                    className="text-orange-400 hover:text-orange-300 cursor-pointer"
                                                >
                                                    <Archive size={14} className="mr-2" />
                                                    Archive
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    onClick={() => handleArchive(client.id, false)}
                                                    className="text-green-400 hover:text-green-300 cursor-pointer"
                                                >
                                                    <RotateCcw size={14} className="mr-2" />
                                                    Restore
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(client.id)}
                                                className="text-red-400 hover:text-red-300 cursor-pointer"
                                            >
                                                <Trash2 size={14} className="mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {client.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail size={14} className="text-slate-500" />
                                        <span className="text-slate-400">{client.email}</span>
                                    </div>
                                )}

                                {client.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone size={14} className="text-slate-500" />
                                        <span className="text-slate-400">{client.phone}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-purple-400" />
                                        <span className="text-sm text-slate-300">
                                            {client._count.gmbProfiles} {client._count.gmbProfiles === 1 ? "Profile" : "Profiles"}
                                        </span>
                                    </div>

                                    {client.isArchived && (
                                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                            Archived
                                        </Badge>
                                    )}
                                </div>

                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                                >
                                    <Link href={`/clients/${client.id}`}>
                                        View Profiles
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* List View */}
            {!isLoading && displayedClients.length > 0 && viewMode === "list" && (
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-800/50 border-b border-slate-800">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="text-center py-4 px-6 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Profiles
                                        </th>
                                        <th className="text-center py-4 px-6 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="text-right py-4 px-6 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedClients.map((client, idx) => (
                                        <tr
                                            key={client.id}
                                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                        {client.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{client.name}</p>
                                                        {client.userAccount && (
                                                            <Badge className="bg-purple-500/20 text-purple-400 border-0 mt-1">
                                                                Has Account
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    {client.email && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                                            <Mail size={12} />
                                                            {client.email}
                                                        </div>
                                                    )}
                                                    {client.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                                            <Phone size={12} />
                                                            {client.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                                    {client._count.gmbProfiles}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {client.isArchived ? (
                                                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                                        Archived
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                                                        Active
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                                            <MoreVertical size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/clients/${client.id}`}
                                                                className="flex items-center cursor-pointer text-slate-300 hover:text-white"
                                                            >
                                                                <Eye size={14} className="mr-2" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleEdit(client)}
                                                            className="text-slate-300 hover:text-white cursor-pointer"
                                                        >
                                                            <Edit size={14} className="mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-800" />
                                                        {!client.isArchived ? (
                                                            <DropdownMenuItem
                                                                onClick={() => handleArchive(client.id, true)}
                                                                className="text-orange-400 hover:text-orange-300 cursor-pointer"
                                                            >
                                                                <Archive size={14} className="mr-2" />
                                                                Archive
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                onClick={() => handleArchive(client.id, false)}
                                                                className="text-green-400 hover:text-green-300 cursor-pointer"
                                                            >
                                                                <RotateCcw size={14} className="mr-2" />
                                                                Restore
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(client.id)}
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
            {!isLoading && displayedClients.length < clients.length && (
                <div className="mt-6 text-center">
                    <Button
                        onClick={loadMore}
                        variant="outline"
                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                        Load More ({clients.length - displayedClients.length} remaining)
                    </Button>
                </div>
            )}

            {/* Client Form Dialog */}
            <ClientForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                client={editingClient}
                onSuccess={handleFormClose}
            />
        </div>
    );
}
