"use client";

import React, { useState } from 'react';
import { X, Sparkles, Loader2, Download, Printer, Wand2 } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { Student } from '@/services/studentService';

interface MaterialGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
}

const MaterialGeneratorModal: React.FC<MaterialGeneratorModalProps> = ({ isOpen, onClose, student }) => {
    const [goal, setGoal] = useState('Ince motor becerileri geliştirme');
    const [theme, setTheme] = useState('Hayvanlar');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await aiService.generateTemplate({ goal, theme, difficulty });
            if (result.success) {
                setGeneratedSvg(result.svg);
            }
        } catch (error) {
            console.error("Material Generation Error:", error);
            alert("Materyal oluşturulamadı. Lütfen tekrar deneyin.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!generatedSvg) return;
        const blob = new Blob([generatedSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `arkadas-materyal-${student.fullName.replace(/\s+/g, '-').toLowerCase()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[80vh]">
                
                {/* Sidebar / Controls */}
                <div className="w-full md:w-80 bg-slate-50 p-6 border-r border-slate-100 flex flex-col gap-6">
                    <div className="flex justify-between items-center md:hidden">
                        <h3 className="font-bold text-slate-800">Materyal Üretici</h3>
                        <button onClick={onClose}><X size={24} /></button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Öğrenci</label>
                        <p className="font-bold text-slate-700">{student.fullName}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Eğitsel Hedef</label>
                        <select 
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                            <option value="Ince motor becerileri">Ince Motor Becerileri</option>
                            <option value="Görsel algı çalışması">Görsel Algı Çalışması</option>
                            <option value="Çizgi çalışması">Çizgi Çalışması</option>
                            <option value="Harf farkındalığı">Harf Farkındalığı</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tema</label>
                        <input 
                            type="text" 
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            placeholder="Örn: Kediler, Arabalar..."
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Zorluk</label>
                        <div className="flex gap-2">
                            {(['easy', 'medium', 'hard'] as const).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                        difficulty === level 
                                        ? 'bg-emerald-500 text-white shadow-md' 
                                        : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-300'
                                    }`}
                                >
                                    {level === 'easy' ? 'Kolay' : level === 'medium' ? 'Orta' : 'Zor'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="mt-auto w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                        {isGenerating ? 'Üretiliyor...' : 'Materyal Üret'}
                    </button>
                </div>

                {/* Preview Area */}
                <div className="flex-1 flex flex-col bg-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all hidden md:block z-10"
                    >
                        <X size={24} />
                    </button>

                    <div className="p-6 border-b border-slate-50 flex items-center gap-2">
                        <Sparkles className="text-emerald-500" size={20} />
                        <h3 className="font-bold text-slate-800">Önizleme</h3>
                    </div>

                    <div className="flex-1 overflow-auto p-12 flex items-center justify-center bg-slate-50/30">
                        {generatedSvg ? (
                            <div 
                                className="bg-white shadow-2xl p-8 rounded-lg w-full max-w-lg aspect-[1/1.4] border border-slate-100 flex items-center justify-center"
                                dangerouslySetInnerHTML={{ __html: generatedSvg }}
                            />
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                    <Sparkles size={40} />
                                </div>
                                <p className="text-slate-400 text-sm max-w-[200px]">
                                    Henüz materyal üretilmedi. Ayarları yapıp "Materyal Üret" butonuna basın.
                                </p>
                            </div>
                        )}
                    </div>

                    {generatedSvg && (
                        <div className="p-6 border-t border-slate-100 flex gap-4 justify-end bg-slate-50/50">
                            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg transition-all">
                                <Printer size={18} />
                                Yazdır
                            </button>
                            <button 
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white font-bold text-sm hover:bg-slate-900 rounded-lg transition-all shadow-lg shadow-slate-200"
                            >
                                <Download size={18} />
                                SVG İndir
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaterialGeneratorModal;
