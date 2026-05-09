"use client";

import React, { useState, useEffect } from 'react';
import { 
    Calendar, Users, ChevronLeft, 
    ChevronRight, Plus, AlertCircle, CheckCircle2,
    Search, Download
} from 'lucide-react';
import { schedulerService, Classroom, SessionPlan } from '@/services/schedulerService';
import { studentService, Student } from '@/services/studentService';
import { personnelService, Personnel } from '@/services/personnelService';

const TIME_SLOTS = [
    { id: 1, label: '09:00 - 09:40', start: '09:00' },
    { id: 2, label: '10:00 - 10:40', start: '10:00' },
    { id: 3, label: '11:00 - 11:40', start: '11:00' },
    { id: 4, label: '12:00 - 12:40', start: '12:00' },
    { id: 5, label: '13:00 - 13:40', start: '13:00' },
    { id: 6, label: '14:00 - 14:40', start: '14:00' },
    { id: 7, label: '15:00 - 15:40', start: '15:00' },
    { id: 8, label: '16:00 - 16:40', start: '16:00' },
];

const SmartScheduler: React.FC = () => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [sessions, setSessions] = useState<SessionPlan[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Classroom | null>(null);

    const navigateDate = (days: number) => {
        const current = new Date(selectedDate);
        current.setDate(current.getDate() + days);
        setSelectedDate(current.toISOString().split('T')[0]);
        setSelectedStudent(null);
        setSelectedRoom(null);
    };

    useEffect(() => {
        async function loadAll() {
            try {
                const [cr, sess, st, pr] = await Promise.all([
                    schedulerService.getClassrooms(),
                    schedulerService.getSessions(selectedDate),
                    studentService.getStudents(),
                    personnelService.getPersonnel()
                ]);
                setClassrooms(cr);
                setSessions(sess);
                setStudents(st);
                setPersonnel(pr);
            } catch (err) {
                console.error("Scheduler Load Error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadAll();
    }, [selectedDate]);

    const handlePlanSession = async (teacher: Personnel, slot: any) => {
        if (!selectedStudent || !selectedRoom) {
            alert("Lütfen önce bir öğrenci ve bir derslik seçin.");
            return;
        }

        const startTime = new Date(selectedDate);
        const [hours, minutes] = slot.start.split(':');
        startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + 40);

        const newSessionData = {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            student: selectedStudent.id, 
            teacher: teacher.id,
            classroom: selectedRoom.id,
            isGroup: selectedRoom.type === 'GROUP'
        };

        try {
            const validation = await schedulerService.validateSession(newSessionData);
            if (!validation.valid) {
                alert(`MEB Kural İhlali:\n- ${validation.errors.join('\n- ')}`);
                return;
            }

            const saved = await schedulerService.createSession(newSessionData);
            setSessions([...sessions, saved]);
            setSelectedStudent(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu";
            alert(message);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-slate-400 font-medium tracking-wide dark:text-slate-500">MEB Planlama Ekranı Yükleniyor...</div>;

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <header className="flex flex-col md:items-center justify-between gap-4 bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-display leading-tight">Profesyonel MEB Programı</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Öğretmen bazlı haftalık ve günlük ders dağılımı.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
                    <button 
                        onClick={() => navigateDate(-1)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 font-bold text-slate-700 dark:text-slate-200 text-sm whitespace-nowrap uppercase tracking-tighter">
                        {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                        onClick={() => navigateDate(1)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:shadow-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </header>

            <div className="flex flex-col xl:flex-row gap-6">
                {/* Main Grid: Teachers as Rows, Time Slots as Columns */}
                <div className="flex-1 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 w-48 text-left sticky left-0 z-20 backdrop-blur-sm">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Eğitimci</span>
                                    </th>
                                    {TIME_SLOTS.map(slot => (
                                        <th key={slot.id} className="p-4 border-b border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 min-w-[140px]">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">{slot.label}</span>
                                                <span className="text-[9px] text-slate-400 uppercase tracking-tighter font-bold">{slot.id}. DERS</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {personnel.map(teacher => (
                                    <tr key={teacher.id} className="group transition-colors hover:bg-slate-50/30 dark:hover:bg-slate-900/5">
                                        <td className="p-4 border-b border-slate-100 dark:border-slate-800 sticky left-0 z-20 bg-white dark:bg-slate-950 shadow-[2px_0_5px_rgba(0,0,0,0.02)] transition-colors group-hover:bg-slate-50 dark:group-hover:bg-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                                                    {teacher.fullName.charAt(0)}
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{teacher.fullName}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter truncate">{teacher.specialty}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {TIME_SLOTS.map(slot => {
                                            const session = sessions.find(s => 
                                                s.teacher?.id === teacher.id && 
                                                new Date(s.startTime).getHours() === parseInt(slot.start.split(':')[0])
                                            );

                                            return (
                                                <td key={`${teacher.id}-${slot.id}`} className="p-2 border-b border-l border-slate-100 dark:border-slate-800 relative group-hover:bg-slate-50/20 dark:group-hover:bg-slate-900/5 transition-colors">
                                                    {session ? (
                                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-lg shadow-sm animate-fade-in group/card relative overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                                                            <p className="text-[10px] font-black text-slate-800 dark:text-slate-100 truncate uppercase">{session.student?.fullName}</p>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className="text-[8px] font-bold text-slate-400 uppercase">{session.classroom?.name || 'Derslik'}</span>
                                                                <CheckCircle2 size={10} className="text-primary" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handlePlanSession(teacher, slot)}
                                                            className={`w-full h-10 rounded-lg border-2 border-dashed transition-all flex items-center justify-center
                                                                ${(selectedStudent && selectedRoom) 
                                                                    ? 'border-primary/20 hover:border-primary hover:bg-primary/5 text-primary/30 hover:text-primary' 
                                                                    : 'border-slate-100 dark:border-slate-800 cursor-not-allowed opacity-20 text-slate-200 dark:text-slate-700'}`}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar: Selection Panel */}
                <div className="w-full xl:w-72 space-y-4">
                    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                        <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-4">Planlama Paneli</h3>
                        
                        <div className="space-y-4">
                            {/* Step 1: Student */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">1. ÖĞRENCİ SEÇİMİ</label>
                                <select 
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                    value={selectedStudent?.id || ''}
                                    onChange={(e) => setSelectedStudent(students.find(s => s.id === parseInt(e.target.value)) || null)}
                                >
                                    <option value="">Öğrenci Seçiniz...</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                                </select>
                            </div>

                            {/* Step 2: Room */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">2. DERSLİK SEÇİMİ</label>
                                <select 
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                    value={selectedRoom?.id || ''}
                                    onChange={(e) => setSelectedRoom(classrooms.find(r => r.id === parseInt(e.target.value)) || null)}
                                >
                                    <option value="">Derslik Seçiniz...</option>
                                    {classrooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
                                </select>
                            </div>

                            <div className="pt-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <p className="text-[10px] text-primary font-black uppercase tracking-tighter mb-2">NASIL KULLANILIR?</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    Öğrenci ve derslik seçtikten sonra, tablodaki boş (+) alanlara tıklayarak ders ataması yapabilirsiniz.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 dark:bg-primary-950 p-6 rounded-2xl text-white shadow-xl">
                        <h4 className="font-black text-[10px] text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertCircle size={14} className="animate-pulse" />
                            MEB KURALLARI
                        </h4>
                        <ul className="space-y-3 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            <li className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                <span>DERS SÜRESİ: 40 DK</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                <span>TENEFFÜS: 20 DK</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                <span>GÜNLÜK MAX: 8 SAAT</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartScheduler;
