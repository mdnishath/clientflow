"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Circle } from "lucide-react";
import { useSession } from "next-auth/react";

interface CurrentUser {
    name: string | null;
    email: string;
    role: string;
}

export function OnlineUsers() {
    const { data: session, status } = useSession();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setCurrentUser({
                name: session.user.name || null,
                email: session.user.email || "",
                role: session.user.role || "USER",
            });
            setIsOnline(true);

            // Send heartbeat every 15 seconds to maintain online status
            const sendHeartbeat = async () => {
                try {
                    await fetch("/api/presence/heartbeat", {
                        method: "POST",
                    });
                    setIsOnline(true);
                } catch (error) {
                    console.error("Heartbeat error:", error);
                    setIsOnline(false);
                }
            };

            // Initial heartbeat
            sendHeartbeat();

            // Send heartbeat every 15 seconds
            const heartbeatInterval = setInterval(sendHeartbeat, 15000);

            return () => {
                clearInterval(heartbeatInterval);
            };
        }
    }, [session]);

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-500/20 text-red-400 border-red-500/50";
            case "WORKER":
                return "bg-blue-500/20 text-blue-400 border-blue-500/50";
            case "CLIENT":
                return "bg-green-500/20 text-green-400 border-green-500/50";
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/50";
        }
    };

    if (status === "loading") {
        return (
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Circle className="h-5 w-5 text-indigo-400" />
                        My Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-16 bg-slate-700 rounded animate-pulse" />
                </CardContent>
            </Card>
        );
    }

    if (!currentUser) {
        return (
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Circle className="h-5 w-5 text-slate-400" />
                        My Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-400 text-sm text-center py-8">
                        Not logged in
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                    <Circle className="h-5 w-5 text-indigo-400" />
                    My Status
                </CardTitle>
                <Badge className={isOnline ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-slate-500/20 text-slate-400 border border-slate-500/50"}>
                    <Circle className={`h-2 w-2 mr-1 ${isOnline ? "fill-green-400" : "fill-slate-400"}`} />
                    {isOnline ? "Online" : "Offline"}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {(currentUser.name || currentUser.email).charAt(0).toUpperCase()}
                            </div>
                            {isOnline && (
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-slate-900" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {currentUser.name || currentUser.email}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                                {currentUser.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                        <Badge className={getRoleBadgeColor(currentUser.role)}>
                            {currentUser.role}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
