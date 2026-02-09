"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar as CalendarIcon, Save } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function UpdateStartDateButton() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date>();

    const handleUpdate = async () => {
        if (!date) {
            toast.error("Please select a date");
            return;
        }

        setIsUpdating(true);
        try {
            const res = await fetch("/api/profiles/update/bulk-start-date", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ startDate: date.toISOString() }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(`✅ Updated ${data.count} profiles!`);
                setOpen(false);
            } else {
                toast.error(data.error || "Failed to update start date");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Error updating start date");
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
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Set Start Date
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Set Bulk Start Date</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        This will update the <strong>Start Date</strong> for ALL active profiles.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-4">
                    <div className="grid gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[280px] justify-start text-left font-normal bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700 text-white">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    className="bg-slate-800 text-white"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleUpdate}
                        disabled={isUpdating || !date}
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
