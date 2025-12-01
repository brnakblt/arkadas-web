"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faTimes, faEnvelope, faLock, faUser, faGraduationCap, faUserFriends, faArrowLeft, faEye, faEyeSlash, faCheck, faCircle } from "@fortawesome/free-solid-svg-icons";
import { authService } from "../services/authService";
import { useRouter } from "next/navigation";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthView = 'login' | 'register' | 'forgot-password';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const [view, setView] = useState<AuthView>('login');

    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        identifier: "" // for login (email or username)
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false,
        match: false
    });
    const [isPasswordTouched, setIsPasswordTouched] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = "hidden";
            // Reset state on open
            setError("");
            setSuccessMessage("");
            setFormData({ username: "", email: "", password: "", confirmPassword: "", identifier: "" });
            setIsPasswordTouched(false);
            setPasswordErrors({
                length: false,
                uppercase: false,
                number: false,
                special: false,
                match: false
            });
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = "unset";
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    useEffect(() => {
        if (view === 'register') {
            const { password, confirmPassword } = formData;
            setPasswordErrors({
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
                match: password === confirmPassword && password !== ''
            });
        }
    }, [formData.password, formData.confirmPassword, view]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true);

        if (view === 'register') {
            const { length, uppercase, number, special, match } = passwordErrors;
            if (!length || !uppercase || !number || !special) {
                setError("Şifreniz güvenlik kriterlerini karşılamıyor.");
                setIsLoading(false);
                return;
            }
            if (!match) {
                setError("Şifreler eşleşmiyor.");
                setIsLoading(false);
                return;
            }
            if (/^\d/.test(formData.username)) {
                setError("Kullanıcı adı rakam ile başlayamaz.");
                setIsLoading(false);
                return;
            }
        }

        try {
            if (view === 'login') {
                const response = await authService.login(formData.identifier, formData.password);
                console.log("Login success:", response);

                // Save user and token to localStorage
                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));
                }
                if (response.jwt) {
                    localStorage.setItem('jwt', response.jwt);
                }

                setSuccessMessage("Giriş başarılı! Yönlendiriliyorsunuz...");
                setTimeout(() => {
                    onClose();
                    router.push("/dashboard");
                }, 1500);
            } else if (view === 'register') {
                const response = await authService.register({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    userType: 'parent'
                });
                console.log("Register success:", response);
                setSuccessMessage("Kayıt başarılı! Giriş yapabilirsiniz.");
                setTimeout(() => {
                    setView('login');
                    setSuccessMessage("");
                }, 2000);
            } else if (view === 'forgot-password') {
                await authService.forgotPassword(formData.email);
                setSuccessMessage("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
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



                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Error/Success Messages */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">
                            {successMessage}
                        </div>
                    )}

                    {view === 'register' && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faUser} className="text-gray-400 w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Kullanıcı Adı"
                                required
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body text-neutral-dark placeholder-gray-400"
                            />
                        </div>
                    )}

                    {(view === 'register' || view === 'forgot-password') && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="E-posta Adresi"
                                required
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body text-neutral-dark placeholder-gray-400"
                            />
                        </div>
                    )}

                    {view === 'login' && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faUser} className="text-gray-400 w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                name="identifier"
                                value={formData.identifier}
                                onChange={handleChange}
                                placeholder="E-posta veya Kullanıcı Adı"
                                required
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body text-neutral-dark placeholder-gray-400"
                            />
                        </div>
                    )}

                    {/* Password Field */}
                    {view !== 'forgot-password' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Şifre</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none"
                                    value={formData.password}
                                    onChange={(e) => {
                                        setFormData({ ...formData, password: e.target.value });
                                        setIsPasswordTouched(true);
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>

                            {/* Password Requirements Checklist */}
                            {view === 'register' && isPasswordTouched && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                                    <p className="font-medium text-gray-600 mb-2">Şifre Gereksinimleri:</p>
                                    <div className={`flex items-center space-x-2 ${passwordErrors.length ? 'text-green-600' : 'text-gray-500'}`}>
                                        <FontAwesomeIcon icon={passwordErrors.length ? faCheck : faCircle} className="w-3 h-3" />
                                        <span>En az 8 karakter</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${passwordErrors.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                                        <FontAwesomeIcon icon={passwordErrors.uppercase ? faCheck : faCircle} className="w-3 h-3" />
                                        <span>En az 1 büyük harf</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${passwordErrors.number ? 'text-green-600' : 'text-gray-500'}`}>
                                        <FontAwesomeIcon icon={passwordErrors.number ? faCheck : faCircle} className="w-3 h-3" />
                                        <span>En az 1 rakam</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${passwordErrors.special ? 'text-green-600' : 'text-gray-500'}`}>
                                        <FontAwesomeIcon icon={passwordErrors.special ? faCheck : faCircle} className="w-3 h-3" />
                                        <span>En az 1 özel karakter (!@#$...)</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Confirm Password Field */}
                    {view === 'register' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Şifre Tekrar</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    className={`w-full pl-11 pr-12 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none ${formData.confirmPassword && !passwordErrors.match ? 'border-red-300' : 'border-gray-200'
                                        }`}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                            {formData.confirmPassword && !passwordErrors.match && (
                                <p className="text-xs text-red-500 ml-1">Şifreler eşleşmiyor</p>
                            )}
                        </div>
                    )}

                    {view === 'login' && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setView('forgot-password')}
                                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                Şifremi Unuttum?
                            </button>
                        </div>
                    )}

                    {view === 'forgot-password' && (
                        <div className="flex justify-start">
                            <button
                                type="button"
                                onClick={() => setView('login')}
                                className="flex items-center text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3 mr-2" />
                                Giriş Ekranına Dön
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-primary/25 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                    >
                        {isLoading ? "İşlem Yapılıyor..." : (
                            view === 'login' ? "Giriş Yap" :
                                view === 'register' ? "Kayıt Ol" : "Şifre Sıfırla"
                        )}
                    </button>
                </form>



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
