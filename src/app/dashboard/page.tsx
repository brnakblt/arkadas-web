"use client";

import React, { useState, useEffect } from 'react';
import Overview from '@/components/dashboard/Overview';
import TeacherOverview from '@/components/dashboard/TeacherOverview';
import { authService } from '@/services/authService';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const userData = await authService.getMe();
                setUser(userData);
            } catch (error) {
                console.error("Dashboard auth check failed:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Role-based dispatcher
    // Note: Adjust 'teacher' string based on your Strapi role name or userType
    if (user?.userType === 'teacher' || user?.role?.name === 'Teacher') {
        return <TeacherOverview />;
    }

    return <Overview />;
}
