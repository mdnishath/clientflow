"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface TableSkeletonProps {
    rows?: number;
    showHeader?: boolean;
}

export function TableSkeleton({ rows = 5, showHeader = true }: TableSkeletonProps) {
    return (
        <div className="space-y-3">
            {showHeader && (
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-8 w-48 bg-slate-700" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-32 bg-slate-700" />
                        <Skeleton className="h-9 w-32 bg-slate-700" />
                    </div>
                </div>
            )}
            {Array.from({ length: rows }).map((_, i) => (
                <Card key={i} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-5 w-5 rounded bg-slate-700 shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-1/3 bg-slate-700" />
                                    <Skeleton className="h-5 w-20 rounded-full bg-slate-700" />
                                </div>
                                <Skeleton className="h-3 w-2/3 bg-slate-700/70" />
                                <div className="flex gap-2 pt-1">
                                    <Skeleton className="h-3 w-24 bg-slate-700/50" />
                                    <Skeleton className="h-3 w-16 bg-slate-700/50" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function KPISkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-slate-900 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <Skeleton className="h-3 w-20 bg-slate-700" />
                            <Skeleton className="h-8 w-8 rounded-lg bg-slate-700" />
                        </div>
                        <Skeleton className="h-8 w-16 bg-slate-700 mb-1" />
                        <Skeleton className="h-2 w-24 bg-slate-700/50" />
                        <Skeleton className="h-1 w-full bg-slate-800 mt-3 rounded-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function ProfileCardSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                            <Skeleton className="h-9 w-9 rounded-lg bg-slate-700" />
                            <Skeleton className="h-5 w-16 rounded-full bg-slate-700" />
                        </div>
                        <Skeleton className="h-5 w-3/4 bg-slate-700 mb-2" />
                        <Skeleton className="h-3 w-1/2 bg-slate-700/50 mb-4" />
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-16 bg-slate-700/50" />
                            <Skeleton className="h-3 w-12 bg-slate-700/50" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
