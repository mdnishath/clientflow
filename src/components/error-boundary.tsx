"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console (will be replaced by logger utility)
        console.error("Error Boundary caught an error:", error, errorInfo);

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);

        // Update state with error info
        this.setState({
            errorInfo,
        });

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = () => {
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
                    <Card className="bg-slate-900/50 border-red-500/30 backdrop-blur-sm max-w-2xl w-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-500/20 rounded-xl">
                                    <AlertTriangle className="text-red-400" size={28} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl text-white">Something went wrong</CardTitle>
                                    <p className="text-slate-400 text-sm mt-1">
                                        An unexpected error occurred. Don&apos;t worry, your data is safe.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Error Details (only in development) */}
                            {process.env.NODE_ENV === "development" && this.state.error && (
                                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                                    <p className="text-red-400 font-mono text-sm font-semibold mb-2">
                                        {this.state.error.name}: {this.state.error.message}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="mt-3">
                                            <summary className="text-slate-400 text-xs cursor-pointer hover:text-slate-300">
                                                View Component Stack
                                            </summary>
                                            <pre className="mt-2 text-xs text-slate-500 overflow-x-auto">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={this.handleReset}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button
                                    onClick={this.handleGoHome}
                                    variant="outline"
                                    className="flex-1 border-slate-700 hover:bg-slate-800"
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Go Home
                                </Button>
                            </div>

                            {/* Help Text */}
                            <p className="text-xs text-slate-500 text-center">
                                If this problem persists, please contact support or refresh the page.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

// Convenience wrapper for pages
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryComponent(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
