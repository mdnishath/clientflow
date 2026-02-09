"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarClock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function RescheduleButton() {
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [open, setOpen] = useState(false);

    const handleReschedule = async () => {
        setIsRescheduling(true);
        try {
            const res = await fetch("/api/reviews/update/bulk-reschedule", {
                method: "POST",
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(`🗓️ ${data.message}`);
                setOpen(false);
                window.location.reload();
            } else {
                toast.error(data.error || "Failed to reschedule reviews");
            }
        } catch (error) {
            console.error("Reschedule error:", error);
            toast.error("Error rescheduling reviews");
        } finally {
            setIsRescheduling(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="bg-indigo-900/50 text-indigo-100 border-indigo-700/50 hover:bg-indigo-800 hover:text-white"
                >
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Reschedule All
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Reschedule All Pending Reviews?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="text-slate-400">
                            This will recalculate the <strong>Due Date</strong> for ALL pending reviews based on:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Profile&apos;s <strong>Start Date</strong></li>
                                <li>Profile&apos;s <strong>Daily Limit</strong></li>
                            </ul>
                            <br />
                            This helps prevent overdue tasks by aligning them with your current schedule.
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleReschedule();
                        }}
                        className="bg-indigo-600 text-white hover:bg-indigo-700 border-0"
                        disabled={isRescheduling}
                    >
                        {isRescheduling ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Yes, Reschedule
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
