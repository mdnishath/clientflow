"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    FileText, Send, Eye, Plus, Loader2, Mail, Calendar,
    DollarSign, CheckCircle2, Clock, AlertCircle, RefreshCw, Trash2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Invoice {
    id: string;
    invoiceNumber: string;
    status: string;
    totalAmount: number;
    currency: string;
    dueDate: string;
    createdAt: string;
    notes: string | null;
    client: { id: string; name: string; email: string | null };
    items: Array<{ description: string; quantity: number; rate: number }>;
}

interface Client {
    id: string;
    name: string;
    email: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    DRAFT:    { label: "Draft",    color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: FileText },
    SENT:     { label: "Sent",     color: "bg-blue-500/20 text-blue-400 border-blue-500/30",   icon: Send },
    PAID:     { label: "Paid",     color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 },
    OVERDUE:  { label: "Overdue",  color: "bg-red-500/20 text-red-400 border-red-500/30",      icon: AlertCircle },
    CANCELLED:{ label: "Cancelled",color: "bg-slate-700/50 text-slate-500 border-slate-700",   icon: AlertCircle },
};

export function InvoiceManager() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");

    // Create form state
    const [form, setForm] = useState({
        clientId: "", dueDate: "", notes: "",
        items: [{ description: "", quantity: 1, rate: 0 }],
        currency: "USD",
    });
    const [isCreating, setIsCreating] = useState(false);

    const fetchInvoices = useCallback(async () => {
        try {
            const url = filterStatus !== "all"
                ? `/api/finance/invoices?status=${filterStatus}`
                : "/api/finance/invoices";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setInvoices(data.invoices || []);
            }
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        fetch("/api/clients?limit=100")
            .then(r => r.json())
            .then(d => setClients(d.data || d.clients || []))
            .catch(() => {});
        fetchInvoices();
    }, [fetchInvoices]);

    const sendInvoiceEmail = async (invoiceId: string) => {
        setSendingId(invoiceId);
        try {
            const res = await fetch("/api/email/send-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invoiceId }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || "Invoice sent!");
                fetchInvoices();
            } else {
                toast.error(data.error || "Failed to send invoice");
            }
        } finally {
            setSendingId(null);
        }
    };

    const markPaid = async (invoiceId: string) => {
        try {
            const res = await fetch(`/api/finance/invoices/${invoiceId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "PAID" }),
            });
            if (res.ok) {
                toast.success("Invoice marked as paid!");
                fetchInvoices();
            }
        } catch { toast.error("Failed to update invoice"); }
    };

    const deleteInvoice = async (invoiceId: string, invoiceNumber: string) => {
        if (!confirm(`Delete invoice ${invoiceNumber}? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/finance/invoices/${invoiceId}`, { method: "DELETE" });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Invoice ${invoiceNumber} deleted`);
                fetchInvoices();
            } else {
                toast.error(data.error || "Failed to delete invoice");
            }
        } catch { toast.error("Failed to delete invoice"); }
    };

    const createInvoice = async () => {
        if (!form.clientId || !form.dueDate || form.items.some(i => !i.description || i.rate <= 0)) {
            toast.error("Please fill all required fields");
            return;
        }
        setIsCreating(true);
        try {
            const res = await fetch("/api/finance/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: form.clientId,
                    dueDate: form.dueDate,
                    notes: form.notes,
                    currency: form.currency,
                    items: form.items,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Invoice ${data.invoice?.invoiceNumber} created!`);
                setIsCreateOpen(false);
                fetchInvoices();
                setForm({ clientId: "", dueDate: "", notes: "", currency: "USD", items: [{ description: "", quantity: 1, rate: 0 }] });
            } else {
                toast.error(data.error || "Failed to create invoice");
            }
        } finally { setIsCreating(false); }
    };

    const totalAmount = form.items.reduce((sum, i) => sum + (i.quantity * i.rate), 0);
    const filteredInvoices = filterStatus === "all" ? invoices : invoices.filter(i => i.status === filterStatus);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-36 bg-slate-800 border-slate-600 text-slate-300 h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="all">All</SelectItem>
                            {Object.keys(statusConfig).map(s => (
                                <SelectItem key={s} value={s}>{statusConfig[s].label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={fetchInvoices} className="h-9 w-9 text-slate-400 hover:text-white">
                        <RefreshCw size={14} />
                    </Button>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 h-9">
                    <Plus size={14} className="mr-2" />
                    Create Invoice
                </Button>
            </div>

            {/* Invoice List */}
            {loading ? (
                <div className="text-center py-8 text-slate-500">Loading invoices...</div>
            ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-16">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 mb-1">No invoices found</p>
                    <p className="text-slate-600 text-sm">Create your first invoice to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredInvoices.map((inv) => {
                        const sc = statusConfig[inv.status] || statusConfig.DRAFT;
                        const Icon = sc.icon;
                        const isOverdue = inv.status !== "PAID" && new Date(inv.dueDate) < new Date();
                        const displayStatus = isOverdue && inv.status !== "PAID" ? "OVERDUE" : inv.status;
                        const dsc = statusConfig[displayStatus] || sc;

                        return (
                            <Card key={inv.id} className="bg-slate-800/60 border-slate-700/60 hover:border-slate-600/60 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white font-semibold text-sm">{inv.invoiceNumber}</span>
                                                <Badge className={`text-xs border ${dsc.color}`}>
                                                    <dsc.icon size={10} className="mr-1" />
                                                    {dsc.label}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-300 text-sm font-medium">{inv.client.name}</p>
                                            {inv.client.email && (
                                                <p className="text-slate-500 text-xs">{inv.client.email}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    Due: {new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FileText size={10} />
                                                    {inv.items?.length || 0} item{(inv.items?.length || 0) !== 1 ? "s" : ""}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <div className="text-right">
                                                <p className="text-white font-bold text-lg">{inv.currency} {inv.totalAmount.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {/* View PDF */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs border-slate-600 text-slate-300 hover:text-white"
                                                    onClick={() => window.open(`/api/finance/invoices/${inv.id}/pdf`, "_blank")}
                                                >
                                                    <Eye size={11} className="mr-1" />
                                                    PDF
                                                </Button>
                                                {/* Send Email */}
                                                {inv.client.email && inv.status !== "PAID" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs border-blue-600/50 text-blue-400 hover:bg-blue-600/10"
                                                        onClick={() => sendInvoiceEmail(inv.id)}
                                                        disabled={sendingId === inv.id}
                                                    >
                                                        {sendingId === inv.id
                                                            ? <Loader2 size={11} className="animate-spin" />
                                                            : <><Mail size={11} className="mr-1" />Send</>
                                                        }
                                                    </Button>
                                                )}
                                                {/* Mark Paid */}
                                                {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs border-green-600/50 text-green-400 hover:bg-green-600/10"
                                                        onClick={() => markPaid(inv.id)}
                                                    >
                                                        <CheckCircle2 size={11} className="mr-1" />
                                                        Paid
                                                    </Button>
                                                )}
                                                {/* Delete — all statuses including PAID */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs border-red-600/40 text-red-400 hover:bg-red-600/10 hover:border-red-500/60 px-2"
                                                    onClick={() => deleteInvoice(inv.id, inv.invoiceNumber)}
                                                    title="Delete invoice"
                                                >
                                                    <Trash2 size={11} className="mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create Invoice Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <FileText size={18} className="text-cyan-400" />
                            Create Invoice
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-slate-300 text-sm">Client *</Label>
                                <Select value={form.clientId} onValueChange={v => setForm(f => ({ ...f, clientId: v }))}>
                                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white h-9">
                                        <SelectValue placeholder="Select client" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                        {clients.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-slate-300 text-sm">Due Date *</Label>
                                <Input type="date" value={form.dueDate}
                                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                                    className="bg-slate-800 border-slate-600 text-white h-9" />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-2">
                            <Label className="text-slate-300 text-sm">Line Items *</Label>
                            {form.items.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2">
                                    <Input
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={e => {
                                            const items = [...form.items];
                                            items[i].description = e.target.value;
                                            setForm(f => ({ ...f, items }));
                                        }}
                                        className="col-span-6 bg-slate-800 border-slate-600 text-white h-9 text-sm"
                                    />
                                    <Input
                                        type="number" placeholder="Qty" min={1}
                                        value={item.quantity}
                                        onChange={e => {
                                            const items = [...form.items];
                                            items[i].quantity = parseInt(e.target.value) || 1;
                                            setForm(f => ({ ...f, items }));
                                        }}
                                        className="col-span-2 bg-slate-800 border-slate-600 text-white h-9 text-sm"
                                    />
                                    <Input
                                        type="number" placeholder="Rate" min={0} step={0.01}
                                        value={item.rate || ""}
                                        onChange={e => {
                                            const items = [...form.items];
                                            items[i].rate = parseFloat(e.target.value) || 0;
                                            setForm(f => ({ ...f, items }));
                                        }}
                                        className="col-span-3 bg-slate-800 border-slate-600 text-white h-9 text-sm"
                                    />
                                    <button
                                        onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))}
                                        className="col-span-1 text-slate-500 hover:text-red-400 text-lg leading-none"
                                        disabled={form.items.length <= 1}
                                    >×</button>
                                </div>
                            ))}
                            <Button
                                variant="ghost" size="sm"
                                onClick={() => setForm(f => ({ ...f, items: [...f.items, { description: "", quantity: 1, rate: 0 }] }))}
                                className="text-slate-400 hover:text-white text-xs h-7"
                            >
                                <Plus size={12} className="mr-1" />Add line
                            </Button>
                        </div>

                        <div className="flex items-center justify-between py-2 border-t border-slate-700">
                            <span className="text-slate-400 text-sm">Total</span>
                            <span className="text-white font-bold">{form.currency} {totalAmount.toFixed(2)}</span>
                        </div>

                        <Input
                            placeholder="Notes (optional)"
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            className="bg-slate-800 border-slate-600 text-white h-9 text-sm"
                        />

                        <div className="flex gap-2 pt-2">
                            <Button onClick={createInvoice} disabled={isCreating} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                                {isCreating ? <><Loader2 size={14} className="mr-2 animate-spin" />Creating...</> : "Create Invoice"}
                            </Button>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-slate-600 text-slate-300">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
