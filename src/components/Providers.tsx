"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

import { PolicyModalProvider } from "@/context/PolicyModalContext";
import { CookieProvider } from "@/context/CookieContext";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <CookieProvider>
                <PolicyModalProvider>
                    {children}
                </PolicyModalProvider>
            </CookieProvider>
        </ThemeProvider>
    );
}
