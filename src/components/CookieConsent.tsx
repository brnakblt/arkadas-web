"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite, faTimes } from '@fortawesome/free-solid-svg-icons';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const hasConsented = localStorage.getItem('cookieConsent');
        if (!hasConsented) {
            // Show banner after a short delay for better UX
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
            <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-up">
                <div className="flex items-start md:items-center gap-4 flex-1">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary hidden md:block">
                        <FontAwesomeIcon icon={faCookieBite} className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-dark mb-1">Çerez Politikası</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Sizlere daha iyi hizmet sunabilmek, site trafiğini analiz etmek ve deneyiminizi kişiselleştirmek için sitemizde çerezlerden faydalanıyoruz.
                            Sitemizi kullanmaya devam ederek çerez kullanımını kabul etmiş olursunuz.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 whitespace-nowrap"
                    >
                        Kabul Et
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="md:hidden p-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Kapat"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
