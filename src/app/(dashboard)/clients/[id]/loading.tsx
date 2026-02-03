import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDetailLoading() {
    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Back button skeleton */}
            <Skeleton className="h-4 w-32 mb-6 bg-slate-800" />

            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                <div>
                    <Skeleton className="h-8 w-48 bg-slate-800" />
                    <div className="flex gap-4 mt-2">
                        <Skeleton className="h-4 w-40 bg-slate-800" />
                        <Skeleton className="h-4 w-28 bg-slate-800" />
                    </div>
                </div>
                <Skeleton className="h-10 w-28 bg-slate-800" />
            </div>

            {/* Notes skeleton */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 mb-8">
                <Skeleton className="h-4 w-full bg-slate-700" />
                <Skeleton className="h-4 w-3/4 mt-2 bg-slate-700" />
            </div>

            {/* Projects section skeleton */}
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32 bg-slate-800" />
                <Skeleton className="h-9 w-28 bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                    >
                        <Skeleton className="h-5 w-36 bg-slate-700" />
                        <div className="flex gap-2 mt-3">
                            <Skeleton className="h-5 w-16 bg-slate-700" />
                            <Skeleton className="h-5 w-16 bg-slate-700" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
