import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faLock, faEye, faEyeSlash, faCheck, faCircle } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";

interface RegisterFormProps {
    onSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
    const { register, isLoading, error, successMessage, setError } = useAuth();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
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
        const { password, confirmPassword } = formData;
        setPasswordErrors({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            match: password === confirmPassword && password !== ''
        });
    }, [formData.password, formData.confirmPassword]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(""); // Clear global error on change
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { length, uppercase, number, special, match } = passwordErrors;

        if (!length || !uppercase || !number || !special) {
            setError("Şifreniz güvenlik kriterlerini karşılamıyor.");
            return;
        }
        if (!match) {
            setError("Şifreler eşleşmiyor.");
            return;
        }
        if (/^\d/.test(formData.username)) {
            setError("Kullanıcı adı rakam ile başlayamaz.");
            return;
        }

        const response = await register({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            userType: 'parent'
        });

        if (response) {
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }
    };

    return (
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
                {isPasswordTouched && (
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

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-primary/25 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
            >
                {isLoading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
            </button>
        </form>
    );
};

export default RegisterForm;
