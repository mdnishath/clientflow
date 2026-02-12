"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Client {
    id: string;
    name: string;
    email: string;
}

interface ClientBilling {
    id: string;
    clientId: string;
    amount: number;
    description: string;
    billingType: string;
    currency: string;
    billingDate: string;
    dueDate: string;
    status: string;
    createdAt: string;
    client: Client;
}

export default function ClientBillingsPage() {
    const [billings, setBillings] = useState<ClientBilling[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBilling, setEditingBilling] = useState<ClientBilling | null>(null);

    const [formData, setFormData] = useState({
        clientId: "",
        amount: "",
        description: "",
        billingType: "MONTHLY",
        currency: "USD",
        billingDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "PENDING",
    });

    useEffect(() => {
        fetchBillings();
        fetchClients();
    }, []);

    const fetchBillings = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/finance/client-billing");
            const data = await res.json();
            setBillings(data.billings || []);
        } catch (error) {
            console.error("Failed to fetch billings:", error);
            toast.error("Failed to load billings");
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await fetch("/api/clients");
            const data = await res.json();
            setClients(data.clients || []);
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingBilling
            ? `/api/finance/client-billing/${editingBilling.id}`
            : "/api/finance/client-billing";

        const method = editingBilling ? "PATCH" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                }),
            });

            if (!res.ok) throw new Error("Failed to save billing");

            toast.success(editingBilling ? "Billing updated!" : "Billing created!");
            setDialogOpen(false);
            resetForm();
            fetchBillings();
        } catch (error) {
            console.error("Error saving billing:", error);
            toast.error("Failed to save billing");
        }
    };

    const handleDelete = async (billingId: string) => {
        if (!confirm("Delete this billing record?")) return;

        try {
            const res = await fetch(`/api/finance/client-billing/${billingId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            toast.success("Billing deleted!");
            fetchBillings();
        } catch (error) {
            console.error("Error deleting billing:", error);
            toast.error("Failed to delete billing");
        }
    };

    const handleStatusChange = async (billingId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/finance/client-billing/${billingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            toast.success("Status updated!");
            fetchBillings();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    const resetForm = () => {
        setFormData({
            clientId: "",
            amount: "",
            description: "",
            billingType: "MONTHLY",
            currency: "USD",
            billingDate: new Date().toISOString().split("T")[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            status: "PENDING",
        });
        setEditingBilling(null);
    };

    const openEditDialog = (billing: ClientBilling) => {
        setEditingBilling(billing);
        setFormData({
            clientId: billing.clientId,
            amount: billing.amount.toString(),
            description: billing.description,
            billingType: billing.billingType,
            currency: billing.currency,
            billingDate: new Date(billing.billingDate).toISOString().split("T")[0],
            dueDate: new Date(billing.dueDate).toISOString().split("T")[0],
            status: billing.status,
        });
        setDialogOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PAID": return "bg-green-600/20 text-green-400";
            case "PENDING": return "bg-yellow-600/20 text-yellow-400";
            case "OVERDUE": return "bg-red-600/20 text-red-400";
            case "CANCELLED": return "bg-slate-600/20 text-slate-400";
            default: return "bg-blue-600/20 text-blue-400";
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Receipt className="w-8 h-8 text-blue-400" />
                    <h1 className="text-3xl font-bold text-white">Client Billings</h1>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Billing
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingBilling ? "Edit Billing" : "Create Billing"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Client</Label>
                                <Select
                                    value={formData.clientId}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, clientId: value })
                                    }
                                    disabled={!!editingBilling}
                                >
                                    <SelectTrigger className="bg-slate-900 border-slate-700">
                                        <SelectValue placeholder="Select client" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700">
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) =>
                                            setFormData({ ...formData, amount: e.target.value })
                                        }
                                        className="bg-slate-900 border-slate-700"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Currency</Label>
                                    <Select
                                        value={formData.currency}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, currency: value })
                                        }
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700">
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="BDT">BDT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label>Description</Label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="bg-slate-900 border-slate-700"
                                    placeholder="Service description..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Billing Type</Label>
                                    <Select
                                        value={formData.billingType}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, billingType: value })
                                        }
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700">
                                            <SelectItem value="PER_REVIEW">Per Review</SelectItem>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="FIXED_PROJECT">Fixed Project</SelectItem>
                                            <SelectItem value="HOURLY">Hourly</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, status: value })
                                        }
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700">
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="PAID">Paid</SelectItem>
                                            <SelectItem value="OVERDUE">Overdue</SelectItem>
                                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Billing Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.billingDate}
                                        onChange={(e) =>
                                            setFormData({ ...formData, billingDate: e.target.value })
                                        }
                                        className="bg-slate-900 border-slate-700"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Due Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) =>
                                            setFormData({ ...formData, dueDate: e.target.value })
                                        }
                                        className="bg-slate-900 border-slate-700"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    className="border-slate-700"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    {editingBilling ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">All Billings</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Loading...</div>
                    ) : billings.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            No billings yet. Create your first one!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Client</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Description</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Amount</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Due Date</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billings.map((billing) => (
                                        <tr key={billing.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                            <td className="py-3 px-4 text-white font-medium">
                                                {billing.client.name}
                                            </td>
                                            <td className="py-3 px-4 text-slate-300">
                                                {billing.description}
                                            </td>
                                            <td className="py-3 px-4 text-white font-medium">
                                                {billing.currency} {billing.amount.toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                                                    {billing.billingType}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-300">
                                                {new Date(billing.dueDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Select
                                                    value={billing.status}
                                                    onValueChange={(value) =>
                                                        handleStatusChange(billing.id, value)
                                                    }
                                                >
                                                    <SelectTrigger className={`w-32 h-8 ${getStatusColor(billing.status)}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-900 border-slate-700">
                                                        <SelectItem value="PENDING">Pending</SelectItem>
                                                        <SelectItem value="PAID">Paid</SelectItem>
                                                        <SelectItem value="OVERDUE">Overdue</SelectItem>
                                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openEditDialog(billing)}
                                                        className="border-slate-700"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(billing.id)}
                                                        className="border-red-700 text-red-400 hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
