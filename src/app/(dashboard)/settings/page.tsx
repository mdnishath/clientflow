"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Settings as SettingsIcon,
    Lock,
    Loader2,
    CheckCircle2,
    Database,
    Download,
    Upload,
    AlertTriangle,
    Shield,
    User,
    FileCode,
    Sparkles,
    Package,
    HardDrive,
    Zap,
    Crown,
    ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { AdvancedBackup } from "@/components/settings/advanced-backup";

export default function SettingsPage() {
    const { isAdmin, user } = useAuth();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<"profile" | "security" | "backup" | "advanced">("profile");

    // Profile state
    const [name, setName] = useState(user?.name || "");
    const [isUpdatingName, setIsUpdatingName] = useState(false);

    // Security state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Backup state
    const [isRestoring, setIsRestoring] = useState(false);
    const [isRestoringSettings, setIsRestoringSettings] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const settingsFileInputRef = useRef<HTMLInputElement>(null);

    const handleNameUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        setIsUpdatingName(true);
        try {
            const res = await fetch("/api/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (res.ok) {
                toast.success("Profile updated successfully!");
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update name");
            }
        } catch {
            toast.error("Failed to update name");
        } finally {
            setIsUpdatingName(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsChangingPassword(true);
        try {
            const res = await fetch("/api/account", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (res.ok) {
                toast.success("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update password");
            }
        } catch {
            toast.error("Failed to update password");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSettingsBackup = () => {
        window.location.href = "/api/admin/backup-settings";
        toast.success("Downloading settings backup...");
    };

    const handleSettingsRestore = () => {
        settingsFileInputRef.current?.click();
    };

    const handleSettingsFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonContent = event.target?.result as string;
                const settingsData = JSON.parse(jsonContent);

                if (settingsData.meta?.type !== "settings-only") {
                    toast.error("Invalid backup file - must be a settings-only backup");
                    return;
                }

                setIsRestoringSettings(true);
                const res = await fetch("/api/admin/restore-settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: jsonContent,
                });

                const data = await res.json();

                if (res.ok) {
                    toast.success(
                        `Settings restored! ${data.stats.templatesCreated} templates, ${data.stats.contextsCreated} contexts, ${data.stats.categoriesCreated} categories`,
                        { duration: 5000 }
                    );
                    router.refresh();
                } else {
                    toast.error(data.error || "Failed to restore settings");
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to parse backup file");
            } finally {
                setIsRestoringSettings(false);
            }
        };

        reader.onerror = () => toast.error("Failed to read backup file");
        reader.readAsText(file);
    };

    const handleFullBackup = () => {
        window.location.href = "/api/admin/backup";
        toast.success("Downloading full database backup...");
    };

    const handleFullRestore = () => {
        fileInputRef.current?.click();
    };

    const handleFullRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        if (!confirm("⚠️ WARNING: This will WIPE ALL current data and replace it with the backup. This cannot be undone. Are you absolutely sure?")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonContent = event.target?.result as string;
                JSON.parse(jsonContent);

                setIsRestoring(true);
                const res = await fetch("/api/admin/restore", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: jsonContent,
                });

                if (res.ok) {
                    toast.success("Database restored successfully!");
                    router.refresh();
                } else {
                    const data = await res.json();
                    toast.error(data.error || "Failed to restore database");
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to parse backup file");
            } finally {
                setIsRestoring(false);
            }
        };

        reader.onerror = () => toast.error("Failed to read backup file");
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/50">
                        <SettingsIcon className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Settings</h1>
                        <p className="text-slate-400 mt-1">Manage your account, security, and system preferences</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm sticky top-24">
                        <CardContent className="p-4">
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveSection("profile")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                        activeSection === "profile"
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                    }`}
                                >
                                    <User size={20} />
                                    <span className="font-medium">Profile</span>
                                </button>

                                <button
                                    onClick={() => setActiveSection("security")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                        activeSection === "security"
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                    }`}
                                >
                                    <Lock size={20} />
                                    <span className="font-medium">Security</span>
                                </button>

                                {isAdmin && (
                                    <>
                                        <button
                                            onClick={() => setActiveSection("backup")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                                activeSection === "backup"
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                            }`}
                                        >
                                            <Database size={20} />
                                            <span className="font-medium">Backup & Restore</span>
                                        </button>

                                        <button
                                            onClick={() => setActiveSection("advanced")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                                activeSection === "advanced"
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                            }`}
                                        >
                                            <Zap size={20} />
                                            <span className="font-medium">Advanced</span>
                                            <Badge variant="secondary" className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30">
                                                Admin
                                            </Badge>
                                        </button>
                                    </>
                                )}
                            </nav>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Profile Section */}
                    {activeSection === "profile" && (
                        <div className="space-y-6">
                            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-white flex items-center gap-2 text-2xl">
                                                <User className="text-indigo-400" size={24} />
                                                Profile Information
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 mt-2">
                                                Update your personal information and how you appear to others
                                            </CardDescription>
                                        </div>
                                        <Sparkles className="text-purple-400" size={24} />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <form onSubmit={handleNameUpdate} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-slate-300 font-medium">
                                                Display Name
                                            </Label>
                                            <div className="flex gap-3">
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Enter your name"
                                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                                                    required
                                                />
                                                <Button
                                                    type="submit"
                                                    disabled={isUpdatingName || !name || name === user?.name}
                                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
                                                >
                                                    {isUpdatingName ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                                            Save
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-slate-300 font-medium">
                                                Email Address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={user?.email || ""}
                                                disabled
                                                className="bg-slate-800/30 border-slate-700/50 text-slate-400 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-slate-500">Email cannot be changed</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-slate-300 font-medium">Role</Label>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 px-4 py-1.5">
                                                    {user?.role === "ADMIN" && <Crown className="w-3 h-3 mr-1" />}
                                                    {user?.role === "ADMIN" ? "Administrator" : user?.role === "WORKER" ? "Worker" : "Client"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Security Section */}
                    {activeSection === "security" && (
                        <div className="space-y-6">
                            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-white flex items-center gap-2 text-2xl">
                                                <ShieldCheck className="text-emerald-400" size={24} />
                                                Change Password
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 mt-2">
                                                Keep your account secure with a strong password
                                            </CardDescription>
                                        </div>
                                        <Lock className="text-emerald-400" size={24} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordChange} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword" className="text-slate-300 font-medium">
                                                Current Password
                                            </Label>
                                            <Input
                                                id="currentPassword"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter current password"
                                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword" className="text-slate-300 font-medium">
                                                New Password
                                            </Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password (min 6 characters)"
                                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                                                required
                                                minLength={6}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-slate-300 font-medium">
                                                Confirm New Password
                                            </Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                                                required
                                                minLength={6}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30"
                                        >
                                            {isChangingPassword ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Updating Password...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Update Password
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Backup & Restore Section */}
                    {activeSection === "backup" && isAdmin && (
                        <div className="space-y-6">
                            {/* Settings Backup */}
                            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-white flex items-center gap-2 text-2xl">
                                                <FileCode className="text-cyan-400" size={24} />
                                                Configuration Backup
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 mt-2">
                                                Export/Import templates, contexts, and categories only
                                            </CardDescription>
                                        </div>
                                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                                            Cross-Deployment Safe
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <Package className="text-cyan-400 mt-0.5" size={20} />
                                            <div className="flex-1">
                                                <p className="text-sm text-cyan-300 font-medium">What's included:</p>
                                                <ul className="text-xs text-slate-400 mt-2 space-y-1">
                                                    <li>✓ Review Templates (prompts, instructions, examples)</li>
                                                    <li>✓ Review Contexts (personas, scenarios, tones)</li>
                                                    <li>✓ Categories (business types, icons, colors)</li>
                                                    <li className="text-amber-400">✗ Business Data (profiles, reviews, clients) - NOT included</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Button
                                            onClick={handleSettingsBackup}
                                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/30"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Settings
                                        </Button>

                                        <input
                                            type="file"
                                            ref={settingsFileInputRef}
                                            onChange={handleSettingsFileChange}
                                            accept=".json"
                                            className="hidden"
                                        />
                                        <Button
                                            onClick={handleSettingsRestore}
                                            disabled={isRestoringSettings}
                                            variant="outline"
                                            className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10"
                                        >
                                            {isRestoringSettings ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Importing...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Import Settings
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Full Database Backup */}
                            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-white flex items-center gap-2 text-2xl">
                                                <HardDrive className="text-orange-400" size={24} />
                                                Complete Database Backup
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 mt-2">
                                                Full system backup including all business data
                                            </CardDescription>
                                        </div>
                                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                            Everything
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <Database className="text-orange-400 mt-0.5" size={20} />
                                            <div className="flex-1">
                                                <p className="text-sm text-orange-300 font-medium">Complete backup includes:</p>
                                                <ul className="text-xs text-slate-400 mt-2 space-y-1">
                                                    <li>✓ All profiles, reviews, and clients</li>
                                                    <li>✓ Templates, contexts, and categories</li>
                                                    <li>✓ User accounts and permissions</li>
                                                    <li>✓ System configurations</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleFullBackup}
                                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/30"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Full Backup
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Dangerous Zone - Restore */}
                            <Card className="bg-slate-900/50 border-red-900/50 backdrop-blur-sm overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-red-600 to-rose-600"></div>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-white flex items-center gap-2 text-2xl">
                                                <Shield className="text-red-400" size={24} />
                                                Restore Database
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 mt-2">
                                                Replace current database with backup file
                                            </CardDescription>
                                        </div>
                                        <AlertTriangle className="text-red-400" size={24} />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
                                            <div className="flex-1">
                                                <p className="text-sm text-red-300 font-medium">⚠️ DANGER ZONE</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    This action will PERMANENTLY DELETE all current data and replace it with the backup.
                                                    This cannot be undone. Make sure you have a recent backup before proceeding.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFullRestoreFile}
                                        accept=".json"
                                        className="hidden"
                                    />
                                    <Button
                                        onClick={handleFullRestore}
                                        disabled={isRestoring}
                                        variant="destructive"
                                        className="w-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30"
                                    >
                                        {isRestoring ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Restoring Database...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload & Restore Database
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Advanced Section */}
                    {activeSection === "advanced" && isAdmin && (
                        <div className="space-y-6">
                            <AdvancedBackup />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
