"use client";

import { SessionProvider } from "next-auth/react";
import { StoreProvider } from "./providers/StoreProvider";
import { ErrorBoundary } from "./error-boundary";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <StoreProvider>
                <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>
            </StoreProvider>
        </ErrorBoundary>
    );
}
