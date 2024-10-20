import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();
const getIpAddress = async () => {
  try {
    const response = await axios.get("https://api.ipify.org?format=json");
    return response.data.ip;
  } catch (error) {
    console.error("Erro ao obter IP:", error.response?.data || error.message);
    return null;
  }
};

const logAccess = async (ip, referer, role) => {
  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/acessos`, {
      ip,
      referer,
      role,
    });
  } catch (error) {
    console.error(
      "Erro ao registrar acesso:",
      error.response?.data || error.message
    );
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/me`
        );
        setUser(response.data);
      } catch (error) {
        console.error(
          "Erro ao obter detalhes do usuário:",
          error.response?.data || error.message
        );
        logout();
      }
    };

    if (token && tokenExpiry) {
      const now = new Date().getTime();

      // Verificar se o token ainda é válido
      if (now < tokenExpiry) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        fetchUserDetails(); // Buscar detalhes do usuário
      } else {
        // Token expirado, tente atualizar
        updateToken();
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email, password }
      );
      const { token, refreshToken, role } = response.data;

      const expiryTime = new Date().getTime() + 3600000; // 1 hora = 3600000 ms

      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("tokenExpiry", expiryTime);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Definir usuário e buscar detalhes
      setUser({ email, role });
      fetchUserDetails(); // Atualize detalhes após login bem-sucedido

      // Capturar a informação de onde o usuário logou
      const ip = await getIpAddress(); // função para obter o IP ou outra informação de localização
      const referer = window.location.href; // URL atual como referer
      logAccess(ip, referer, role); // Enviar informação de acesso

      return { token, role };
    } catch (error) {
      console.error(
        "Erro ao fazer login:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message ||
          "Falha no login. Verifique suas credenciais."
      );
    }
  };

  const logout = () => {
    // Limpe o token e o refresh token do localStorage e remova o cabeçalho de autorização
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    delete axios.defaults.headers.common["Authorization"];

    // Limpe o usuário do estado
    setUser(null);
  };

  const updateToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("Refresh token não encontrado");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/refresh-token`,
        { refreshToken }
      );
      const { token } = response.data;

      // Atualize o token no localStorage e no cabeçalho de autorização
      const expiryTime = new Date().getTime() + 3600000; // 1 hora = 3600000 ms
      localStorage.setItem("authToken", token);
      localStorage.setItem("tokenExpiry", expiryTime);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Atualize os detalhes do usuário após a atualização do token
      fetchUserDetails();
    } catch (error) {
      console.error(
        "Erro ao atualizar o token:",
        error.response?.data || error.message
      );
      logout();
    }
  };

  // Adicionar uma função para buscar os detalhes do usuário
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/me`
      );
      setUser(response.data);
    } catch (error) {
      console.error(
        "Erro ao obter detalhes do usuário:",
        error.response?.data || error.message
      );
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
