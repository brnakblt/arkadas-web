"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import {
    Calendar, CheckCircle, XCircle, Clock, Star,
    BookOpen, User, Users, MoreVertical, Plus, ClipboardList, CheckSquare,
    TrendingUp, ChevronRight, X, UserPlus, Trash2
} from 'lucide-react';
import { MOCK_STAFF, MOCK_LEAVE_REQUESTS, MOCK_TRAININGS, MOCK_LESSON_PLANS, MOCK_TASKS } from './constants';
import { personnelService, Personnel } from '@/services/personnelService';

const PersonnelManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'planning' | 'tasks_leaves'>('planning');
    const [staffList, setStaffList] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [tasks, setTasks] = useState(MOCK_TASKS);
    const [newStaff, setNewStaff] = useState({ fullName: '', specialty: 'Özel Eğitim Öğretmeni', email: '', phone: '', status: 'Active' });
    const [newTask, setNewTask] = useState({ title: '', staffId: '', dueDate: '', priority: 'Medium', description: '' });

    const MEB_TITLES = [
        'Özel Eğitim Öğretmeni', 
        'Okul Öncesi Öğretmeni', 
        'Fizyoterapist', 
        'Dil ve Konuşma Terapisti', 
        'Psikolog', 
        'Sosyal Hizmet Uzmanı', 
        'Odyolog', 
        'Ergoterapist'
    ];

    const fetchPersonnel = async () => {
        try {
            setLoading(true);
            const data = await personnelService.getPersonnel();
            setStaffList(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchPersonnel();
    }, []);

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log("Adding staff:", newStaff);
            const mockStaff: Personnel = {
                id: Math.max(...staffList.map(s => s.id), 0) + 1,
                ...newStaff,
                joinDate: new Date().toLocaleDateString('tr-TR'),
                weeklyHours: 0,
                maxWeeklyHours: 40
            } as Personnel;
            
            setStaffList([...staffList, mockStaff]);
            setShowAddModal(false);
            setNewStaff({ fullName: '', specialty: 'Özel Eğitim Öğretmeni', email: '', phone: '', status: 'Active' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        const taskObj = {
            id: tasks.length + 1,
            ...newTask,
            status: 'Pending'
        };
        setTasks([taskObj as any, ...tasks]);
        setShowTaskModal(false);
        setNewTask({ title: '', staffId: '', dueDate: '', priority: 'Medium', description: '' });
    };

    const handleRemoveStaff = async (id: string | number) => {
        if (confirm("Bu personeli silmek istediğinize emin misiniz?")) {
            setStaffList(staffList.filter(s => s.id !== id));
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active': return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">Aktif</span>;
            case 'OnLeave': return <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full text-xs font-medium">İzinde</span>;
            case 'Terminated': return <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">Ayrıldı</span>;
            default: return null;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'High': return <span className="text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded text-xs font-bold border border-red-100 dark:border-red-900/30">Yüksek</span>;
            case 'Medium': return <span className="text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded text-xs font-medium border border-amber-100 dark:border-amber-900/30">Orta</span>;
            case 'Low': return <span className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded text-xs font-medium border border-blue-100 dark:border-blue-900/30">Düşük</span>;
            default: return null;
        }
    };

    // --- TAB 1: KADRO & DERS PLANLAMA ---
    const renderPlanning = () => (
        <div className="space-y-6">
            {/* Staff List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Users size={18} className="text-slate-500" />
                        Personel Kadrosu
                    </h3>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-1 transition-all active:scale-95"
                    >
                        <Plus size={16} /> Yeni Personel
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Personel</th>
                                <th className="px-6 py-4">Branş</th>
                                <th className="px-6 py-4">Haftalık Yük</th>
                                <th className="px-6 py-4">İletişim</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-4">Yükleniyor...</td></tr>
                            ) : staffList.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-4">Personel bulunamadı.</td></tr>
                            ) : staffList.map((staff) => {
                                const maxHours = staff.maxWeeklyHours || 40;
                                const usagePercent = Math.min((staff.weeklyHours / maxHours) * 100, 100);
                                const isOverload = staff.weeklyHours > maxHours;

                                return (
                                    <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {staff.avatarUrl ? (
                                                    <Image src={staff.avatarUrl} alt={staff.fullName} width={40} height={40} className="rounded-full object-cover bg-slate-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 flex items-center justify-center font-bold">
                                                        {staff.fullName.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{staff.fullName}</p>
                                                    <p className="text-xs text-slate-500">Giriş: {staff.joinDate}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{staff.specialty}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5 w-32">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-500">Doluluk</span>
                                                    <span className={`font-semibold ${isOverload ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {staff.weeklyHours}/{maxHours} Sa
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${isOverload ? 'bg-red-500' : 'bg-primary-500'}`}
                                                        style={{ width: `${usagePercent}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-900 dark:text-slate-200">{staff.email}</p>
                                            <p className="text-xs text-slate-500">{staff.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(staff.status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleRemoveStaff(staff.id)}
                                                    className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Lesson Plans */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <ClipboardList className="text-primary-500" size={20} />
                            Haftalık Ders Planları
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Öğretmenlerin sisteme yüklediği haftalık BEP planları.</p>
                    </div>
                    <button className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">Tümünü Gör</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_LESSON_PLANS.map(plan => {
                        const staff = MOCK_STAFF.find(s => s.id === plan.staffId);
                        const isApproved = plan.status === 'Approved';
                        return (
                            <div key={plan.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md transition-all bg-white dark:bg-slate-900 relative overflow-hidden group">
                                {isApproved && <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full z-0"></div>}
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 overflow-hidden relative">
                                            {staff?.avatarUrl ? (
                                                <Image src={staff.avatarUrl} alt="" width={32} height={32} className="object-cover" />
                                            ) : (
                                                staff?.fullName.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{staff?.fullName}</p>
                                            <p className="text-xs text-slate-500">Hafta {plan.week}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${isApproved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                        {plan.status === 'Approved' ? 'Onaylandı' : 'Beklemede'}
                                    </span>
                                </div>

                                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{plan.subject}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{plan.description}</p>

                                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                                    <span className="text-xs text-slate-400">{plan.submissionDate}</span>
                                    <button className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:text-primary-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        İncele <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );

    // --- TAB 2: İZİN & GÖREVLENDİRME ---
    const renderTasksAndLeaves = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Assignments */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <CheckSquare className="text-lila-500" size={20} />
                            Görevlendirmeler
                        </h3>
                        <button 
                            onClick={() => setShowTaskModal(true)}
                            className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-white transition-all active:scale-95"
                        >
                            + Görev Ata
                        </button>
                    </div>

                    <div className="space-y-3">
                        {tasks.map(task => {
                            const staff = staffList.find(s => String(s.id) === String(task.staffId)) || MOCK_STAFF.find(s => s.id === task.staffId);
                            return (
                                <div key={task.id} className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary-200 dark:hover:border-primary-800 transition-colors group">
                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${task.status === 'Completed' ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-700 group-hover:border-primary-400'
                                        }`}>
                                        {task.status === 'Completed' && <CheckCircle size={12} className="text-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`font-semibold text-slate-800 dark:text-slate-100 ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                                                {task.title}
                                            </h4>
                                            {getPriorityBadge(task.priority)}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-2">{task.description}</p>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                <User size={12} /> {staff?.fullName || 'Bilinmiyor'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} /> Son: {task.dueDate}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Leave Requests */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <Clock className="text-amber-500" size={20} />
                        İzin Talepleri
                    </h3>
                    <div className="space-y-4">
                        {MOCK_LEAVE_REQUESTS.filter(r => r.status === 'Pending').map(req => {
                            const staff = MOCK_STAFF.find(s => s.id === req.staffId);
                            return (
                                <div key={req.id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-amber-50/30 dark:bg-amber-900/10">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-800 dark:text-slate-100">{staff?.fullName}</span>
                                        </div>
                                        <span className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">{req.type}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 italic">&quot;{req.description}&quot;</p>
                                    <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-slate-800 pt-2">
                                        <span className="text-xs font-mono text-slate-500">{req.startDate}</span>
                                        <div className="flex gap-2">
                                            <button className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700"><XCircle size={18} /></button>
                                            <button className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700"><CheckCircle size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Personel Yönetimi</h2>
                    <p className="text-slate-500 dark:text-slate-400">İnsan kaynakları, eğitim planlama ve MEB standartları</p>
                </div>
                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button
                        onClick={() => setActiveTab('planning')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'planning' ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        Kadro & Planlama
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks_leaves')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'tasks_leaves' ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        İzin & Görevlendirme
                    </button>
                </div>
            </div>

            <div className="animate-fade-in min-h-[500px]">
                {activeTab === 'planning' && renderPlanning()}
                {activeTab === 'tasks_leaves' && renderTasksAndLeaves()}
            </div>

            {/* Modals */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh' }}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="bg-primary p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg flex items-center gap-2"><UserPlus size={20} /> Yeni Personel Ekle</h3>
                            <button onClick={() => setShowAddModal(false)} className="hover:bg-white/20 rounded-full p-1"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAddStaff} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ad Soyad</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" 
                                    value={newStaff.fullName}
                                    onChange={e => setNewStaff({...newStaff, fullName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Branş / Uzmanlık (MEB)</label>
                                <select 
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" 
                                    value={newStaff.specialty}
                                    onChange={e => setNewStaff({...newStaff, specialty: e.target.value})}
                                >
                                    {MEB_TITLES.map(title => <option key={title} value={title}>{title}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-posta</label>
                                    <input 
                                        type="email" 
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" 
                                        value={newStaff.email}
                                        onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefon</label>
                                    <input 
                                        type="tel" 
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" 
                                        value={newStaff.phone}
                                        onChange={e => setNewStaff({...newStaff, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">İptal</button>
                                <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showTaskModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh' }}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg flex items-center gap-2"><CheckSquare size={20} /> Yeni Görev Tanımla</h3>
                            <button onClick={() => setShowTaskModal(false)} className="hover:bg-white/20 rounded-full p-1"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAddTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Görev Başlığı</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" 
                                    placeholder="Örn: BEP Raporu Hazırlama" 
                                    value={newTask.title}
                                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Personel Seçin</label>
                                <select 
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                                    value={newTask.staffId}
                                    onChange={e => setNewTask({...newTask, staffId: e.target.value})}
                                >
                                    <option value="">Seçiniz...</option>
                                    {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Son Tarih</label>
                                    <input 
                                        required
                                        type="date" 
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" 
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Öncelik</label>
                                    <select 
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({...newTask, priority: e.target.value})}
                                    >
                                        <option value="High">Yüksek</option>
                                        <option value="Medium">Orta</option>
                                        <option value="Low">Düşük</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Açıklama</label>
                                <textarea 
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                                    rows={3}
                                    value={newTask.description}
                                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">İptal</button>
                                <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold hover:bg-slate-800 transition-all">Görevlendir</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonnelManagement;
