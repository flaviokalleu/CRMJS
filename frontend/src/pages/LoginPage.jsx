import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Typography,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  Box,
  Container,
  Paper,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Lock,
  Email,
  Visibility,
  VisibilityOff,
  HelpOutline,
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
  const [rememberMe, setRememberMe] = useState(false);
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
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
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
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
        padding: 3,
      }}
    >
      <Container maxWidth="sm" sx={{ padding: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Paper
            elevation={10}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              background: "#0a0a0a",
              border: "1px solid rgba(255, 215, 0, 0.3)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 215, 0, 0.2)",
            }}
          >
            {/* Logo e cabeçalho */}
            <Box
              sx={{
                padding: 5,
                paddingBottom: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #FFD700",
                  marginBottom: 3,
                }}
              >
                <Lock sx={{ color: "#FFD700", fontSize: 40 }} />
              </Box>

              <Typography
                variant="h4"
                component="h1"
                sx={{
                  color: "#FFD700",
                  fontWeight: 700,
                  marginBottom: 1,
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: 1,
                }}
              >
                BEM-VINDO
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#a0a0a0",
                  marginBottom: 2,
                  textAlign: "center",
                  maxWidth: "80%",
                }}
              >
                Faça login para acessar sua conta
              </Typography>

              <Divider
                sx={{
                  width: "40%",
                  margin: "10px auto",
                  backgroundColor: "rgba(255, 215, 0, 0.3)",
                }}
              />
            </Box>

            {/* Formulário */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                padding: 5,
                paddingTop: 2,
              }}
            >
              <TextField
                variant="outlined"
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#FFD700" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  sx: { color: "rgba(255, 215, 0, 0.7)" },
                }}
                sx={{
                  marginBottom: 3,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(255, 215, 0, 0.3)",
                      borderRadius: 2,
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 215, 0, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#FFD700",
                    },
                    color: "#ffffff",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                  },
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
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#FFD700" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        sx={{ color: "#FFD700" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  sx: { color: "rgba(255, 215, 0, 0.7)" },
                }}
                sx={{
                  marginBottom: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(255, 215, 0, 0.3)",
                      borderRadius: 2,
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 215, 0, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#FFD700",
                    },
                    color: "#ffffff",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 3,
                  marginTop: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: "rgba(255, 215, 0, 0.5)",
                        "&.Mui-checked": { color: "#FFD700" },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: "#a0a0a0", fontSize: 14 }}>
                      Lembrar-me
                    </Typography>
                  }
                />

                <Typography
                  variant="body2"
                  component="a"
                  href="/forgot-password"
                  sx={{
                    color: "#FFD700",
                    textDecoration: "none",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  <HelpOutline sx={{ fontSize: 16, marginRight: 0.5 }} />
                  Esqueceu a senha?
                </Typography>
              </Box>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Box
                  component="button"
                  type="submit"
                  disabled={loading}
                  sx={{
                    width: "100%",
                    padding: "15px",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#000000",
                    backgroundColor: "#FFD700",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      backgroundColor: "#f0c800",
                      boxShadow: "0 4px 15px rgba(255, 215, 0, 0.4)",
                    },
                    "&:disabled": {
                      backgroundColor: "#7d7d7d",
                      cursor: "not-allowed",
                    },
                    marginBottom: 2,
                  }}
                >
                  {loading ? "Autenticando..." : "ENTRAR"}
                </Box>
              </motion.div>
            </Box>

            {/* Rodapé */}
            <Box
              sx={{
                background: "rgba(0, 0, 0, 0.7)",
                padding: 2,
                textAlign: "center",
                borderTop: "1px solid rgba(255, 215, 0, 0.2)",
              }}
            >
              <Typography variant="body2" sx={{ color: "#a0a0a0" }}>
                © 2025 • Sistema de Gestão Imobiliária
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>

      {/* Snackbar para mensagens de erro */}
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
          sx={{
            width: "100%",
            backgroundColor: "#5c0000",
            color: "#ffffff",
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;