"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog";
import { UpdateStartDateButton } from "@/components/dashboard/update-start-date-button";
import { RescheduleButton } from "@/components/dashboard/reschedule-button";
import { UpdateLimitButton } from "@/components/dashboard/update-limit-button";
import { DeletePendingButton } from "@/components/dashboard/delete-pending-button";
import { AutoFillButton } from "@/components/dashboard/auto-fill-button";
import { CleanupButton } from "@/components/dashboard/cleanup-button";

export function DashboardHeaderActions() {
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);

    return (
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
            <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
                <DialogTrigger asChild>
                    {/* <Button variant="outline" className="border-slate-700 w-full sm:w-auto">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Set Start Date
                    </Button> */}
                </DialogTrigger>
                <UpdateStartDateButton />
            </Dialog>
            <RescheduleButton />
            <UpdateLimitButton />
            <DeletePendingButton />
            <AutoFillButton />
            <CleanupButton />
        </div>
    );
}
