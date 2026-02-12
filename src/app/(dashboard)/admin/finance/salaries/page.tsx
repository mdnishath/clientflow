"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DollarSign, Plus, Check, X, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Worker {
    id: string;
    name: string;
    email: string;
}

interface WorkerSalary {
    id: string;
    workerId: string;
    amount: number;
    salaryType: string;
    currency: string;
    effectiveFrom: string;
    isPaid: boolean;
    paidAt: string | null;
    notes: string | null;
    createdAt: string;
    worker: Worker;
}

export default function WorkerSalariesPage() {
    const [salaries, setSalaries] = useState<WorkerSalary[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSalary, setEditingSalary] = useState<WorkerSalary | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        workerId: "",
        amount: "",
        salaryType: "MONTHLY",
        currency: "USD",
        effectiveFrom: new Date().toISOString().split("T")[0],
        notes: "",
    });

    useEffect(() => {
        fetchSalaries();
        fetchWorkers();
    }, []);

    const fetchSalaries = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/finance/worker-salary");
            const data = await res.json();
            setSalaries(data.salaries || []);
        } catch (error) {
            console.error("Failed to fetch salaries:", error);
            toast.error("Failed to load salaries");
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkers = async () => {
        try {
            const res = await fetch("/api/admin/workers");
            const data = await res.json();
            setWorkers(data.workers || []);
        } catch (error) {
            console.error("Failed to fetch workers:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingSalary
            ? `/api/finance/worker-salary/${editingSalary.id}`
            : "/api/finance/worker-salary";

        const method = editingSalary ? "PATCH" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                }),
            });

            if (!res.ok) throw new Error("Failed to save salary");

            toast.success(editingSalary ? "Salary updated!" : "Salary created!");
            setDialogOpen(false);
            resetForm();
            fetchSalaries();
        } catch (error) {
            console.error("Error saving salary:", error);
            toast.error("Failed to save salary");
        }
    };

    const handleMarkAsPaid = async (salaryId: string) => {
        try {
            const res = await fetch(`/api/finance/worker-salary/${salaryId}/pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paymentDate: new Date().toISOString(),
                    paymentMethod: "BANK_TRANSFER",
                }),
            });

            if (!res.ok) throw new Error("Failed to mark as paid");

            toast.success("Salary marked as paid!");
            fetchSalaries();
        } catch (error) {
            console.error("Error marking as paid:", error);
            toast.error("Failed to mark as paid");
        }
    };

    const handleDelete = async (salaryId: string) => {
        if (!confirm("Are you sure you want to delete this salary record?")) return;

        try {
            const res = await fetch(`/api/finance/worker-salary/${salaryId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            toast.success("Salary deleted!");
            fetchSalaries();
        } catch (error) {
            console.error("Error deleting salary:", error);
            toast.error("Failed to delete salary");
        }
    };

    const resetForm = () => {
        setFormData({
            workerId: "",
            amount: "",
            salaryType: "MONTHLY",
            currency: "USD",
            effectiveFrom: new Date().toISOString().split("T")[0],
            notes: "",
        });
        setEditingSalary(null);
    };

    const openEditDialog = (salary: WorkerSalary) => {
        setEditingSalary(salary);
        setFormData({
            workerId: salary.workerId,
            amount: salary.amount.toString(),
            salaryType: salary.salaryType,
            currency: salary.currency,
            effectiveFrom: new Date(salary.effectiveFrom).toISOString().split("T")[0],
            notes: salary.notes || "",
        });
        setDialogOpen(true);
    };

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-green-400" />
                    <h1 className="text-3xl font-bold text-white">Worker Salaries</h1>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Salary Record
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 text-white">
                        <DialogHeader>
                            <DialogTitle>
                                {editingSalary ? "Edit Salary Record" : "Create Salary Record"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Worker</Label>
                                <Select
                                    value={formData.workerId}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, workerId: value })
                                    }
                                    disabled={!!editingSalary}
                                >
                                    <SelectTrigger className="bg-slate-900 border-slate-700">
                                        <SelectValue placeholder="Select worker" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700">
                                        {workers.map((worker) => (
                                            <SelectItem key={worker.id} value={worker.id}>
                                                {worker.name} ({worker.email})
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
                                            <SelectItem value="GBP">GBP</SelectItem>
                                            <SelectItem value="BDT">BDT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Salary Type</Label>
                                    <Select
                                        value={formData.salaryType}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, salaryType: value })
                                        }
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700">
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="HOURLY">Hourly</SelectItem>
                                            <SelectItem value="PER_REVIEW">Per Review</SelectItem>
                                            <SelectItem value="BONUS">Bonus</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Effective From</Label>
                                    <Input
                                        type="date"
                                        value={formData.effectiveFrom}
                                        onChange={(e) =>
                                            setFormData({ ...formData, effectiveFrom: e.target.value })
                                        }
                                        className="bg-slate-900 border-slate-700"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Notes (Optional)</Label>
                                <Input
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                    className="bg-slate-900 border-slate-700"
                                    placeholder="Additional notes..."
                                />
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
                                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                    {editingSalary ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Salaries Table */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">All Salary Records</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Loading...</div>
                    ) : salaries.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            No salary records yet. Create your first one!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">
                                            Worker
                                        </th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">
                                            Amount
                                        </th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">
                                            Type
                                        </th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">
                                            Effective From
                                        </th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">
                                            Status
                                        </th>
                                        <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salaries.map((salary) => (
                                        <tr
                                            key={salary.id}
                                            className="border-b border-slate-700 hover:bg-slate-700/50"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="text-white font-medium">
                                                    {salary.worker.name}
                                                </div>
                                                <div className="text-sm text-slate-400">
                                                    {salary.worker.email}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-white font-medium">
                                                {salary.currency} {salary.amount.toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                                                    {salary.salaryType}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-300">
                                                {new Date(salary.effectiveFrom).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                {salary.isPaid ? (
                                                    <span className="flex items-center gap-1 text-green-400">
                                                        <Check className="w-4 h-4" />
                                                        Paid
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-orange-400">
                                                        <X className="w-4 h-4" />
                                                        Unpaid
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex justify-end gap-2">
                                                    {!salary.isPaid && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleMarkAsPaid(salary.id)}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <Check className="w-4 h-4 mr-1" />
                                                            Mark Paid
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openEditDialog(salary)}
                                                        className="border-slate-700"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(salary.id)}
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
