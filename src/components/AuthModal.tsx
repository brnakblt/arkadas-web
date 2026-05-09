"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import LoginForm from "./auth/LoginForm";
import ForgotPasswordForm from "./auth/ForgotPasswordForm";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthView = 'login' | 'forgot-password';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const [view, setView] = useState<AuthView>('login');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = "hidden";
            // Reset view to login on open
            setView('login');
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = "unset";
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleLoginSuccess = () => {
        onClose();
        router.push("/dashboard");
    };

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
        >
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative bg-white dark:bg-surface rounded-3xl w-full max-w-md p-8 shadow-2xl transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                    }`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="font-display text-2xl font-bold text-neutral-dark dark:text-neutral-100 mb-2 leading-normal pb-1">
                        {view === 'login' && "Hoş Geldiniz"}
                        {view === 'forgot-password' && "Şifre Sıfırlama"}
                    </h2>
                    <p className="font-body text-gray-500 dark:text-gray-400 text-sm">
                        {view === 'login' && "Hesabınıza giriş yaparak devam edin"}
                        {view === 'forgot-password' && "E-posta adresinizi girerek şifrenizi sıfırlayın"}
                    </p>
                </div>

                {/* SSO Login */}
                {view === 'login' && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-body font-medium shadow-lg shadow-primary/20"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                <circle cx="12" cy="12" r="5" />
                            </svg>
                            Arkadaş Hesabı ile Giriş Yap
                        </button>
                        <div className="relative flex items-center justify-center my-6">
                            <span className="absolute bg-white dark:bg-surface px-4 text-xs text-gray-400 uppercase tracking-widest font-body">veya</span>
                            <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                        </div>
                    </div>
                )}

                {/* Forms */}
                {view === 'login' && (
                    <LoginForm
                        onSuccess={handleLoginSuccess}
                        onForgotPassword={() => setView('forgot-password')}
                    />
                )}

                {view === 'forgot-password' && (
                    <ForgotPasswordForm
                        onBackToLogin={() => setView('login')}
                    />
                )}
            </div>
        </div>
    );
};

export default AuthModal;

