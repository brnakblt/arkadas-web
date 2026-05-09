"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Filter, MoreVertical, Loader2, Plus, X, UserPlus, Folder, MoreHorizontal, ChevronRight } from 'lucide-react';
import { studentService, Student } from '@/services/studentService';

const StudentList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
    const [newStudent, setNewStudent] = useState({ fullName: '', tcIdentity: '', diagnosis: '', status: 'ACTIVE' });

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await studentService.getStudents();
            setStudents(data);
        } catch (err) {
            console.error(err);
            setError("Öğrenci listesi yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchStudents();
    }, []);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log("Adding student:", newStudent);
            const mockNewStudent = {
                ...newStudent,
                id: Date.now().toString(),
                avatarUrl: '/images/avatar-placeholder.svg',
                ramReportEndDate: '-',
                age: 0
            } as any;
            setStudents(prev => [mockNewStudent, ...prev]);
            setShowAddModal(false);
            setNewStudent({ fullName: '', tcIdentity: '', diagnosis: '', status: 'ACTIVE' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDetails = (student: Student) => {
        setSelectedStudent(student);
        setShowDetailsSidebar(true);
    };

    const handleAction = (student: Student) => {
        alert(`${student.fullName} için işlemler menüsü açıldı.`);
    };

    const filteredStudents = students.filter(s =>
        s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.tcIdentity?.includes(searchTerm)
    );

    return (
        <div className="space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dijital Öğrenci Dosyaları</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Kurum kayıtlı öğrenci arşivi</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transform"
                >
                    <Plus size={20} />
                    Yeni Kayıt Oluştur
                </button>
            </div>

            <div className="p-5 flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="İsim veya TC No ile dosya ara..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 dark:bg-slate-800 dark:text-slate-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium bg-white dark:bg-slate-900 shadow-sm">
                    <Filter size={18} />
                    <span>Filtrele</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <Loader2 className="animate-spin text-primary mb-4" size={40} />
                    <p className="text-slate-400 font-medium">Arşiv taranıyor...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <p className="font-medium">{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pt-4">
                    {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                        <div 
                            key={student.id} 
                            className="group relative bg-[#f4e4bc] dark:bg-slate-900 rounded-tr-3xl rounded-br-xl rounded-bl-xl border-t-[20px] border-primary/10 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-visible mt-6"
                            onClick={() => handleDetails(student)}
                        >
                            {/* Folder Tab Shape */}
                            <div className="absolute -top-[36px] left-0 w-32 h-10 bg-[#f4e4bc] dark:bg-slate-900 rounded-t-2xl border-t border-l border-r border-black/5 dark:border-white/5 flex items-center px-4">
                                <div className="w-2 h-2 rounded-full bg-primary/40 mr-2"></div>
                                <span className="text-[10px] font-black text-slate-500/60 uppercase tracking-tighter">DOSYA #{student.id}</span>
                            </div>
                            
                            <div className="p-5 pt-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="relative w-16 h-16 shrink-0 shadow-lg rounded-xl overflow-hidden border-2 border-white dark:border-slate-700 transform -rotate-3 group-hover:rotate-0 transition-transform">
                                        <Image 
                                            src={student.avatarUrl || '/images/avatar-placeholder.svg'} 
                                            alt="" 
                                            fill
                                            className="object-cover" 
                                        />
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleAction(student); }}
                                        className="text-slate-400 hover:text-primary p-2 rounded-full hover:bg-black/5 transition-all"
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                <div className="pt-2">
                                    <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">{student.fullName}</h3>
                                    <p className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1">
                                        <Folder size={12} className="text-primary/40" />
                                        TC: {student.tcIdentity}
                                    </p>
                                </div>

                                <div className="space-y-2 bg-white/40 dark:bg-black/20 p-3 rounded-xl border border-black/5">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                                        <span>Tanı / Branş</span>
                                        <span className="text-primary">{student.diagnosis}</span>
                                    </div>
                                    <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary/40 w-full"></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase shadow-sm ${
                                        student.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                                    }`}>
                                        {student.status === 'ACTIVE' ? 'AKTİF KAYIT' : 'PASİF'}
                                    </span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDetails(student); }}
                                        className="text-xs font-black text-primary hover:underline flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg transition-all hover:bg-primary hover:text-white"
                                    >
                                        DETAYLAR <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Paper texture effect overlay */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] rounded-tr-3xl rounded-b-xl"></div>
                            
                            {/* Folder line detail */}
                            <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-black/5 dark:border-white/5 rounded-br-xl"></div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center text-slate-400 font-medium bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            Arşivde eşleşen dosya bulunamadı.
                        </div>
                    )}
                </div>
            )}

            {/* Details Sidebar */}
            {showDetailsSidebar && selectedStudent && (
                <div className="fixed inset-0 z-[110] flex justify-end bg-slate-900/40 backdrop-blur-sm transition-all" onClick={() => setShowDetailsSidebar(false)}>
                    <div 
                        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl animate-slide-in-right p-8 flex flex-col overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Öğrenci Detayları</h3>
                            <button onClick={() => setShowDetailsSidebar(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="relative w-32 h-32 mb-4 shadow-xl rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800">
                                <Image 
                                    src={selectedStudent.avatarUrl || '/images/avatar-placeholder.svg'} 
                                    alt="" 
                                    fill
                                    className="object-cover" 
                                />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 uppercase">{selectedStudent.fullName}</h4>
                            <p className="text-slate-400 font-mono text-sm">{selectedStudent.tcIdentity}</p>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tanı</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-200">{selectedStudent.diagnosis}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Durum</p>
                                    <span className={`text-xs font-bold ${selectedStudent.status === 'ACTIVE' ? 'text-green-600' : 'text-secondary'}`}>{selectedStudent.status}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">RAM Rapor Bitiş Tarihi</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{selectedStudent.ramReportEndDate || 'Belirtilmemiş'}</p>
                            </div>

                            <div className="space-y-4">
                                <h5 className="font-black text-xs text-slate-400 uppercase tracking-widest border-b dark:border-slate-800 pb-2">Eğitim Geçmişi</h5>
                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer group">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                                {i}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Bireysel Eğitim Seansı</p>
                                                <p className="text-[10px] text-slate-400">12.04.2024 • Ahmet Yılmaz</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex gap-3">
                            <button className="flex-1 bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/20 uppercase tracking-wider text-sm">
                                Dosyayı Yazdır
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh' }}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="bg-primary p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg flex items-center gap-2"><UserPlus size={20} /> Yeni Öğrenci Kaydı</h3>
                            <button onClick={() => setShowAddModal(false)} className="hover:bg-white/20 rounded-full p-1"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ad Soyad</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" 
                                    value={newStudent.fullName}
                                    onChange={e => setNewStudent({...newStudent, fullName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">TC Kimlik No</label>
                                <input 
                                    required
                                    type="text" 
                                    maxLength={11}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 font-mono" 
                                    value={newStudent.tcIdentity}
                                    onChange={e => setNewStudent({...newStudent, tcIdentity: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanı</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" 
                                    value={newStudent.diagnosis}
                                    onChange={e => setNewStudent({...newStudent, diagnosis: e.target.value})}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">İptal</button>
                                <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentList;
