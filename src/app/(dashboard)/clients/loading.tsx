import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsLoading() {
    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <Skeleton className="h-8 w-28 bg-slate-800" />
                    <Skeleton className="h-4 w-48 mt-2 bg-slate-800" />
                </div>
                <Skeleton className="h-10 w-28 bg-slate-800" />
            </div>

            {/* Filters skeleton */}
            <div className="flex gap-3 mb-6">
                <Skeleton className="h-10 w-64 bg-slate-800" />
                <Skeleton className="h-10 w-36 bg-slate-800" />
            </div>

            {/* Cards grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <Skeleton className="h-5 w-32 bg-slate-700" />
                                <Skeleton className="h-4 w-40 mt-2 bg-slate-700" />
                            </div>
                            <Skeleton className="h-8 w-8 bg-slate-700" />
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Skeleton className="h-5 w-20 bg-slate-700" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
