import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-center space-y-6 p-8">
                {/* Icon */}
                <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                    <ShieldX className="h-10 w-10 text-red-500" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white">
                        Access Denied
                    </h1>
                    <p className="text-slate-400 max-w-md">
                        You don&apos;t have permission to access this page.
                        Please contact your administrator if you believe this
                        is an error.
                    </p>
                </div>

                {/* Error Code */}
                <div className="inline-block px-4 py-2 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="text-sm font-mono text-slate-500">
                        Error Code:{" "}
                    </span>
                    <span className="text-sm font-mono text-red-400">403</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        asChild
                        variant="outline"
                        className="border-slate-700 hover:bg-slate-800"
                    >
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Return to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
