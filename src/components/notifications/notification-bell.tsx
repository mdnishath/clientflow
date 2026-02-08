"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, X, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    isRead: boolean;
    link: string | null;
    createdAt: string;
}

export function NotificationBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Handle notification click - navigate if link exists
    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        if (notification.link) {
            setIsOpen(false);
            router.push(notification.link);
        }
    };

    // Fetch notifications from API
    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Poll every 60 seconds, but only if visible
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchNotifications();
            }
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );

        try {
            await fetch(`/api/notifications/${id}`, { method: "PUT" });
        } catch (error) {
            console.error("Failed to mark as read:", error);
            // Revert on error
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

        try {
            await fetch("/api/notifications", { method: "PUT" });
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            fetchNotifications();
        }
    };

    const removeNotification = async (id: string) => {
        // Optimistic update
        setNotifications((prev) => prev.filter((n) => n.id !== id));

        try {
            await fetch(`/api/notifications/${id}`, { method: "DELETE" });
        } catch (error) {
            console.error("Failed to delete notification:", error);
            fetchNotifications();
        }
    };

    const clearAll = async () => {
        // Optimistic update
        setNotifications([]);

        try {
            await fetch("/api/notifications", { method: "DELETE" });
        } catch (error) {
            console.error("Failed to clear notifications:", error);
            fetchNotifications();
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "success": return "bg-green-500";
            case "warning": return "bg-yellow-500";
            case "error": return "bg-red-500";
            default: return "bg-indigo-500";
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="relative text-slate-400 hover:text-white"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 bg-slate-900 border-slate-700"
                align="end"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-slate-700">
                    <h3 className="font-semibold text-white text-sm">Notifications</h3>
                    <div className="flex gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="text-xs text-indigo-400 hover:text-indigo-300 h-auto py-1 px-2"
                            >
                                Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAll}
                                className="text-xs text-red-400 hover:text-red-300 h-auto py-1 px-2"
                            >
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notifications list */}
                <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}>
                    {isLoading ? (
                        <div className="p-6 text-center">
                            <Loader2 className="h-6 w-6 text-slate-600 mx-auto animate-spin" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-6 text-center">
                            <Inbox className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No notifications</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${!notification.isRead ? "bg-slate-800/30" : ""
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div
                                        className={`flex-1 min-w-0 ${notification.link ? 'cursor-pointer' : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {!notification.isRead && (
                                                <span className={`h-2 w-2 rounded-full ${getTypeColor(notification.type)} flex-shrink-0`} />
                                            )}
                                            <p className="text-sm font-medium text-white truncate">
                                                {notification.title}
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        {!notification.isRead && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => markAsRead(notification.id)}
                                                className="h-6 w-6 p-0 text-slate-500 hover:text-green-400"
                                            >
                                                <Check size={14} />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeNotification(notification.id)}
                                            className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
                                        >
                                            <X size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
