"use client";

import React, { useState, useEffect } from 'react';
import { 
    Users, Calendar, Clock, BrainCircuit, CheckCircle, 
    MessageSquare, ChevronRight, AlertCircle 
} from 'lucide-react';
import { teacherService, Session } from '@/services/teacherService';
import { Student } from '@/services/studentService';
import Image from 'next/image';
import MaterialGeneratorModal from './MaterialGeneratorModal';

const TeacherOverview: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [selectedStudentForGen, setSelectedStudentForGen] = useState<Student | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const [studentData, sessionData] = await Promise.all([
                    teacherService.getMyStudents(),
                    teacherService.getTodaySessions()
                ]);
                setStudents(studentData);
                setSessions(sessionData);
            } catch (error) {
                console.error("Teacher Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const openGenerator = (student: Student) => {
        setSelectedStudentForGen(student);
        setIsGeneratorOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 animate-pulse">
                <p className="text-slate-400 font-medium">Dashboard Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 font-display">Merhaba, Hocam</h2>
                    <p className="text-slate-500">Bugün sizi bekleyen {sessions.length} seans bulunuyor.</p>
                </div>
                <button className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:scale-105 transition-transform flex items-center gap-2">
                    <CheckCircle size={20} />
                    Hızlı Yoklama
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: My Students */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                            <Users className="text-emerald-500" />
                            Öğrencilerim
                        </h3>
                        <button className="text-emerald-600 text-sm font-bold hover:underline flex items-center gap-1">
                            Tümünü Gör <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {students.slice(0, 4).map((student) => (
                            <div key={student.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden relative border-2 border-primary/10">
                                        <Image 
                                            src={student.avatarUrl || "/images/avatar-placeholder.svg"} 
                                            alt={student.fullName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 truncate">{student.fullName}</h4>
                                        <p className="text-xs text-slate-500 truncate mb-2">{student.diagnosis || 'Tanı Belirtilmemiş'}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <button 
                                                onClick={() => openGenerator(student)}
                                                className="text-[10px] bg-secondary/10 text-secondary-dark px-2 py-1 rounded-full font-bold hover:bg-secondary/20 transition-colors"
                                            >
                                                BEP
                                            </button>
                                            <button className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold hover:bg-emerald-200 transition-colors">
                                                Yoklama
                                            </button>
                                            <button className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold hover:bg-blue-200 transition-colors">
                                                Mesaj
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Tools */}
                    <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit size={120} /></div>
                        <div className="relative z-10 max-w-md">
                            <h3 className="text-xl font-bold mb-2">AI Materyal Üretici</h3>
                            <p className="text-primary-light text-sm mb-4">Öğrencinizin gelişimine en uygun çizim ve boyama materyallerini saniyeler içinde oluşturun.</p>
                            <button 
                                onClick={() => students[0] && openGenerator(students[0])}
                                className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Hemen Dene
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Schedule */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                        <Calendar className="text-secondary" />
                        Günlük Program
                    </h3>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-sm">
                        {sessions.map((session, index) => (
                            <div 
                                key={session.id} 
                                className={`p-4 flex items-center gap-4 border-b border-slate-50 last:border-0 ${session.status === 'ongoing' ? 'bg-primary/5' : ''}`}
                            >
                                <div className="text-slate-400 font-medium w-12 text-center">
                                    {session.time}
                                </div>
                                <div className={`w-1 h-10 rounded-full ${session.status === 'ongoing' ? 'bg-primary' : 'bg-slate-200'}`}></div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-800">{session.studentName}</p>
                                    <p className="text-xs text-slate-500">{session.type}</p>
                                </div>
                                {session.status === 'ongoing' && (
                                    <div className="animate-pulse bg-primary/20 p-1.5 rounded-full">
                                        <Clock size={16} className="text-primary" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Notifications */}
                    <div className="space-y-3">
                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3 items-start">
                            <AlertCircle className="text-orange-500 shrink-0" size={20} />
                            <div>
                                <p className="text-sm font-bold text-orange-800">Rapor Hatırlatması</p>
                                <p className="text-xs text-orange-600">Ali Yılmaz'ın RAM raporu 3 gün sonra bitiyor.</p>
                            </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                            <MessageSquare className="text-blue-500 shrink-0" size={20} />
                            <div>
                                <p className="text-sm font-bold text-blue-800">Yeni Mesaj</p>
                                <p className="text-xs text-blue-600">Ayşe Demir'in velisinden yeni bir mesajınız var.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Generator Modal */}
            {selectedStudentForGen && (
                <MaterialGeneratorModal 
                    isOpen={isGeneratorOpen} 
                    onClose={() => setIsGeneratorOpen(false)} 
                    student={selectedStudentForGen} 
                />
            )}
        </div>
    );
};

export default TeacherOverview;
