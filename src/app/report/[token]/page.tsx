import { notFound } from "next/navigation";
import { CheckCircle2, Clock, TrendingUp, AlertCircle, Star, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SendReportButton } from "./send-button";

async function getReport(token: string) {
    if (!token || token.length < 10) return null;

    const client = await prisma.client.findUnique({
        where: { reportToken: token },
        include: {
            gmbProfiles: {
                where: { isArchived: false },
                include: {
                    reviews: {
                        where: { isArchived: false },
                        select: { status: true, checkStatus: true, createdAt: true, completedAt: true },
                    },
                    _count: { select: { reviews: true } },
                },
                take: 20,
            },
        },
    });

    if (!client) return null;

    const allReviews = client.gmbProfiles.flatMap((p: any) => p.reviews);
    const stats = {
        total: allReviews.length,
        live: allReviews.filter((r: any) => r.status === "LIVE").length,
        done: allReviews.filter((r: any) => r.status === "DONE").length,
        applied: allReviews.filter((r: any) => r.status === "APPLIED").length,
        pending: allReviews.filter((r: any) => r.status === "PENDING").length,
        missing: allReviews.filter((r: any) => r.status === "MISSING").length,
    };
    const completionRate = stats.total > 0 ? Math.round(((stats.live + stats.done) / stats.total) * 100) : 0;

    const profiles = client.gmbProfiles.map((p: any) => ({
        businessName: p.businessName,
        category: p.category,
        reviewOrdered: p.reviewOrdered,
        liveCount: p.reviews.filter((r: any) => r.status === "LIVE" || r.status === "DONE").length,
        total: p._count.reviews,
    }));

    return {
        client: { name: client.name },
        hasEmail: !!client.email,
        stats,
        completionRate,
        profiles,
        generatedAt: new Date().toISOString(),
    };
}

export default async function ClientReportPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const data = await getReport(token);
    if (!data) notFound();

    const { client, hasEmail, stats, completionRate, profiles, generatedAt } = data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 shadow-2xl">
                <div className="max-w-4xl mx-auto px-6 py-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">CF</span>
                        </div>
                        <span className="text-white/70 text-sm">ClientFlow — Review Report</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{client.name}</h1>
                    <div className="flex items-center gap-4 mt-1">
                        <p className="text-indigo-200 text-sm">
                            Generated {new Date(generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                        <SendReportButton token={token} hasEmail={hasEmail} />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
                {/* Completion Rate Hero */}
                <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 text-center backdrop-blur">
                    <div className="relative inline-flex items-center justify-center mb-6">
                        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
                            <circle
                                cx="50" cy="50" r="40" fill="none"
                                stroke={completionRate >= 80 ? "#10b981" : completionRate >= 50 ? "#6366f1" : "#f59e0b"}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${completionRate * 2.51} 251`}
                                style={{ transition: "stroke-dasharray 1s ease" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-white">{completionRate}%</span>
                            <span className="text-xs text-slate-400 mt-1">completion</span>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Review Progress</h2>
                    <p className="text-slate-400 text-sm">
                        {stats.live + stats.done} of {stats.total} reviews completed
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: "Live Reviews", value: stats.live, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                        { label: "Done", value: stats.done, icon: Star, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                        { label: "Applied", value: stats.applied, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
                        { label: "Pending", value: stats.pending, icon: Clock, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-700/50" },
                        { label: "Total Reviews", value: stats.total, icon: Store, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                        { label: "Missing", value: stats.missing, icon: AlertCircle, color: stats.missing > 0 ? "text-yellow-400" : "text-slate-600", bg: stats.missing > 0 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-slate-800 border-slate-700/30" },
                    ].map((item, i) => (
                        <div key={i} className={`rounded-xl border p-5 ${item.bg}`}>
                            <item.icon className={`${item.color} mb-3`} size={20} />
                            <p className={`text-3xl font-bold ${item.color}`}>{item.value.toLocaleString()}</p>
                            <p className="text-slate-500 text-xs mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Profiles */}
                {profiles.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Store size={18} className="text-indigo-400" />
                            Business Locations
                        </h3>
                        <div className="space-y-3">
                            {profiles.map((profile, i) => {
                                const pct = profile.total > 0 ? Math.round((profile.liveCount / profile.total) * 100) : 0;
                                return (
                                    <div key={i} className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="text-white font-semibold">{profile.businessName}</p>
                                                {profile.category && (
                                                    <p className="text-slate-500 text-xs mt-0.5">{profile.category}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-bold text-lg">{pct}%</p>
                                                <p className="text-slate-500 text-xs">{profile.liveCount}/{profile.total}</p>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-indigo-500" : "bg-yellow-500"}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center py-6 border-t border-slate-800">
                    <p className="text-slate-600 text-xs">
                        Powered by <span className="text-indigo-400 font-medium">ClientFlow</span> — Professional Review Management
                    </p>
                </div>
            </div>
        </div>
    );
}
