"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Settings,
    Lock,
    Loader2,
    CheckCircle2,
    Database,
    Download,
    Upload,
    AlertTriangle,
    Shield
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
    const { isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState<"account" | "admin">("account");

    // account state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // admin state
    const [isRestoring, setIsRestoring] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

        setIsLoading(true);
        try {
            const res = await fetch("/api/account", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Password updated successfully");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(data.error || "Failed to update password");
            }
        } catch {
            toast.error("Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackup = () => {
        // Trigger download via direct navigation
        window.location.href = "/api/admin/backup";
        toast.success("Backup download started");
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input so same file can be selected again if needed
        e.target.value = "";

        if (!confirm("WARNING: This will WIPE the current database and replace it with the backup. This cannot be undone. Are you sure?")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonContent = event.target?.result as string;
                const backupData = JSON.parse(jsonContent);

                setIsRestoring(true);
                const res = await fetch("/api/admin/restore", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ data: backupData.data || backupData }), // Handle robustly
                });

                const result = await res.json();

                if (res.ok) {
                    toast.success("Database restored successfully!");
                    setTimeout(() => window.location.reload(), 2000); // Reload to reflect changes
                } else {
                    toast.error(result.error || "Failed to restore database");
                }
            } catch (err) {
                console.error(err);
                toast.error("Invalid backup file");
            } finally {
                setIsRestoring(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Settings className="text-indigo-400" />
                    Settings
                </h1>
                <p className="text-slate-400 mt-1">
                    Manage your account and application settings
                </p>
            </div>

            {/* Custom Tabs */}
            <div className="flex border-b border-slate-700 mb-8">
                <button
                    onClick={() => setActiveTab("account")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "account"
                            ? "border-indigo-500 text-indigo-400"
                            : "border-transparent text-slate-400 hover:text-white"
                        }`}
                >
                    Account
                </button>
                {isAdmin && (
                    <button
                        onClick={() => setActiveTab("admin")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "admin"
                                ? "border-indigo-500 text-indigo-400"
                                : "border-transparent text-slate-400 hover:text-white"
                            }`}
                    >
                        Admin & Database
                    </button>
                )}
            </div>

            <div className="max-w-xl">
                {activeTab === "account" && (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Lock className="h-5 w-5 text-indigo-400" />
                                Change Password
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Update your password to keep your account secure
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword" className="text-slate-300">
                                        Current Password
                                    </Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="bg-slate-900 border-slate-600 text-white"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-slate-300">
                                        New Password
                                    </Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password (min 6 characters)"
                                        className="bg-slate-900 border-slate-600 text-white"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-slate-300">
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="bg-slate-900 border-slate-600 text-white"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
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
                )}

                {activeTab === "admin" && isAdmin && (
                    <div className="space-y-6">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Database className="h-5 w-5 text-indigo-400" />
                                    Database Backup
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Download a JSON backup of the entire database
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={handleBackup}
                                    className="w-full bg-slate-700 hover:bg-slate-600"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Backup
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-red-400" />
                                    Restore Database
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Restore database from a previous backup file.
                                    <br />
                                    <span className="text-amber-500 flex items-center gap-1 mt-1 text-xs">
                                        <AlertTriangle size={12} />
                                        WARNING: This will wipe all current data!
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".json"
                                    className="hidden"
                                />
                                <Button
                                    onClick={handleRestoreClick}
                                    disabled={isRestoring}
                                    variant="destructive"
                                    className="w-full"
                                >
                                    {isRestoring ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Restoring Data...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload & Restore
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
