// src/pages/Configuracoes.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Lock,
  Camera,
  Save,
  CheckCircle,
  X,
  Loader2,
  UserCircle,
  Shield,
  Crown,
  Briefcase,
  Eye,
  EyeOff,
  Upload,
  AlertCircle,
  Settings,
  Edit3
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../context/AuthContext";

const Configuracoes = () => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telefone: '',
    address: '',
    pix_account: '',
    photo: '',
    is_administrador: false,
    is_correspondente: false,
    is_corretor: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [errors, setErrors] = useState({});

  // Memoizar função para buscar informações do usuário
  const fetchUserInfo = useCallback(async () => {
    if (!user) return;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/me`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      
      const userData = response.data.user || response.data;
      setUserInfo(prevState => ({
        ...prevState,
        ...userData
      }));
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
      setMessage("Erro ao carregar informações do usuário.");
      setMessageType("error");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Funções de atualização otimizadas para evitar re-renders
  const updateUserField = useCallback((field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!userInfo.first_name?.trim()) {
      newErrors.first_name = "Nome é obrigatório";
    }

    if (!userInfo.last_name?.trim()) {
      newErrors.last_name = "Sobrenome é obrigatório";
    }

    if (!userInfo.email?.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(userInfo.email)) {
      newErrors.email = "Email inválido";
    }

    if (password && password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (password && password !== confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [userInfo.first_name, userInfo.last_name, userInfo.email, password, confirmPassword]);

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const formData = new FormData();
      
      // Adicionar apenas campos necessários
      const fieldsToSend = [
        'first_name', 'last_name', 'email', 'telefone', 
        'address', 'pix_account'
      ];

      fieldsToSend.forEach(field => {
        if (userInfo[field] !== null && userInfo[field] !== undefined) {
          formData.append(field, userInfo[field]);
        }
      });

      if (password) {
        formData.append("password", password);
      }

      if (selectedFile) {
        formData.append("photo", selectedFile);
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/users/${userInfo.email}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          },
        }
      );

      setMessage("Configurações atualizadas com sucesso!");
      setMessageType("success");
      setShowPopup(true);
      setPassword("");
      setConfirmPassword("");
      setSelectedFile(null);
      setPreviewImage(null);
      
      // Recarregar dados do usuário após salvar
      await fetchUserInfo();
    } catch (error) {
      console.error("Erro ao atualizar informações do usuário:", error);
      setMessage("Erro ao atualizar configurações. Tente novamente.");
      setMessageType("error");
      setShowPopup(true);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  }, []);

  // Memoizar URL da foto para evitar recálculos desnecessários
  const userPhotoUrl = useMemo(() => {
    if (previewImage) return previewImage;
    if (!userInfo?.photo) {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.first_name || 'default'}&backgroundColor=1d4ed8`;
    }

    const photoDirectory = userInfo.is_administrador 
      ? 'imagem_administrador' 
      : userInfo.is_correspondente 
        ? 'imagem_correspondente' 
        : userInfo.is_corretor 
          ? 'corretor' 
          : 'imagem_user';

    return `${process.env.REACT_APP_API_URL}/uploads/${photoDirectory}/${userInfo.photo}`;
  }, [previewImage, userInfo?.photo, userInfo?.first_name, userInfo?.is_administrador, userInfo?.is_correspondente, userInfo?.is_corretor]);

  // Memoizar informações do papel
  const roleInfo = useMemo(() => {
    if (userInfo?.is_administrador) {
      return { 
        label: "Administrador", 
        icon: <Crown className="h-5 w-5" />, 
        color: "from-red-500 to-red-600",
        bgColor: "bg-red-500/20",
        textColor: "text-red-300"
      };
    }
    if (userInfo?.is_correspondente) {
      return { 
        label: "Correspondente", 
        icon: <Shield className="h-5 w-5" />, 
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-500/20",
        textColor: "text-green-300"
      };
    }
    if (userInfo?.is_corretor) {
      return { 
        label: "Corretor", 
        icon: <Briefcase className="h-5 w-5" />, 
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-500/20",
        textColor: "text-blue-300"
      };
    }
    return { 
      label: "Usuário", 
      icon: <UserCircle className="h-5 w-5" />, 
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-500/20",
      textColor: "text-gray-300"
    };
  }, [userInfo?.is_administrador, userInfo?.is_correspondente, userInfo?.is_corretor]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Componente FormField otimizado
  const FormField = React.memo(({ 
    label, 
    value, 
    onChange, 
    type = "text", 
    icon: Icon, 
    placeholder, 
    error,
    disabled = false,
    showPasswordToggle = false,
    showPassword: showPasswordState,
    onTogglePassword
  }) => (
    <motion.div 
      className="space-y-2"
      variants={itemVariants}
    >
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
        <Icon className="h-4 w-4 text-blue-400" />
        {label}
      </label>
      <div className="relative">
        <input
          type={showPasswordToggle ? (showPasswordState ? "text" : "password") : type}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
            transition-all duration-300 backdrop-blur-sm
            ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-600/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-500/50'}
          `}
          placeholder={placeholder}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPasswordState ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error && (
        <motion.p 
          className="text-red-400 text-sm flex items-center gap-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </motion.p>
      )}
    </motion.div>
  ));

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black flex items-center justify-center">
          <motion.div 
            className="flex flex-col items-center space-y-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-12 w-12 text-blue-400" />
            </motion.div>
            <p className="text-white text-lg font-medium">Carregando configurações...</p>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  if (!userInfo.email) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black flex items-center justify-center">
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
            <p className="text-white text-lg">Informações do usuário não encontradas.</p>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 p-6 lg:p-8 max-w-4xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Header */}
            <motion.div 
              className="text-center space-y-4"
              variants={itemVariants}
            >
              <div className="flex items-center justify-center gap-3">
                <motion.div
                  className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Settings className="h-8 w-8 text-white" />
                </motion.div>
                <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Configurações
                </h1>
              </div>
              <p className="text-gray-400 text-lg">
                Gerencie suas informações pessoais e preferências
              </p>
            </motion.div>

            {/* User Profile Card */}
            <motion.div 
              className="bg-gray-900/30 backdrop-blur-md rounded-3xl border border-gray-700/50 p-8 shadow-2xl"
              variants={itemVariants}
            >
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="relative">
                  <motion.div 
                    className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-gray-600/50 shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={userPhotoUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.first_name || 'default'}&backgroundColor=1d4ed8`;
                      }}
                    />
                  </motion.div>
                  
                  <motion.label 
                    className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 p-3 rounded-full cursor-pointer shadow-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Camera className="h-5 w-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </motion.label>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center lg:text-left space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {userInfo.first_name} {userInfo.last_name}
                    </h2>
                    <p className="text-gray-400 text-lg">{userInfo.email}</p>
                  </div>

                  <motion.div 
                    className={`inline-flex items-center gap-2 px-4 py-2 ${roleInfo.bgColor} rounded-full border border-current/30`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className={roleInfo.textColor}>{roleInfo.icon}</span>
                    <span className={`${roleInfo.textColor} font-semibold`}>{roleInfo.label}</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div 
              className="bg-gray-900/30 backdrop-blur-md rounded-3xl border border-gray-700/50 p-8 shadow-2xl"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 mb-8">
                <Edit3 className="h-6 w-6 text-blue-400" />
                <h3 className="text-2xl font-bold text-white">Informações Pessoais</h3>
              </div>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={containerVariants}
              >
                <FormField
                  label="Nome"
                  value={userInfo.first_name}
                  onChange={(e) => updateUserField('first_name', e.target.value)}
                  icon={User}
                  placeholder="Digite seu nome"
                  error={errors.first_name}
                />

                <FormField
                  label="Sobrenome"
                  value={userInfo.last_name}
                  onChange={(e) => updateUserField('last_name', e.target.value)}
                  icon={User}
                  placeholder="Digite seu sobrenome"
                  error={errors.last_name}
                />

                <FormField
                  label="Email"
                  value={userInfo.email}
                  onChange={(e) => updateUserField('email', e.target.value)}
                  type="email"
                  icon={Mail}
                  placeholder="Digite seu email"
                  error={errors.email}
                />

                <FormField
                  label="Telefone"
                  value={userInfo.telefone}
                  onChange={(e) => updateUserField('telefone', e.target.value)}
                  icon={Phone}
                  placeholder="Digite seu telefone"
                />

                <FormField
                  label="Conta PIX"
                  value={userInfo.pix_account}
                  onChange={(e) => updateUserField('pix_account', e.target.value)}
                  icon={CreditCard}
                  placeholder="Digite sua conta PIX"
                />

                <div className="md:col-span-2">
                  <FormField
                    label="Endereço"
                    value={userInfo.address}
                    onChange={(e) => updateUserField('address', e.target.value)}
                    icon={MapPin}
                    placeholder="Digite seu endereço"
                  />
                </div>
              </motion.div>

              {/* Password Section */}
              <motion.div 
                className="mt-8 pt-8 border-t border-gray-700/50"
                variants={itemVariants}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="h-6 w-6 text-purple-400" />
                  <h4 className="text-xl font-bold text-white">Alterar Senha</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Nova Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={Lock}
                    placeholder="Digite sua nova senha"
                    error={errors.password}
                    showPasswordToggle={true}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                  />

                  <FormField
                    label="Confirmar Senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={Lock}
                    placeholder="Confirme sua nova senha"
                    error={errors.confirmPassword}
                    showPasswordToggle={true}
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </div>
              </motion.div>

              {/* Save Button */}
              <motion.div 
                className="mt-8 flex justify-center"
                variants={itemVariants}
              >
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                    text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                    flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Success/Error Popup */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={() => setShowPopup(false)}
              />
              
              <motion.div
                className={`relative bg-gray-900/95 backdrop-blur-md rounded-3xl p-8 border shadow-2xl max-w-md w-full ${
                  messageType === "success" 
                    ? "border-green-500/50" 
                    : "border-red-500/50"
                }`}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center space-y-4">
                  <motion.div
                    className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                      messageType === "success" ? "bg-green-500/20" : "bg-red-500/20"
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  >
                    {messageType === "success" ? (
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    ) : (
                      <AlertCircle className="h-8 w-8 text-red-400" />
                    )}
                  </motion.div>
                  
                  <h3 className={`text-xl font-bold ${
                    messageType === "success" ? "text-green-400" : "text-red-400"
                  }`}>
                    {messageType === "success" ? "Sucesso!" : "Erro!"}
                  </h3>
                  
                  <p className="text-gray-300">{message}</p>
                  
                  <motion.button
                    onClick={() => setShowPopup(false)}
                    className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                      messageType === "success" 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Fechar
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default Configuracoes;
