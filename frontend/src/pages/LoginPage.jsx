import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingScreenVisible, setLoadingScreenVisible] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoadingScreenVisible(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    if (!validateEmail(email)) {
      setErrorMessage("Por favor, insira um email válido.");
      setLoading(false);
      return;
    }
    try {
      const { token, role } = await login(email, password);
      if (["corretor", "correspondente", "Administrador"].includes(role)) {
        localStorage.setItem("authToken", token);
        if (rememberMe) localStorage.setItem("rememberedEmail", email);
        else localStorage.removeItem("rememberedEmail");
      } else {
        setErrorMessage("Você não tem permissão para acessar o sistema.");
      }
    } catch {
      setErrorMessage("Falha no login. Verifique suas credenciais.");
    }
    setLoading(false);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (loadingScreenVisible) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-400 border-opacity-70"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-gray-900 px-4">
      <div className="w-full max-w-md bg-blue-950/80 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-800/40 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-900/30 border border-blue-700/40 rounded-full p-4 mb-4">
            <svg
              className="w-10 h-10 text-blue-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.21 0-4 1.343-4 3v2h8v-2c0-1.657-1.79-3-4-3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-blue-300 tracking-wide mb-1">
            Bem-vindo
          </h1>
          <p className="text-blue-200 text-center text-sm">
            Acesse sua conta para continuar
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-blue-200 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-blue-900/60 border border-blue-800/40 text-blue-100 focus:outline-none focus:border-blue-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-blue-200 mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 rounded-lg bg-blue-900/60 border border-blue-800/40 text-blue-100 focus:outline-none focus:border-blue-400 transition pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-2 text-blue-400 hover:text-blue-300 transition"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.062-4.675A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.21-2.21A9.956 9.956 0 0122 12c0 5.523-4.477 10-10 10S2 17.523 2 12c0-1.657.336-3.234.938-4.675"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center text-blue-200 text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-blue-400 mr-2"
              />
              Lembrar-me
            </label>
            <a
              href="/forgot-password"
              className="text-blue-400 text-xs hover:underline transition"
            >
              Esqueceu a senha?
            </a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-400 transition disabled:bg-gray-500 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? "Autenticando..." : "Entrar"}
          </button>
        </form>
        {errorMessage && (
          <div className="mt-6 bg-red-900/80 text-white text-center rounded-lg py-2 px-4 animate-fade-in">
            {errorMessage}
          </div>
        )}
        <div className="mt-8 text-center text-xs text-blue-300">
          © 2025 • Sistema de Gestão Imobiliária
        </div>
      </div>
    </div>
  );
};

export default LoginPage;