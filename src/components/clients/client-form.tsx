"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
}

interface ClientFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client?: Client | null;
    onSuccess: () => void;
}

export function ClientForm({
    open,
    onOpenChange,
    client,
    onSuccess,
}: ClientFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const isEditing = !!client;

    // Reset form when client changes or dialog opens
    useEffect(() => {
        if (open && client) {
            setName(client.name || "");
            setEmail(client.email || "");
            setPhone(client.phone || "");
            setNotes(client.notes || "");
        } else if (open) {
            resetForm();
        }
    }, [open, client]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const url = isEditing ? `/api/clients/${client.id}` : "/api/clients";
            const method = isEditing ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    notes,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save client");
            }

            onSuccess();
            onOpenChange(false);
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setName("");
        setEmail("");
        setPhone("");
        setNotes("");
        setError("");
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                onOpenChange(open);
                if (!open) resetForm();
            }}
        >
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Client" : "Add New Client"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-200">
                            Client Name *
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Alex Johnson"
                            required
                            className="bg-slate-700/50 border-slate-600 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="client@example.com"
                                className="bg-slate-700/50 border-slate-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-200">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 555-0100"
                                className="bg-slate-700/50 border-slate-600 text-white"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-slate-200">
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes..."
                            rows={2}
                            className="bg-slate-700/50 border-slate-600 text-white resize-none"
                        />
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-slate-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Add Client"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
