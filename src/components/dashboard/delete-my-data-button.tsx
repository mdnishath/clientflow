"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeleteMyDataButton() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showFinalConfirm, setShowFinalConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (confirmText !== "DELETE ALL MY DATA") {
            toast.error("Please type the exact phrase to confirm");
            return;
        }

        setIsDeleting(true);

        try {
            const res = await fetch("/api/admin/delete-my-data", {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete data");
            }

            toast.success("All your data has been removed. Refreshing...");

            // Refresh the page after a short delay
            setTimeout(() => {
                router.refresh();
            }, 2000);

        } catch (error) {
            console.error("Delete error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete data");
        } finally {
            setIsDeleting(false);
            setShowFinalConfirm(false);
            setConfirmText("");
        }
    };

    return (
        <>
            <Button
                variant="destructive"
                onClick={() => setShowConfirm(true)}
                className="gap-2"
            >
                <Trash2 className="h-4 w-4" />
                Delete All My Data
            </Button>

            {/* First confirmation */}
            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent className="bg-slate-900 border-slate-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone - Permanent Action
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-300 space-y-3">
                            <p className="font-semibold text-white">
                                This will permanently delete ALL data you have created:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>All clients you added</li>
                                <li>All GMB profiles under those clients</li>
                                <li>All reviews for those profiles</li>
                                <li>All workers under you and their work</li>
                                <li>All finance records (billings, invoices, payments, salaries)</li>
                                <li>All templates, contexts, tags, and categories</li>
                                <li>All notifications and audit logs</li>
                            </ul>
                            <p className="font-semibold text-red-400 mt-4">
                                Your account access will remain, but ALL your data will be gone forever.
                            </p>
                            <p className="text-yellow-400">
                                ⚠️ This action CANNOT be undone!
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setShowConfirm(false);
                                setShowFinalConfirm(true);
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            I Understand, Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Final confirmation with text input */}
            <AlertDialog open={showFinalConfirm} onOpenChange={setShowFinalConfirm}>
                <AlertDialogContent className="bg-slate-900 border-red-500 border-2">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-500 text-xl">
                            Final Confirmation Required
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-300 space-y-4">
                            <p className="font-bold text-white">
                                To confirm this permanent deletion, type:
                            </p>
                            <p className="font-mono text-lg text-yellow-400 bg-slate-800 p-2 rounded border border-yellow-500">
                                DELETE ALL MY DATA
                            </p>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Type here..."
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                                disabled={isDeleting}
                            />
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-slate-700 hover:bg-slate-600"
                            disabled={isDeleting}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting || confirmText !== "DELETE ALL MY DATA"}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Forever
                                </>
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
