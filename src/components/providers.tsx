"use client";

import { SessionProvider } from "next-auth/react";
import { StoreProvider } from "./providers/StoreProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <StoreProvider>
            <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>
        </StoreProvider>
    );
}
