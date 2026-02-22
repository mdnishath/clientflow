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
    TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { GlobalSearch } from "./global-search";

type NavItem = {
    name: string;
    href: string;
    icon: React.ElementType;
    adminOnly?: boolean;
};

type NavGroup = {
    label?: string;
    items: NavItem[];
};

const navGroups: NavGroup[] = [
    {
        items: [
            { name: "Dashboard", href: "/", icon: LayoutDashboard },
            { name: "Reviews", href: "/reviews", icon: Star },
            { name: "Profiles", href: "/profiles", icon: Store },
            { name: "Checker", href: "/checker", icon: Activity },
            { name: "Performance", href: "/performance", icon: TrendingUp },
            { name: "Generator", href: "/generator", icon: Wand2, adminOnly: true },
            { name: "Reports", href: "/reports", icon: BarChart3 },
            { name: "Settings", href: "/settings", icon: Settings },
        ],
    },
    {
        label: "Admin",
        items: [
            { name: "Clients", href: "/clients", icon: Users, adminOnly: true },
            { name: "Workers", href: "/admin/workers", icon: Shield, adminOnly: true },
            { name: "Finance", href: "/admin/finance", icon: DollarSign, adminOnly: true },
            { name: "Accounts", href: "/admin/accounts", icon: UserCog, adminOnly: true },
            { name: "Categories", href: "/admin/categories", icon: FolderOpen, adminOnly: true },
            { name: "Migration", href: "/admin/migration", icon: ArrowRightLeft, adminOnly: true },
            { name: "Import Profiles", href: "/admin/profiles/import", icon: Upload, adminOnly: true },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, isAdmin, role, isLoading } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const [cachedRole, setCachedRole] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("user_role");
        if (stored) setCachedRole(stored);
    }, []);

    useEffect(() => {
        if (role && mounted) {
            localStorage.setItem("user_role", role);
            setCachedRole(role);
        }
    }, [role, mounted]);

    const effectiveRole = (isLoading && cachedRole) ? cachedRole : role;
    const effectiveIsAdmin = effectiveRole === "ADMIN";

    const isActive = (href: string) =>
        pathname === href || (href !== "/" && pathname.startsWith(href));

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white shadow-lg"
            >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full w-64 bg-slate-950 border-r border-slate-800/60 z-40
                    flex flex-col
                    transform transition-transform duration-200 ease-in-out
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                `}
            >
                {/* Logo */}
                <div className="h-16 shrink-0 flex items-center px-5 border-b border-slate-800/60">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
                        <span className="text-sm font-bold text-white">CF</span>
                    </div>
                    <div>
                        <span className="text-[15px] font-semibold text-white">ClientFlow</span>
                        <span className="block text-[10px] text-slate-500 -mt-0.5">Review Manager</span>
                    </div>
                </div>

                {/* Role Badge */}
                <div className="shrink-0 px-4 py-2.5 border-b border-slate-800/60">
                    <div className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium w-fit
                        ${effectiveIsAdmin
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            : effectiveRole === "WORKER"
                                ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                                : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                        }
                    `}>
                        {effectiveIsAdmin ? <Shield size={12} /> : <User size={12} />}
                        <span>{effectiveIsAdmin ? "Admin" : effectiveRole === "WORKER" ? "Worker" : "Client"}</span>
                    </div>
                </div>

                {/* Global Search */}
                <div className="shrink-0 px-3 py-2 border-b border-slate-800/60">
                    <GlobalSearch />
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-3 overflow-y-auto scrollbar-thin-custom">
                    {navGroups.map((group, groupIndex) => {
                        const visibleItems = group.items.filter(item =>
                            !item.adminOnly || effectiveIsAdmin
                        );
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={groupIndex} className={groupIndex > 0 ? "mt-4" : ""}>
                                {group.label && (
                                    <div className="px-3 mb-1.5">
                                        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                                            {group.label}
                                        </p>
                                    </div>
                                )}
                                <div className="space-y-0.5">
                                    {visibleItems.map((item) => {
                                        const active = isActive(item.href);
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setIsMobileOpen(false)}
                                                className={`
                                                    flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
                                                    transition-all duration-150 relative group
                                                    ${active
                                                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
                                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                                    }
                                                `}
                                            >
                                                {active && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
                                                )}
                                                <item.icon
                                                    size={16}
                                                    className={`mr-3 shrink-0 ${active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400"}`}
                                                />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-slate-800/60 bg-slate-950">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-slate-700 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-slate-300">
                                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate leading-tight">
                                {user?.name || "User"}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                                {user?.email}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => signOut({ callbackUrl: '/login', redirect: true })}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
                            title="Logout"
                        >
                            <LogOut size={15} />
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
}
