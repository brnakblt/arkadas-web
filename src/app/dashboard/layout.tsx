"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { authService } from '@/services/authService';

interface User {
    id: number;
    username: string;
    email: string;
    userType?: 'parent' | 'teacher';
}

interface DashboardContextType {
    user: User | null;
    loading: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const DashboardContext = createContext<DashboardContextType>({
    user: null,
    loading: true,
    searchQuery: '',
    setSearchQuery: () => { }
});

export const useDashboard = () => useContext(DashboardContext);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) {
                router.push('/');
                return;
            }

            try {
                // First try to get from localStorage for immediate render
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }

                // Then fetch fresh data
                const userData = await authService.getMe(token);
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
                console.error("Error fetching user data:", error);
                localStorage.removeItem('user');
                localStorage.removeItem('jwt');
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    if (loading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <DashboardContext.Provider value={{ user, loading, searchQuery, setSearchQuery }}>
            <div className="flex min-h-screen bg-[#f5f5f5]">
                <Sidebar />
                <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
                    <TopBar />
                    <main className="flex-1 p-6 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </DashboardContext.Provider>
    );
}
