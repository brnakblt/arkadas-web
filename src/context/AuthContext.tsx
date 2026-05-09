"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ArkadaşClient } from 'arkadas-sdk';

interface AuthContextType {
    user: any;
    sdk: ArkadaşClient;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);

    // 1. Resolve Tenant from Hostname (e.g. school-a.localhost)
    const tenantId = useMemo(() => {
        if (typeof window === 'undefined') return 'public';
        const host = window.location.hostname;
        const parts = host.split('.');
        return parts.length > 2 ? parts[0] : 'public';
    }, []);

    // 2. Initialize the SDK
    const sdk = useMemo(() => new ArkadaşClient({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
        tenantId: tenantId
    }), [tenantId]);

    // 3. Methods
    const login = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
    };

    const logout = () => {
        // In a real app, call a server-side logout to clear cookies
        setUser(null);
        window.location.href = '/';
    };

    // 4. Initial Load
    useEffect(() => {
        sdk.getMe().then(setUser).catch(() => setUser(null));
    }, [sdk]);

    return (
        <AuthContext.Provider value={{ user, sdk, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
