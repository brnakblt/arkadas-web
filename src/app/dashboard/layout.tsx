import React from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import TopBar from '@/components/dashboard/TopBar';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative flex font-sans transition-colors duration-300">
            {/* Desktop Sidebar */}
            <DashboardSidebar />

            {/* Main Content Area */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Top Navigation Bar */}
                <TopBar />

                <main className="flex-1 p-4 md:p-8 animate-fade-in overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
