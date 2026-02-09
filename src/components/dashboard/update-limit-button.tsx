"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UpdateLimitButton() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    const [limit, setLimit] = useState("2");

    const handleUpdate = async () => {
        const numLimit = parseInt(limit);
        if (isNaN(numLimit) || numLimit < 0) {
            toast.error("Please enter a valid number");
            return;
        }

        setIsUpdating(true);
        try {
            const res = await fetch("/api/profiles/update/bulk-limit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ limit: numLimit }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(`✅ Updated ${data.count} profiles to limit: ${numLimit}`);
                setOpen(false);
            } else {
                toast.error(data.error || "Failed to update limits");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Error updating limits");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
                >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Set All Limits
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Set Daily Review Limit</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        This will update the <strong>Daily Review Limit</strong> for ALL active profiles.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="limit" className="text-right text-slate-300">
                            Limit
                        </Label>
                        <Input
                            id="limit"
                            type="number"
                            min="0"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            className="col-span-3 bg-slate-800 border-slate-700 text-white"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
