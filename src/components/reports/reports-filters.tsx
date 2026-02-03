"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ClientOption {
    id: string;
    name: string;
}

interface ReportsFiltersProps {
    clients: ClientOption[];
    categories?: string[];
}

const STATUS_OPTIONS = [
    { value: "all", label: "All Statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "APPLIED", label: "Applied" },
    { value: "MISSING", label: "Missing" },
    { value: "GOOGLE_ISSUE", label: "Google Issue" },
    { value: "LIVE", label: "Live" },
    { value: "DONE", label: "Done" },
];

export function ReportsFilters({ clients, categories = [] }: ReportsFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const [date, setDate] = useState<DateRange | undefined>(() => {
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        if (from && to) {
            return {
                from: new Date(from),
                to: new Date(to),
            };
        }
        // Default: Last 30 days
        return {
            from: subDays(new Date(), 30),
            to: new Date(),
        };
    });

    const [clientId, setClientId] = useState<string>(searchParams.get("clientId") || "all");
    const [category, setCategory] = useState<string>(searchParams.get("category") || "all");
    const [status, setStatus] = useState<string>(searchParams.get("status") || "all");

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (date?.from) {
            params.set("from", date.from.toISOString());
        } else {
            params.delete("from");
        }

        if (date?.to) {
            params.set("to", date.to.toISOString());
        } else {
            params.delete("to");
        }

        if (clientId && clientId !== "all") {
            params.set("clientId", clientId);
        } else {
            params.delete("clientId");
        }

        if (category && category !== "all") {
            params.set("category", category);
        } else {
            params.delete("category");
        }

        if (status && status !== "all") {
            params.set("status", status);
        } else {
            params.delete("status");
        }

        // Prevent pushing history on initial load if params match default
        const queryString = params.toString();
        if (queryString !== searchParams.toString()) {
            router.push(`?${queryString}`, { scroll: false });
        }

    }, [date, clientId, category, status, router, searchParams]);

    const handleReset = () => {
        setDate({
            from: subDays(new Date(), 30),
            to: new Date(),
        });
        setClientId("all");
        setCategory("all");
        setStatus("all");
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-end bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex-wrap">
            <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Date Range</label>
                <DatePickerWithRange date={date} setDate={setDate} className="w-full sm:w-[280px]" />
            </div>

            <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Client</label>
                <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="All Clients" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="all">All Clients</SelectItem>
                        {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                                {client.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {categories.length > 0 && (
                <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full sm:w-[160px] bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full sm:w-[160px] bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="ml-auto">
                <Button
                    variant="ghost"
                    onClick={handleReset}
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                    <X size={16} className="mr-2" />
                    Reset
                </Button>
            </div>
        </div>
    );
}
