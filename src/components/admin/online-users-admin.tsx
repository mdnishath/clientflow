"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Circle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface OnlineUser {
    userId: string;
    name: string | null;
    email: string;
    role: string;
    lastSeen: number;
    status: 'online' | 'away' | 'offline';
}

interface PresenceEvent {
    event: 'init' | 'user_online' | 'user_offline' | 'user_away' | 'update';
    userId?: string;
    users: OnlineUser[];
    total: number;
    timestamp: number;
}

export function OnlineUsersAdmin() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<OnlineUser[]>([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const eventSourceRef = useRef<EventSource | null>(null);
    const previousUsersRef = useRef<Map<string, 'online' | 'away' | 'offline'>>(new Map());

    useEffect(() => {
        // Only run for admins
        if (session?.user?.role !== "ADMIN") {
            return;
        }
        // Initial heartbeat for current user
        const sendHeartbeat = async () => {
            try {
                await fetch("/api/presence/heartbeat", { method: "POST" });
            } catch (error) {
                console.error("Heartbeat error:", error);
            }
        };

        sendHeartbeat();
        const heartbeatInterval = setInterval(sendHeartbeat, 15000);

        // Connect to SSE for real-time updates
        const connectSSE = () => {
            const eventSource = new EventSource("/api/presence/stream");
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                try {
                    const data: PresenceEvent = JSON.parse(event.data);

                    // Update users list
                    setUsers(data.users);
                    setOnlineCount(data.total);
                    setLoading(false);

                    // Show notification based on event type
                    if (data.event === 'user_online' && data.userId) {
                        const user = data.users.find(u => u.userId === data.userId);
                        if (user && user.userId !== session?.user?.id) {
                            // Check if this is a new online user (not just status change)
                            const wasOffline = !previousUsersRef.current.has(user.userId) ||
                                previousUsersRef.current.get(user.userId) === 'offline';

                            if (wasOffline) {
                                toast.success(
                                    `${user.name || user.email} is now online`,
                                    {
                                        description: `${user.role} joined`,
                                        duration: 3000,
                                    }
                                );
                            }
                        }
                    }

                    // Update previous users status map
                    const newStatusMap = new Map<string, 'online' | 'away' | 'offline'>();
                    data.users.forEach(user => {
                        newStatusMap.set(user.userId, user.status);
                    });
                    previousUsersRef.current = newStatusMap;

                } catch (error) {
                    console.error("Failed to parse SSE data:", error);
                }
            };

            eventSource.onerror = () => {
                console.error("SSE connection error, reconnecting...");
                eventSource.close();

                // Reconnect after 3 seconds
                setTimeout(() => {
                    if (eventSourceRef.current === eventSource) {
                        connectSSE();
                    }
                }, 3000);
            };
        };

        connectSSE();

        // Cleanup
        return () => {
            clearInterval(heartbeatInterval);
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [session?.user?.id]);

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

    const getStatusColor = (status: 'online' | 'away' | 'offline') => {
        switch (status) {
            case "online":
                return "bg-green-500";
            case "away":
                return "bg-yellow-500";
            case "offline":
                return "bg-slate-500";
        }
    };

    const getStatusText = (status: 'online' | 'away' | 'offline') => {
        switch (status) {
            case "online":
                return "Online";
            case "away":
                return "Away";
            case "offline":
                return "Offline";
        }
    };

    // Only show for admins
    if (session?.user?.role !== "ADMIN") {
        return null;
    }

    if (loading) {
        return (
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-400" />
                        Online Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-slate-700 rounded animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Sort users: online first, then away, then offline
    const sortedUsers = [...users].sort((a, b) => {
        const statusOrder = { online: 0, away: 1, offline: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-400" />
                    Online Users
                </CardTitle>
                <div className="flex gap-2">
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">
                        <Circle className="h-2 w-2 mr-1 fill-green-400" />
                        {onlineCount} online
                    </Badge>
                    <Badge className="bg-slate-500/20 text-slate-400 border border-slate-500/50">
                        {users.length} total
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {users.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">
                        No users online right now
                    </p>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {sortedUsers.map((user) => (
                            <div
                                key={user.userId}
                                className={`flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border transition-colors ${
                                    user.status === 'online'
                                        ? 'border-indigo-500/50 hover:border-indigo-500'
                                        : 'border-slate-700 hover:border-slate-600'
                                }`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                            {(user.name || user.email).charAt(0).toUpperCase()}
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${getStatusColor(user.status)} rounded-full border-2 border-slate-900`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {user.name || user.email}
                                            {user.userId === session?.user?.id && (
                                                <span className="ml-2 text-xs text-slate-400">(You)</span>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        {user.status !== 'online' && (
                                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                    <Badge
                                        className={`text-xs ${
                                            user.status === 'online'
                                                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                : user.status === 'away'
                                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                                                : 'bg-slate-500/20 text-slate-400 border-slate-500/50'
                                        }`}
                                    >
                                        {getStatusText(user.status)}
                                    </Badge>
                                    <Badge className={getRoleBadgeColor(user.role)}>
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
