import { useState } from "react";
import { authService, LoginResponse, RegisterData } from "../services/authService";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const login = async (identifier: string, password: string): Promise<LoginResponse | null> => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await authService.login(identifier, password);
      // Save user and token to localStorage
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      if (response.jwt) {
        localStorage.setItem('jwt', response.jwt);
      }
      setSuccessMessage("Giriş başarılı! Yönlendiriliyorsunuz...");
      return response;
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Giriş yapılamadı.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<LoginResponse | null> => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await authService.register(data);
      setSuccessMessage("Kayıt başarılı! Giriş yapabilirsiniz.");
      return response;
    } catch (err: any) {
      console.error("Register error:", err);
      setError(err.message || "Kayıt olunamadı.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await authService.forgotPassword(email);
      setSuccessMessage("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
      return true;
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err.message || "Şifre sıfırlama e-postası gönderilemedi.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  return {
    isLoading,
    error,
    successMessage,
    login,
    register,
    forgotPassword,
    clearMessages,
    setError,
    setSuccessMessage
  };
};
