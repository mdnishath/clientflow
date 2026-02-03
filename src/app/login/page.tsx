"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Card className="w-full max-w-md mx-4 border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">CF</span>
                    </div>
                    <CardTitle className="text-2xl text-white">ClientFlow</CardTitle>
                    <CardDescription className="text-slate-400">
                        Sign in to manage your clients and tasks
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="demo@clientflow.local"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-200">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-400 text-center">{error}</p>
                        )}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                    <p className="mt-6 text-center text-sm text-slate-500">
                        Demo: demo@clientflow.local / password123
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
