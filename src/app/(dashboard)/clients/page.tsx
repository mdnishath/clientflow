"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import { Plus, Search, Archive, MoreVertical, Trash2, Pencil, RotateCcw, CheckSquare, Loader2, Users, UserPlus, Shield, ShieldOff, Key, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ClientForm } from "@/components/clients/client-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface UserAccount {
    id: string;
    email: string;
    name: string | null;
    canDelete: boolean;
}

interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
    isArchived: boolean;
    _count: { gmbProfiles: number };
    userAccount: UserAccount | null; // Linked login account
}

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function ClientsPage() {
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [displayedCount, setDisplayedCount] = useState(100);
    const [search, setSearch] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Account management
    const [clientForAccount, setClientForAccount] = useState<Client | null>(null);
    const [accountEmail, setAccountEmail] = useState("");
    const [accountPassword, setAccountPassword] = useState("");
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);

    const fetchClients = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (showArchived) params.set("archived", "true");
            params.set("limit", "5000");

            const res = await fetch(`/api/clients?${params}`);
            if (res.ok) {
                const data = await res.json();
                setAllClients(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        } finally {
            setIsLoading(false);
        }
    }, [search, showArchived]);

    // Infinite scroll logic
    const clients = allClients.slice(0, displayedCount);
    const hasMore = displayedCount < allClients.length;
    const loadMore = useCallback(() => {
        setDisplayedCount(prev => Math.min(prev + 100, allClients.length));
    }, [allClients.length]);

    // Reset displayed count when filters change
    useEffect(() => {
        setDisplayedCount(100);
        setSelectedIds([]);
    }, [search, showArchived]);

    // Fetch clients when filters change
    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const handleArchive = async (clientId: string) => {
        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Client archived");
                fetchClients();
            }
        } catch (error) {
            console.error("Failed to archive client:", error);
            toast.error("Failed to archive");
        }
        setActiveMenu(null);
    };

    const handleRestore = async (clientId: string) => {
        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isArchived: false }),
            });
            if (res.ok) {
                toast.success("Client restored");
                fetchClients();
            }
        } catch (error) {
            console.error("Failed to restore client:", error);
            toast.error("Failed to restore");
        }
        setActiveMenu(null);
    };

    const handleDeletePermanently = async (clientId: string) => {
        if (!confirm("Permanently delete this client? This will also delete all their profiles and reviews. This cannot be undone.")) return;

        try {
            const res = await fetch(`/api/clients/${clientId}?permanent=true`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Client permanently deleted");
                fetchClients();
            }
        } catch (error) {
            console.error("Failed to delete client:", error);
            toast.error("Failed to delete");
        }
        setActiveMenu(null);
    };

    // Toggle single selection
    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Select all on current page
    const selectAllOnPage = () => {
        const pageIds = clients.map((c) => c.id);
        const allSelected = pageIds.every((id) => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        } else {
            setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
        }
    };

    // Bulk archive
    const handleBulkArchive = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Archive ${selectedIds.length} client(s)?`)) return;

        setIsBulkProcessing(true);
        try {
            await Promise.all(
                selectedIds.map((id) =>
                    fetch(`/api/clients/${id}`, { method: "DELETE" })
                )
            );
            toast.success(`${selectedIds.length} client(s) archived`);
            setSelectedIds([]);
            fetchClients();
        } catch (error) {
            console.error("Bulk archive error:", error);
            toast.error("Failed to archive");
        } finally {
            setIsBulkProcessing(false);
        }
    };

    // Bulk delete permanently
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`PERMANENTLY delete ${selectedIds.length} client(s)? This will delete all their data. This cannot be undone!`)) return;

        setIsBulkProcessing(true);
        try {
            await Promise.all(
                selectedIds.map((id) =>
                    fetch(`/api/clients/${id}?permanent=true`, { method: "DELETE" })
                )
            );
            toast.success(`${selectedIds.length} client(s) permanently deleted`);
            setSelectedIds([]);
            fetchClients();
        } catch (error) {
            console.error("Bulk delete error:", error);
            toast.error("Failed to delete");
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleFormSuccess = () => {
        fetchClients();
        setIsFormOpen(false);
        setEditingClient(null);
    };

    // Open create account dialog
    const openCreateAccountDialog = (client: Client) => {
        setClientForAccount(client);
        setAccountEmail(client.email || "");
        setAccountPassword("");
    };

    // Create client login account
    const handleCreateAccount = async () => {
        if (!clientForAccount || !accountEmail || !accountPassword) return;

        setIsCreatingAccount(true);
        try {
            const res = await fetch(`/api/clients/${clientForAccount.id}/account`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: accountEmail,
                    password: accountPassword,
                    canDelete: false,
                }),
            });

            if (res.ok) {
                toast.success(`Login account created for ${clientForAccount.name}`);
                setClientForAccount(null);
                fetchClients();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create account");
            }
        } catch (error) {
            console.error("Error creating account:", error);
            toast.error("Failed to create account");
        } finally {
            setIsCreatingAccount(false);
        }
    };

    // Toggle delete permission
    const handleToggleDeletePermission = async (client: Client) => {
        if (!client.userAccount) return;

        try {
            const res = await fetch(`/api/clients/${client.id}/account`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ canDelete: !client.userAccount.canDelete }),
            });

            if (res.ok) {
                toast.success(
                    client.userAccount.canDelete
                        ? "Delete permission revoked"
                        : "Delete permission granted"
                );
                fetchClients();
            }
        } catch (error) {
            console.error("Error toggling permission:", error);
            toast.error("Failed to update permission");
        }
        setActiveMenu(null);
    };

    const allPageSelected = clients.length > 0 && clients.every((c) => selectedIds.includes(c.id));

    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Users className="text-indigo-400" />
                        Clients
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {meta ? `${meta.total} total clients` : "Manage your GMB clients"}
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setEditingClient(null);
                        setIsFormOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus size={16} className="mr-2" />
                    Add Client
                </Button>
            </div>

            {/* Filters + Bulk Actions */}
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <div className="relative flex-1">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                    size={16}
                                />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search clients..."
                                    className="pl-9 bg-slate-800 border-slate-700 text-white w-full"
                                />
                            </div>
                            <Button
                                variant={showArchived ? "secondary" : "outline"}
                                onClick={() => setShowArchived(!showArchived)}
                                className={`w-full sm:w-auto ${showArchived
                                        ? "bg-amber-600/20 text-amber-400 border-amber-600/50"
                                        : "border-slate-700 text-slate-400 hover:text-white"
                                    }`}
                            >
                                <Archive size={16} className="mr-2" />
                                {showArchived ? "Archived" : "Show Archived"}
                            </Button>
                        </div>

                        {/* Bulk Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={selectAllOnPage}
                                className="border-slate-700"
                            >
                                <CheckSquare size={14} className="mr-1" />
                                {allPageSelected ? "Deselect" : "Select All"}
                            </Button>
                            {selectedIds.length > 0 && (
                                <>
                                    <Badge className="bg-indigo-600 text-white">
                                        {selectedIds.length} selected
                                    </Badge>
                                    {!showArchived && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleBulkArchive}
                                            disabled={isBulkProcessing}
                                            className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10"
                                        >
                                            {isBulkProcessing ? <Loader2 size={14} className="animate-spin mr-1" /> : <Archive size={14} className="mr-1" />}
                                            Archive
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                        disabled={isBulkProcessing}
                                        className="border-red-600/50 text-red-400 hover:bg-red-600/10"
                                    >
                                        {isBulkProcessing ? <Loader2 size={14} className="animate-spin mr-1" /> : <Trash2 size={14} className="mr-1" />}
                                        Delete Forever
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Client List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
            ) : clients.length === 0 ? (
                <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="py-12 text-center">
                        <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500">
                            {search
                                ? "No clients found matching your search"
                                : showArchived
                                    ? "No archived clients"
                                    : "No clients yet. Add your first client!"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <InfiniteScroll
                    dataLength={clients.length}
                    next={loadMore}
                    hasMore={hasMore}
                    loader={
                        <div className="col-span-full text-center py-4 text-slate-400 text-sm">
                            <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                            Loading more clients...
                        </div>
                    }
                    endMessage={
                        <div className="col-span-full text-center py-4 text-slate-500 text-sm">
                            ✓ All {allClients.length} clients loaded
                        </div>
                    }
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {clients.map((client) => (
                        <Card
                            key={client.id}
                            className={`border-slate-700 hover:border-slate-600 transition-all group ${selectedIds.includes(client.id)
                                ? "ring-2 ring-indigo-500 bg-indigo-600/10"
                                : "bg-slate-800/50"
                                }`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <Checkbox
                                            checked={selectedIds.includes(client.id)}
                                            onCheckedChange={() => toggleSelection(client.id)}
                                            className="mt-1 border-slate-500"
                                        />
                                        <Link href={`/clients/${client.id}`} className="flex-1 min-w-0">
                                            <h3 className="font-medium text-white group-hover:text-indigo-400 transition-colors truncate">
                                                {client.name}
                                            </h3>
                                            {client.email && (
                                                <p className="text-sm text-slate-500 truncate mt-1">
                                                    {client.email}
                                                </p>
                                            )}
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setActiveMenu(activeMenu === client.id ? null : client.id)
                                            }
                                            className="text-slate-500 hover:text-white"
                                        >
                                            <MoreVertical size={16} />
                                        </Button>
                                        {activeMenu === client.id && (
                                            <div className="absolute right-0 top-8 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-20 min-w-[160px]">
                                                <button
                                                    onClick={() => {
                                                        setEditingClient(client);
                                                        setIsFormOpen(true);
                                                        setActiveMenu(null);
                                                    }}
                                                    className="w-full px-3 py-2 text-sm text-left text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                                                >
                                                    <Pencil size={14} className="text-blue-400" />
                                                    Edit
                                                </button>
                                                {client.isArchived ? (
                                                    <button
                                                        onClick={() => handleRestore(client.id)}
                                                        className="w-full px-3 py-2 text-sm text-left text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                                                    >
                                                        <RotateCcw size={14} className="text-green-400" />
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleArchive(client.id)}
                                                        className="w-full px-3 py-2 text-sm text-left text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                                                    >
                                                        <Archive size={14} className="text-yellow-400" />
                                                        Archive
                                                    </button>
                                                )}
                                                {/* Permission toggle for clients with accounts */}
                                                {client.userAccount && (
                                                    <button
                                                        onClick={() => handleToggleDeletePermission(client)}
                                                        className="w-full px-3 py-2 text-sm text-left text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                                                    >
                                                        {client.userAccount.canDelete ? (
                                                            <>
                                                                <ShieldOff size={14} className="text-orange-400" />
                                                                Revoke Delete Permission
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Shield size={14} className="text-green-400" />
                                                                Grant Delete Permission
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                <hr className="border-slate-700 my-1" />
                                                <button
                                                    onClick={() => handleDeletePermanently(client.id)}
                                                    className="w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-red-600/10 flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete Forever
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3 ml-7 flex-wrap">
                                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                                        {client._count.gmbProfiles} Profile
                                        {client._count.gmbProfiles !== 1 ? "s" : ""}
                                    </Badge>
                                    {client.userAccount ? (
                                        <Badge
                                            variant="outline"
                                            className={`${client.userAccount.canDelete
                                                ? "text-green-400 border-green-400/50"
                                                : "text-blue-400 border-blue-400/50"
                                                }`}
                                        >
                                            <Key size={10} className="mr-1" />
                                            Login
                                            {client.userAccount.canDelete && (
                                                <Shield size={10} className="ml-1" />
                                            )}
                                        </Badge>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openCreateAccountDialog(client)}
                                            className="h-6 px-2 text-xs border-indigo-500/50 text-indigo-400 hover:bg-indigo-600/10"
                                        >
                                            <UserPlus size={10} className="mr-1" />
                                            Create Login
                                        </Button>
                                    )}
                                    {client.isArchived && (
                                        <Badge variant="outline" className="text-amber-400 border-amber-400/50">
                                            Archived
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </InfiniteScroll>
            )}

            {/* Client Form Dialog */}
            <ClientForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                client={editingClient}
                onSuccess={handleFormSuccess}
            />

            {/* Account Creation Dialog */}
            <Dialog open={!!clientForAccount} onOpenChange={(open) => !open && setClientForAccount(null)}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="text-indigo-400" size={20} />
                            Create Login Account for {clientForAccount?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">
                                <Mail size={14} className="inline mr-2" />
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={accountEmail}
                                onChange={(e) => setAccountEmail(e.target.value)}
                                placeholder="client@example.com"
                                className="bg-slate-900 border-slate-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">
                                <Key size={14} className="inline mr-2" />
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={accountPassword}
                                onChange={(e) => setAccountPassword(e.target.value)}
                                placeholder="Enter a secure password"
                                className="bg-slate-900 border-slate-600 text-white"
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            The client will use these credentials to log in and view their own data.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setClientForAccount(null)}
                            className="border-slate-600 text-slate-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateAccount}
                            disabled={isCreatingAccount || !accountEmail || !accountPassword}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isCreatingAccount ? (
                                <>
                                    <Loader2 size={14} className="mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Click outside to close menu */}
            {activeMenu && (
                <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
            )}
        </div>
    );
}
