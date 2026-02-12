"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Users,
    Star,
    LogOut,
    Menu,
    X,
    BarChart3,
    Wand2,
    Settings,
    Sparkles,
    FolderOpen,
    Store,
    Activity,
    Shield,
    User,
    Upload,
    UserCog,
    ArrowRightLeft,
    DollarSign,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type NavItem = {
    name: string;
    href: string;
    icon: React.ElementType;
    adminOnly?: boolean; // Only show for ADMIN role
};

// All navigation items with role restrictions
const navigation: NavItem[] = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Reviews", href: "/reviews", icon: Star },
    { name: "Profiles", href: "/profiles", icon: Store }, // Both admin and client can see
    { name: "Checker", href: "/checker", icon: Activity },
    { name: "Generator", href: "/generator", icon: Wand2, adminOnly: true },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: User }, // Account settings (password)
    // Admin-only items
    { name: "Clients", href: "/clients", icon: Users, adminOnly: true },
    { name: "Finance", href: "/admin/finance", icon: DollarSign, adminOnly: true },
    { name: "Accounts", href: "/admin/accounts", icon: UserCog, adminOnly: true },
    { name: "Workers", href: "/admin/workers", icon: Shield, adminOnly: true },
    { name: "Migration Tool", href: "/admin/migration", icon: ArrowRightLeft, adminOnly: true },
    { name: "Import Profiles", href: "/admin/profiles/import", icon: Upload, adminOnly: true },
    { name: "Categories", href: "/admin/categories", icon: FolderOpen, adminOnly: true },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, isAdmin, role, isLoading } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // FIX: Prevent flicker by caching role on client-side
    const [cachedRole, setCachedRole] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Hydration fix
    useEffect(() => {
        setMounted(true);
        // Load cached role from localStorage
        const stored = localStorage.getItem("user_role");
        if (stored) {
            setCachedRole(stored);
        }
    }, []);

    // Update cache when role changes
    useEffect(() => {
        if (role && mounted) {
            localStorage.setItem("user_role", role);
            setCachedRole(role);
        }
    }, [role, mounted]);

    // Use cached role during loading to prevent flicker
    const effectiveRole = (isLoading && cachedRole) ? cachedRole : role;
    const effectiveIsAdmin = effectiveRole === "ADMIN";

    // Filter navigation based on role
    const visibleNavigation = navigation.filter((item) => {
        if (item.adminOnly && !effectiveIsAdmin) return false;
        return true;
    });

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white"
            >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-40
          flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
            >
                {/* Logo */}
                <div className="h-16 shrink-0 flex items-center px-6 border-b border-slate-800">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-white">CF</span>
                    </div>
                    <span className="text-lg font-semibold text-white">ClientFlow</span>
                </div>

                {/* Role Badge */}
                <div className="shrink-0 px-4 py-3 border-b border-slate-800">
                    <div className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                        ${isAdmin
                            ? "bg-amber-500/20 text-amber-400"
                            : role === "WORKER"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-blue-500/20 text-blue-400"
                        }
                    `}>
                        {isAdmin ? <Shield size={14} /> : <User size={14} />}
                        <span>{isAdmin ? "Admin" : role === "WORKER" ? "Worker" : "Client"}</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin-custom">
                    {visibleNavigation.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                  flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                                        ? "bg-slate-800 text-white"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                    }
                `}
                            >
                                <item.icon size={18} className="mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                                <span className="text-xs font-medium text-slate-300">
                                    {user?.name?.[0] || user?.email?.[0] || "U"}
                                </span>
                            </div>
                            <div className="ml-3 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.name || "User"}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => signOut()}
                            className="text-slate-400 hover:text-white"
                        >
                            <LogOut size={16} />
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
}
