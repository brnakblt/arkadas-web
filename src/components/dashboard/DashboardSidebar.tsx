"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Briefcase, Camera,
    BrainCircuit, Image as ImageIcon, MessageSquare,
    Settings, LogOut, GraduationCap, FileCheck, Calendar
} from 'lucide-react';

const DashboardSidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        router.push('/');
    };

    const menuGroups = [
        {
            title: "Yönetim Paneli",
            items: [
                { id: 'dashboard', label: 'Ana Menü', icon: <LayoutDashboard size={18} />, href: '/dashboard' },
                { id: 'students', label: 'Öğrenci Yönetimi', icon: <GraduationCap size={18} />, href: '/dashboard/students' },
                { id: 'personnel', label: 'Personel Yönetimi', icon: <Briefcase size={18} />, href: '/dashboard/personnel' },
                { id: 'scheduler', label: 'Ders Planlama', icon: <Calendar size={18} />, href: '/dashboard/scheduler' },
            ]
        },
        {
            title: "Yapay Zeka Araçları",
            items: [
                { id: 'chat', label: 'Akıllı Asistan', icon: <MessageSquare size={18} />, href: '/dashboard/chat' },
            ]
        }
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard' && pathname === '/dashboard') return true;
        if (href !== '/dashboard' && pathname?.startsWith(href)) return true;
        return false;
    };

    return (
        <aside className="w-64 bg-background border-r border-border h-screen fixed left-0 top-0 flex-col z-20 hidden md:flex shadow-xl transition-all duration-300">
            <div className="h-20 bg-gradient-to-r from-primary to-primary-dark flex items-center px-6 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm opacity-10"></div>
                <div className="relative z-10 flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center border border-white/30 font-bold text-lg">A</div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Arkadaş</h1>
                        <p className="text-[10px] text-primary-light opacity-90 uppercase tracking-widest">Özel Eğitim ERP</p>
                    </div>
                </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                {menuGroups.map((group, idx) => (
                    <div key={idx}>
                        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-3 px-3">{group.title}</h3>
                        <ul className="space-y-1">
                            {group.items.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <li key={item.id}>
                                        <Link
                                            href={item.href}
                                            aria-current={active ? 'page' : undefined}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${active ? 'bg-primary/10 text-primary-dark dark:text-primary-light font-semibold shadow-sm' : 'text-foreground/70 hover:bg-surface'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={active ? 'text-primary' : 'text-foreground/40'}>{item.icon}</span>
                                                <span className="text-sm">{item.label}</span>
                                            </div>
                                            {active && <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
            <div className="p-4 border-t border-border bg-surface shrink-0">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-background transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full border-2 border-border shadow-sm bg-border flex items-center justify-center text-foreground/60 font-bold">AY</div>
                    <div className="flex-1 truncate"><p className="text-sm font-bold text-foreground">Ahmet Yılmaz</p><p className="text-xs text-foreground/60">Müdür</p></div>
                    <Settings size={16} className="text-foreground/40 group-hover:text-foreground/80 transition-colors" />
                </div>
                <button 
                    onClick={handleLogout}
                    className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-medium text-foreground/60 hover:text-red-600 dark:hover:text-red-400 py-1.5 transition-colors"
                >
                    <LogOut size={14} /> Çıkış
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
