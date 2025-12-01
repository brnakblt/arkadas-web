'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileWord, faFileExcel, faFilePowerpoint, faCloudUploadAlt, faEdit, faDownload } from '@fortawesome/free-solid-svg-icons';

// Mock data for now - will replace with Strapi data later
const MOCK_DOCUMENTS = [
    { id: 1, name: 'Öğrenci Raporu.docx', type: 'word', size: '1.2 MB', date: '2024-11-28' },
    { id: 2, name: 'Bütçe Planı.xlsx', type: 'excel', size: '850 KB', date: '2024-11-25' },
    { id: 3, name: 'Eğitim Sunumu.pptx', type: 'powerpoint', size: '5.4 MB', date: '2024-11-20' },
];

export default function DocumentsPage() {
    const { data: session } = useSession();
    const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setIsUploading(true);

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            alert("Dosya başarıyla yüklendi!");
            // TODO: Refresh document list
            console.log("Uploaded:", data);
        } catch (error) {
            console.error(error);
            alert("Yükleme sırasında bir hata oluştu.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = async (doc: any) => {
        if (!session) {
            signIn('azure-ad');
            return;
        }

        // Use doc.url if available (from Strapi), otherwise fallback to mock logic or error
        // For mock data, we don't have a real URL, so we can't really test this without a real file.
        if (!doc.url) {
            alert("Bu dosya için geçerli bir URL bulunamadı (Mock Data). Lütfen yeni bir dosya yükleyin.");
            return;
        }

        try {
            const res = await fetch('/api/documents/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileUrl: doc.url,
                    fileName: doc.name
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Edit failed");
            }

            const { editUrl } = await res.json();
            // Open in new tab
            window.open(editUrl, '_blank');

        } catch (error) {
            console.error(error);
            alert("Düzenleme başlatılamadı. Azure oturumunuzun açık olduğundan emin olun.");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'word': return faFileWord;
            case 'excel': return faFileExcel;
            case 'powerpoint': return faFilePowerpoint;
            default: return faFileWord;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'word': return 'text-blue-600';
            case 'excel': return 'text-green-600';
            case 'powerpoint': return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Doküman Yönetimi</h1>

                <label className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary-dark transition-colors">
                    <FontAwesomeIcon icon={faCloudUploadAlt} />
                    <span>{isUploading ? 'Yükleniyor...' : 'Dosya Yükle'}</span>
                    <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
                </label>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Dosya Adı</th>
                            <th className="p-4 font-semibold text-gray-600">Boyut</th>
                            <th className="p-4 font-semibold text-gray-600">Tarih</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                    <FontAwesomeIcon icon={getIcon(doc.type)} className={`text-xl ${getColor(doc.type)}`} />
                                    <span className="font-medium text-gray-800">{doc.name}</span>
                                </td>
                                <td className="p-4 text-gray-500">{doc.size}</td>
                                <td className="p-4 text-gray-500">{doc.date}</td>
                                <td className="p-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEdit(doc)}
                                        className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faEdit} className="mr-1" /> Düzenle
                                    </button>
                                    <button className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">
                                        <FontAwesomeIcon icon={faDownload} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {documents.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        Henüz hiç doküman yüklenmemiş.
                    </div>
                )}
            </div>
        </div>
    );
}
