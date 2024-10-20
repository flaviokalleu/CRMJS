import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Snackbar,
} from "@mui/material";
import {
  Lock,
  MailOutline,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import LoadingScreen from "./LoadingScreen";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingScreenVisible, setLoadingScreenVisible] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingScreenVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); // Reset error message

    if (!validateEmail(email)) {
      setErrorMessage("Por favor, insira um email válido.");
      setLoading(false);
      return;
    }

    try {
      const { token, role } = await login(email, password);

      if (["corretor", "correspondente", "Administrador"].includes(role)) {
        localStorage.setItem("authToken", token);
      } else {
        setErrorMessage("Você não tem permissão para acessar o sistema.");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErrorMessage("Falha no login. Verifique suas credenciais.");
    }

    setLoading(false);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex para validação de email
    return re.test(String(email).toLowerCase());
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleCloseSnackbar = () => {
    setErrorMessage("");
  };

  if (loadingScreenVisible) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-10 bg-gray-800 rounded-lg shadow-lg"
      >
        <Typography
          variant="h4"
          className="text-white font-bold mb-8 text-center"
        >
          Entrar
        </Typography>

        <form onSubmit={handleSubmit} className="space-y-8">
          <TextField
            variant="outlined"
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutline style={{ color: "#9ca3af" }} />
                </InputAdornment>
              ),
              style: {
                backgroundColor: "#2d2d2d",
                color: "#ffffff",
                borderRadius: "8px",
              },
            }}
            InputLabelProps={{
              style: { color: "#9ca3af" },
            }}
          />
          <TextField
            variant="outlined"
            label="Senha"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock style={{ color: "#9ca3af" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {showPassword ? (
                    <Visibility
                      style={{ color: "#9ca3af", cursor: "pointer" }}
                      onClick={togglePasswordVisibility}
                    />
                  ) : (
                    <VisibilityOff
                      style={{ color: "#9ca3af", cursor: "pointer" }}
                      onClick={togglePasswordVisibility}
                    />
                  )}
                </InputAdornment>
              ),
              style: {
                backgroundColor: "#2d2d2d",
                color: "#ffffff",
                borderRadius: "8px",
              },
            }}
            InputLabelProps={{
              style: { color: "#9ca3af" },
            }}
          />
          <FormControlLabel
            control={<Checkbox style={{ color: "#9ca3af" }} />}
            label={<span className="text-gray-400">Lembrar-me</span>}
          />
          <Button
            type="submit"
            variant="contained"
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Entrar"}
          </Button>
        </form>

        {/* Snackbar para mensagens de erro */}
        {errorMessage && (
          <Snackbar
            open={Boolean(errorMessage)}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            message={errorMessage}
          />
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;
