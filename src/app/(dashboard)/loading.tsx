import { Sidebar } from "@/components/layout/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />
            <main className="lg:pl-64">
                <div className="p-6 lg:p-8 pt-16 lg:pt-8">
                    {/* Header skeleton */}
                    <div className="mb-8">
                        <Skeleton className="h-8 w-40 bg-slate-800" />
                        <Skeleton className="h-4 w-60 mt-2 bg-slate-800" />
                    </div>

                    {/* Stats grid skeleton */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                            >
                                <Skeleton className="h-4 w-20 bg-slate-700" />
                                <Skeleton className="h-8 w-12 mt-2 bg-slate-700" />
                            </div>
                        ))}
                    </div>

                    {/* Cards skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {[...Array(2)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                            >
                                <Skeleton className="h-4 w-32 bg-slate-700" />
                                <div className="space-y-2 mt-4">
                                    <Skeleton className="h-4 w-full bg-slate-700" />
                                    <Skeleton className="h-4 w-3/4 bg-slate-700" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
