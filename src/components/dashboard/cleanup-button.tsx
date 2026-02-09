"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Trash2, Bell, Image, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CleanupButton() {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDeleteNotifications = async () => {
        if (!confirm("Delete ALL notifications? This cannot be undone!")) return;

        setIsDeleting("notifications");
        try {
            const res = await fetch("/api/admin/cleanup/notifications", {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            const data = await res.json();
            toast.success(`${data.deleted} notifications deleted`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete notifications");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleDeleteScreenshots = async () => {
        if (!confirm("Delete ALL screenshots from public folder? This cannot be undone!")) return;

        setIsDeleting("screenshots");
        try {
            const res = await fetch("/api/admin/cleanup/screenshots", {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            const data = await res.json();
            toast.success(`${data.deleted} screenshots deleted`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete screenshots");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    disabled={!!isDeleting}
                >
                    {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Cleanup
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuItem
                    onClick={handleDeleteNotifications}
                    className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                    disabled={!!isDeleting}
                >
                    <Bell className="mr-2 h-4 w-4" />
                    Delete All Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                    onClick={handleDeleteScreenshots}
                    className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                    disabled={!!isDeleting}
                >
                    <Image className="mr-2 h-4 w-4" />
                    Delete All Screenshots
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
