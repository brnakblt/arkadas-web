"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import LoginForm from "./auth/LoginForm";
import RegisterForm from "./auth/RegisterForm";
import ForgotPasswordForm from "./auth/ForgotPasswordForm";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthView = 'login' | 'register' | 'forgot-password';

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

    const handleRegisterSuccess = () => {
        setView('login');
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
                className={`relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                    }`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="font-display text-2xl font-bold text-neutral-dark mb-2">
                        {view === 'login' && "Hoş Geldiniz"}
                        {view === 'register' && "Aramıza Katılın"}
                        {view === 'forgot-password' && "Şifre Sıfırlama"}
                    </h2>
                    <p className="font-body text-gray-500 text-sm">
                        {view === 'login' && "Hesabınıza giriş yaparak devam edin"}
                        {view === 'register' && "Yeni bir hesap oluşturarak avantajlardan yararlanın"}
                        {view === 'forgot-password' && "E-posta adresinizi girerek şifrenizi sıfırlayın"}
                    </p>
                </div>

                {/* Tabs (Only show for login/register) */}
                {view !== 'forgot-password' && (
                    <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                        <button
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${view === 'login'
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                            onClick={() => setView('login')}
                        >
                            Giriş Yap
                        </button>
                        <button
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${view === 'register'
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                            onClick={() => setView('register')}
                        >
                            Kayıt Ol
                        </button>
                    </div>
                )}

                {/* Forms */}
                {view === 'login' && (
                    <LoginForm
                        onSuccess={handleLoginSuccess}
                        onForgotPassword={() => setView('forgot-password')}
                    />
                )}

                {view === 'register' && (
                    <RegisterForm
                        onSuccess={handleRegisterSuccess}
                    />
                )}

                {view === 'forgot-password' && (
                    <ForgotPasswordForm
                        onBackToLogin={() => setView('login')}
                    />
                )}

                {/* Footer */}
                {view !== 'forgot-password' && (
                    <div className="mt-8 text-center text-sm text-gray-500">
                        {view === 'login' ? (
                            <>
                                Hesabınız yok mu?{" "}
                                <button
                                    onClick={() => setView('register')}
                                    className="text-primary font-semibold hover:underline"
                                >
                                    Kayıt Olun
                                </button>
                            </>
                        ) : (
                            <>
                                Zaten hesabınız var mı?{" "}
                                <button
                                    onClick={() => setView('login')}
                                    className="text-primary font-semibold hover:underline"
                                >
                                    Giriş Yapın
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
