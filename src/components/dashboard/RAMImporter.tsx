"use client";

import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertTriangle, Loader2, Save, FileCheck, Search, Globe } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { studentService } from '@/services/studentService';

interface RAMData {
    fullName: string;
    tcIdentity: string;
    diagnosis: string;
    category: string;
    endDate: string;
    targets: string[];
}

const RAMImporter: React.FC = () => {
    const [isParsing, setIsParsing] = useState(false);
    const [tckn, setTckn] = useState('');
    const [extractedData, setExtractedData] = useState<RAMData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'reviewed' | 'saved'>('idle');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setError("Lütfen geçerli bir PDF dosyası yükleyin.");
            return;
        }
        setError(null);
        setIsParsing(true);
        setStatus('parsing');
        try {
            const result = await aiService.parseRamReport(file);
            if (result.success) {
                setExtractedData(result.data);
                setStatus('reviewed');
            } else {
                throw new Error(result.error || "Parsing failed");
            }
        } catch (err: any) {
            setError(err.message || "Rapor işlenirken bir hata oluştu.");
            setStatus('idle');
        } finally {
            setIsParsing(false);
        }
    };

    const handleMebbisSync = async () => {
        if (tckn.length !== 11) {
            setError("Lütfen 11 haneli geçerli bir TC Kimlik No girin.");
            return;
        }
        setError(null);
        setIsParsing(true);
        setStatus('parsing');
        try {
            const result = await studentService.syncFromMebbis(tckn);
            if (result.success) {
                setExtractedData(result.data);
                setStatus('reviewed');
            }
        } catch (err: any) {
            setError(err.message);
            setStatus('idle');
        } finally {
            setIsParsing(false);
        }
    };

    const handleSave = async () => {
        if (!extractedData) return;
        setIsParsing(true);
        try {
            const student = await studentService.createStudent({
                fullName: extractedData.fullName,
                tcIdentity: extractedData.tcIdentity,
                status: 'ACTIVE',
                ramReportEndDate: extractedData.endDate
            });
            await studentService.syncRamReport(student.documentId, extractedData);
            setStatus('saved');
            alert("Öğrenci ve RAM raporu başarıyla sisteme aktarıldı.");
        } catch (err: any) {
            alert(`Hata: ${err.message}`);
        } finally {
            setIsParsing(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <FileCheck className="text-emerald-500" size={28} />
                        Öğrenci & RAM Aktarımı
                    </h2>
                    <p className="text-slate-500">MEBBİS üzerinden otomatik veya PDF yükleyerek veri aktarımı yapın.</p>
                </div>
            </header>

            {!extractedData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* MEBBIS Sync Card */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                            <Globe size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-700">MEBBİS Otomatik Aktarım</h3>
                            <p className="text-slate-400 text-sm">Öğrenci TCKN girerek resmi verileri anlık çekin.</p>
                        </div>
                        <div className="w-full max-w-xs space-y-3">
                            <input 
                                type="text" 
                                maxLength={11}
                                value={tckn}
                                onChange={(e) => setTckn(e.target.value)}
                                placeholder="TC Kimlik No"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <button 
                                onClick={handleMebbisSync}
                                disabled={isParsing}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isParsing ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                                MEBBİS'ten Getir
                            </button>
                        </div>
                    </div>

                    {/* PDF Upload Card */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                            <Upload size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-700">PDF Rapor Yükle</h3>
                            <p className="text-slate-400 text-sm">Elinizdeki RAM raporu PDF'ini yapay zeka ile işleyin.</p>
                        </div>
                        <input 
                            type="file" 
                            id="ram-upload" 
                            className="hidden" 
                            accept=".pdf"
                            onChange={handleFileUpload}
                            disabled={isParsing}
                        />
                        <label 
                            htmlFor="ram-upload" 
                            className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 cursor-pointer hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Dosya Seç
                        </label>
                    </div>
                </div>
            )}

            {error && !extractedData && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 font-medium animate-shake">
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            {extractedData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tespit Edilen Öğrenci</h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-400">Ad Soyad</p>
                                    <p className="font-bold text-slate-800 text-lg">{extractedData.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">TC Kimlik No</p>
                                    <p className="font-mono text-slate-600 font-medium">{extractedData.tcIdentity}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Tanı / Kategori</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                            {extractedData.diagnosis}
                                        </span>
                                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                            {extractedData.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-50">
                                    <p className="text-xs text-slate-400">Rapor Bitiş Tarihi</p>
                                    <p className={`font-bold ${new Date(extractedData.endDate) < new Date() ? 'text-red-500' : 'text-slate-700'}`}>
                                        {new Date(extractedData.endDate).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
                            <h4 className="font-bold mb-2 flex items-center gap-2">
                                <CheckCircle size={18} className="text-emerald-400" />
                                MEBBİS Doğrulandı
                            </h4>
                            <p className="text-xs text-slate-400 mb-4">Veriler resmi kayıtlarla uyumlu. Sisteme aktarabilirsiniz.</p>
                            <button 
                                onClick={handleSave}
                                disabled={status === 'saved' || isParsing}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:bg-slate-700"
                            >
                                {isParsing ? <Loader2 className="animate-spin" size={20} /> : (status === 'saved' ? <CheckCircle size={20} /> : <Save size={20} />)}
                                {isParsing ? 'İşleniyor...' : (status === 'saved' ? 'Aktarıldı' : 'Sisteme Aktar')}
                            </button>
                            {status === 'reviewed' && (
                                <button onClick={() => {setExtractedData(null); setStatus('idle');}} className="w-full mt-2 text-xs text-slate-500 hover:text-white transition-colors">Vazgeç</button>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="text-emerald-500" size={20} />
                                    Eğitsel Hedefler (BEP)
                                </h4>
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">
                                    {extractedData.targets.length} Hedef Bulundu
                                </span>
                            </div>
                            <div className="p-0 max-h-[60vh] overflow-y-auto">
                                {extractedData.targets.map((target, idx) => (
                                    <div key={idx} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex gap-4 items-start">
                                        <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                            {idx + 1}
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed">{target}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RAMImporter;
