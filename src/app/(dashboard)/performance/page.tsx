"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";

export default function PerformancePage() {
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [dailyStats, setDailyStats] = useState<any[]>([]);
    const [dayDetails, setDayDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        setSelectedDate(new Date());
        fetchDailyStats();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchDayDetails(selectedDate);
        }
    }, [selectedDate]);

    const fetchDailyStats = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/workers/daily-stats");
            const data = await res.json();
            setDailyStats(data.dailyStats || []);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDayDetails = async (date: Date) => {
        try {
            const dateStr = date.toISOString().split("T")[0];
            const res = await fetch(`/api/workers/daily-stats?date=${dateStr}`);
            const data = await res.json();
            setDayDetails(data.dailyStats[0] || null);
        } catch (error) {
            console.error("Failed to fetch day details:", error);
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-cyan-400" />
                <h1 className="text-3xl font-bold text-white">Daily Performance</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-white">Select Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {mounted && selectedDate && (
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                className="rounded-md border border-slate-700"
                            />
                        )}
                        {!mounted && (
                            <div className="h-[300px] flex items-center justify-center text-slate-400">
                                Loading calendar...
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Day Details */}
                <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white">
                            {selectedDate && selectedDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dayDetails ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="bg-cyan-600/20 p-4 rounded-lg">
                                        <div className="text-cyan-400 text-sm">DONE</div>
                                        <div className="text-2xl font-bold text-white">{dayDetails.doneCount || 0}</div>
                                    </div>
                                    <div className="bg-green-600/20 p-4 rounded-lg">
                                        <div className="text-green-400 text-sm">LIVE Reviews</div>
                                        <div className="text-2xl font-bold text-white">{dayDetails.liveCount}</div>
                                    </div>
                                    <div className="bg-blue-600/20 p-4 rounded-lg">
                                        <div className="text-blue-400 text-sm">APPLIED Reviews</div>
                                        <div className="text-2xl font-bold text-white">{dayDetails.appliedCount}</div>
                                    </div>
                                    <div className="bg-yellow-600/20 p-4 rounded-lg">
                                        <div className="text-yellow-400 text-sm flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            Earnings
                                        </div>
                                        <div className="text-2xl font-bold text-white">{dayDetails.totalEarnings} BDT</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-white font-medium">Tasks Completed</h3>
                                    {dayDetails.reviews.length === 0 ? (
                                        <p className="text-slate-400 text-sm">No tasks completed on this day</p>
                                    ) : (
                                        dayDetails.reviews.map((review: any) => (
                                            <Link
                                                key={review.id}
                                                href={`/reviews?id=${review.id}`}
                                                className="block p-3 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-white font-medium">{review.businessName}</div>
                                                        <div className="text-xs text-slate-400">
                                                            {new Date(review.timestamp).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        className={
                                                            review.type === "LIVE"
                                                                ? "bg-green-600"
                                                                : "bg-blue-600"
                                                        }
                                                    >
                                                        {review.type}
                                                    </Badge>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400">No data for selected date</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Summary */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Recent Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-slate-400">Loading...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left py-3 px-4 text-slate-400">Date</th>
                                        <th className="text-left py-3 px-4 text-slate-400">DONE</th>
                                        <th className="text-left py-3 px-4 text-slate-400">LIVE</th>
                                        <th className="text-left py-3 px-4 text-slate-400">APPLIED</th>
                                        <th className="text-left py-3 px-4 text-slate-400">Earnings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dailyStats.slice(0, 30).map((day: any) => (
                                        <tr
                                            key={day.date}
                                            className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer"
                                            onClick={() => setSelectedDate(new Date(day.date))}
                                        >
                                            <td className="py-3 px-4 text-white">
                                                {new Date(day.date).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-cyan-400 font-medium">
                                                {day.doneCount || 0}
                                            </td>
                                            <td className="py-3 px-4 text-green-400 font-medium">
                                                {day.liveCount}
                                            </td>
                                            <td className="py-3 px-4 text-blue-400 font-medium">
                                                {day.appliedCount}
                                            </td>
                                            <td className="py-3 px-4 text-yellow-400 font-medium">
                                                {day.totalEarnings} BDT
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
