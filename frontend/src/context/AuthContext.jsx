import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

// Função para obter IP do usuário
const getIpAddress = async () => {
  try {
    const response = await axios.get("https://api.ipify.org?format=json");
    return response.data.ip;
  } catch (error) {
    console.error("Erro ao obter IP:", error.response?.data || error.message);
    return "Unknown";
  }
};

// Log de acesso com informações do usuário
const logAccess = async (ip, referer, roles, userId, action = 'login') => {
  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/acessos`, {
      ip,
      referer,
      roles: roles.join(','), // Converter array de roles para string
      userId,
      action,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
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
  const [userRoles, setUserRoles] = useState([]);
  const [primaryRole, setPrimaryRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para extrair roles do usuário baseado nas flags
  const extractUserRoles = useCallback((userData) => {
    const roles = [];
    
    if (userData?.is_administrador) roles.push('administrador');
    if (userData?.is_corretor) roles.push('corretor');
    if (userData?.is_correspondente) roles.push('correspondente');
    
    return roles;
  }, []);

  // Função para determinar o papel primário
  const determinePrimaryRole = useCallback((roles) => {
    if (roles.includes('administrador')) return 'administrador';
    if (roles.includes('corretor')) return 'corretor';
    if (roles.includes('correspondente')) return 'correspondente';
    return null;
  }, []);

  // Função para buscar detalhes do usuário
  const fetchUserDetails = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Token não encontrado");
      }

      // Configurar headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/me`,
        config
      );

      if (response.data) {
        const userData = response.data;
        const roles = extractUserRoles(userData);
        const primary = determinePrimaryRole(roles);

        setUser(userData);
        setUserRoles(roles);
        setPrimaryRole(primary);

        return userData;
      }

      throw new Error("Dados do usuário não encontrados");

    } catch (error) {
      console.error(
        "Erro ao obter detalhes do usuário:",
        error.response?.data || error.message
      );

      // Tratamento específico de erros
      if (error.response?.status === 401) {
        setError("Sessão expirada");
        logout();
      } else {
        setError(error.message || "Erro ao carregar usuário");
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [extractUserRoles, determinePrimaryRole]);

  // Verificar token na inicialização
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("authToken");
      const tokenExpiry = localStorage.getItem("tokenExpiry");

      if (token && tokenExpiry) {
        const now = new Date().getTime();

        // Verificar se o token ainda é válido
        if (now < tokenExpiry) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          await fetchUserDetails(true);
        } else {
          // Token expirado, tentar atualizar
          await updateToken();
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [fetchUserDetails]);

  // Função de login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email, password }
      );

      const { token, refreshToken, user: userData } = response.data;

      // Calcular tempo de expiração (1 hora)
      const expiryTime = new Date().getTime() + 3600000;

      // Salvar tokens
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("tokenExpiry", expiryTime);

      // Configurar axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Processar dados do usuário
      const roles = extractUserRoles(userData);
      const primary = determinePrimaryRole(roles);

      setUser(userData);
      setUserRoles(roles);
      setPrimaryRole(primary);

      // Log de acesso
      try {
        const ip = await getIpAddress();
        const referer = window.location.href;
        await logAccess(ip, referer, roles, userData.id, 'login');
      } catch (logError) {
        console.warn("Erro ao registrar log de acesso:", logError);
      }

      return { 
        success: true, 
        token, 
        user: userData, 
        roles, 
        primaryRole: primary 
      };

    } catch (error) {
      console.error(
        "Erro ao fazer login:",
        error.response?.data || error.message
      );

      const errorMessage = error.response?.data?.message ||
        "Falha no login. Verifique suas credenciais.";
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = useCallback(async () => {
    try {
      // Log de logout se usuário estiver logado
      if (user) {
        try {
          const ip = await getIpAddress();
          const referer = window.location.href;
          await logAccess(ip, referer, userRoles, user.id, 'logout');
        } catch (logError) {
          console.warn("Erro ao registrar log de logout:", logError);
        }
      }
    } catch (error) {
      console.warn("Erro durante logout:", error);
    } finally {
      // Limpar dados locais
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiry");
      delete axios.defaults.headers.common["Authorization"];

      // Limpar estado
      setUser(null);
      setUserRoles([]);
      setPrimaryRole(null);
      setError(null);
      setLoading(false);
    }
  }, [user, userRoles]);

  // Função para atualizar token
  const updateToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Refresh token não encontrado");
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/refresh-token`,
        { refreshToken }
      );

      const { token } = response.data;

      // Atualizar token
      const expiryTime = new Date().getTime() + 3600000;
      localStorage.setItem("authToken", token);
      localStorage.setItem("tokenExpiry", expiryTime);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Buscar dados atualizados do usuário
      await fetchUserDetails();

      return true;

    } catch (error) {
      console.error(
        "Erro ao atualizar o token:",
        error.response?.data || error.message
      );
      await logout();
      return false;
    }
  }, [fetchUserDetails, logout]);

  // Função para atualizar perfil do usuário
  const updateUserProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/profile`,
        profileData,
        config
      );

      if (response.data) {
        const userData = response.data;
        const roles = extractUserRoles(userData);
        const primary = determinePrimaryRole(roles);

        setUser(userData);
        setUserRoles(roles);
        setPrimaryRole(primary);

        return { success: true, user: userData };
      }

      throw new Error("Erro na resposta do servidor");

    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      const errorMessage = error.response?.data?.message || "Erro ao atualizar perfil";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [extractUserRoles, determinePrimaryRole]);

  // Função para verificar se tem um papel específico
  const hasRole = useCallback((role) => {
    return userRoles.includes(role);
  }, [userRoles]);

  // Função para verificar múltiplos papéis
  const hasMultipleRoles = useCallback(() => {
    return userRoles.length > 1;
  }, [userRoles]);

  // Função para verificar permissões específicas
  const hasPermission = useCallback((permission) => {
    switch (permission) {
      case 'admin':
        return hasRole('administrador');
      case 'manage_properties':
        return hasRole('administrador') || hasRole('corretor');
      case 'manage_clients':
        return userRoles.length > 0; // Qualquer papel logado
      case 'view_reports':
        return hasRole('administrador') || hasRole('corretor');
      case 'system_settings':
        return hasRole('administrador');
      default:
        return false;
    }
  }, [hasRole, userRoles]);

  // Função para refresh manual
  const refreshUser = useCallback(() => {
    return fetchUserDetails(true);
  }, [fetchUserDetails]);

  // Valor do contexto
  const contextValue = {
    // Dados do usuário
    user,
    userRoles,
    primaryRole,
    
    // Estados
    loading,
    error,
    
    // Funções principais
    login,
    logout,
    updateToken,
    updateUserProfile,
    refreshUser,
    
    // Funções de verificação
    hasRole,
    hasMultipleRoles,
    hasPermission,
    
    // Estados booleanos para conveniência
    isAuthenticated: !!user,
    isAdmin: hasRole('administrador'),
    isCorretor: hasRole('corretor'),
    isCorrespondente: hasRole('correspondente'),
    
    // Dados derivados
    userName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    userEmail: user?.email || '',
    userId: user?.id || null
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
