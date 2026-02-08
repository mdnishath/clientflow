import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
    // Permissions
    canCreateProfiles?: boolean;
    canEditProfiles?: boolean;
    canDeleteProfiles?: boolean;
    canCreateReviews?: boolean;
    canEditReviews?: boolean;
    canDeleteReviews?: boolean;
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
    const [password, setPassword] = useState("");

    // Permissions
    const [canCreateProfiles, setCanCreateProfiles] = useState(false);
    const [canEditProfiles, setCanEditProfiles] = useState(false);
    const [canDeleteProfiles, setCanDeleteProfiles] = useState(false);
    const [canCreateReviews, setCanCreateReviews] = useState(false);
    const [canEditReviews, setCanEditReviews] = useState(false);
    const [canDeleteReviews, setCanDeleteReviews] = useState(false);

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
            setPassword(""); // Don't show password

            // Set permissions
            setCanCreateProfiles(client.canCreateProfiles || false);
            setCanEditProfiles(client.canEditProfiles || false);
            setCanDeleteProfiles(client.canDeleteProfiles || false);
            setCanCreateReviews(client.canCreateReviews || false);
            setCanEditReviews(client.canEditReviews || false);
            setCanDeleteReviews(client.canDeleteReviews || false);

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
                    ...(password ? { password } : {}), // Only send if provided
                    // Permissions
                    canCreateProfiles,
                    canEditProfiles,
                    canDeleteProfiles,
                    canCreateReviews,
                    canEditReviews,
                    canDeleteReviews,
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
        setPassword("");
        setCanCreateProfiles(false);
        setCanEditProfiles(false);
        setCanDeleteProfiles(false);
        setCanCreateReviews(false);
        setCanEditReviews(false);
        setCanDeleteReviews(false);
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
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Client" : "Add New Client"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-4">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-200">
                                    Email *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="client@example.com"
                                    required
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

                        {!isEditing && (
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-200">
                                    Password *
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Initial password"
                                    required
                                    className="bg-slate-700/50 border-slate-600 text-white"
                                />
                            </div>
                        )}

                        {isEditing && (
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-200">
                                    New Password (leave blank to keep current)
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="bg-slate-700/50 border-slate-600 text-white"
                                />
                            </div>
                        )}

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
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                        <Label className="text-base font-semibold text-white mb-4 block">
                            Permissions
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/30 p-4 rounded-lg border border-slate-700/50">
                            {/* Profile Permissions */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Profiles</h4>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="canCreateProfiles" className="text-sm cursor-pointer">Create Profiles</Label>
                                    <Switch
                                        id="canCreateProfiles"
                                        checked={canCreateProfiles}
                                        onCheckedChange={setCanCreateProfiles}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="canEditProfiles" className="text-sm cursor-pointer">Edit Profiles</Label>
                                    <Switch
                                        id="canEditProfiles"
                                        checked={canEditProfiles}
                                        onCheckedChange={setCanEditProfiles}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="canDeleteProfiles" className="text-sm cursor-pointer">Delete Profiles</Label>
                                    <Switch
                                        id="canDeleteProfiles"
                                        checked={canDeleteProfiles}
                                        onCheckedChange={setCanDeleteProfiles}
                                    />
                                </div>
                            </div>

                            {/* Review Permissions */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-emerald-400 uppercase tracking-wider">Reviews</h4>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="canCreateReviews" className="text-sm cursor-pointer">Create/Import Reviews</Label>
                                    <Switch
                                        id="canCreateReviews"
                                        checked={canCreateReviews}
                                        onCheckedChange={setCanCreateReviews}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="canEditReviews" className="text-sm cursor-pointer">Edit Reviews</Label>
                                    <Switch
                                        id="canEditReviews"
                                        checked={canEditReviews}
                                        onCheckedChange={setCanEditReviews}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="canDeleteReviews" className="text-sm cursor-pointer">Delete Reviews</Label>
                                    <Switch
                                        id="canDeleteReviews"
                                        checked={canDeleteReviews}
                                        onCheckedChange={setCanDeleteReviews}
                                    />
                                </div>
                            </div>
                        </div>
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
