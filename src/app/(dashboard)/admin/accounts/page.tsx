"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Mail,
    Building2,
    Key,
    Eye,
    EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
    profileCount: number;
    userAccount?: {
        id: string;
        email: string;
        name: string | null;
        canDelete: boolean;
    } | null;
}

interface ClientFormData {
    name: string;
    email: string;
    password: string;
    phone?: string;
    notes?: string;
    canDelete?: boolean;
}

export default function AccountsPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState<ClientFormData>({
        name: "",
        email: "",
        password: "",
        phone: "",
        notes: "",
        canDelete: false,
    });

    const fetchClients = async () => {
        try {
            const res = await fetch("/api/admin/clients");
            if (!res.ok) throw new Error("Failed to fetch clients");
            const data = await res.json();
            setClients(data);
        } catch (error) {
            console.error("Error fetching clients:", error);
            toast.error("Failed to load clients");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleOpenForm = (client?: Client) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                name: client.userAccount?.name || client.name,
                email: client.userAccount?.email || client.email || "",
                password: "", // Never pre-fill password
                phone: client.phone || "",
                notes: client.notes || "",
                canDelete: client.userAccount?.canDelete || false,
            });
        } else {
            setEditingClient(null);
            setFormData({
                name: "",
                email: "",
                password: "",
                phone: "",
                notes: "",
                canDelete: false,
            });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingClient(null);
        setShowPassword(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            toast.error("Name and email are required");
            return;
        }

        if (!editingClient && !formData.password) {
            toast.error("Password is required for new accounts");
            return;
        }

        try {
            const url = editingClient
                ? `/api/admin/clients/${editingClient.id}`
                : "/api/admin/clients";

            const res = await fetch(url, {
                method: editingClient ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to save client");
            }

            toast.success(editingClient ? "Client updated successfully" : "Client created successfully");
            handleCloseForm();
            fetchClients();
        } catch (error: any) {
            console.error("Error saving client:", error);
            toast.error(error.message || "Failed to save client");
        }
    };

    const handleDelete = async (clientId: string) => {
        if (!confirm("Archive this client? Their data will be preserved.")) return;

        try {
            const res = await fetch(`/api/admin/clients/${clientId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to archive client");

            toast.success("Client archived successfully");
            fetchClients();
        } catch (error) {
            console.error("Error archiving client:", error);
            toast.error("Failed to archive client");
        }
    };

    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="text-indigo-400" size={28} />
                        Client Accounts
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage your client accounts and access controls
                    </p>
                </div>
                <Button
                    onClick={() => handleOpenForm()}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus size={16} className="mr-2" />
                    Create Client
                </Button>
            </div>

            {/* Clients List */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin mb-3" />
                    Loading clients...
                </div>
            ) : clients.length === 0 ? (
                <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="py-12 text-center">
                        <Users className="mx-auto h-10 w-10 text-slate-600 mb-3" />
                        <p className="text-slate-400 font-medium">No clients found</p>
                        <p className="text-slate-500 text-sm mt-1">
                            Create your first client account to get started
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client) => (
                        <Card key={client.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            <Building2 size={18} className="text-indigo-400" />
                                            {client.name}
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenForm(client)}
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                        >
                                            <Pencil size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(client.id)}
                                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {client.userAccount && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Mail size={14} />
                                        <span className="truncate">{client.userAccount.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-indigo-400 border-indigo-400/50">
                                        {client.profileCount} Profile{client.profileCount !== 1 ? "s" : ""}
                                    </Badge>
                                    {client.userAccount?.canDelete && (
                                        <Badge variant="outline" className="text-green-400 border-green-400/50">
                                            Can Delete
                                        </Badge>
                                    )}
                                </div>
                                {client.notes && (
                                    <p className="text-slate-500 text-xs line-clamp-2 mt-2">
                                        {client.notes}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Client Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingClient ? "Edit Client Account" : "Create Client Account"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Client Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">
                                Password {editingClient ? "(leave empty to keep current)" : "*"}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white pr-10"
                                    required={!editingClient}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white resize-none"
                                rows={3}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="canDelete"
                                checked={formData.canDelete}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, canDelete: checked as boolean })
                                }
                                className="border-slate-500"
                            />
                            <Label htmlFor="canDelete" className="text-sm text-slate-300 cursor-pointer">
                                Allow client to delete data
                            </Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseForm} className="border-slate-600">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                                {editingClient ? "Update Client" : "Create Client"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
