import React, { useState } from 'react';
import axios from 'axios';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  CreditCard,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Componente de Input
const InputField = ({
  label,
  name,
  type = 'text',
  icon: Icon,
  required = false,
  placeholder,
  value,
  onChange,
  error,
  showPassword,
  togglePassword,
  ...props
}) => {
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-200">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 ${
            error ? 'border-red-500' : 'border-gray-600'
          }`}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={togglePassword}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-200" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-200" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};

// Componente principal
const AddCorretor = () => {
  // Estados do formulário
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    creci: '',
    address: '',
    pix_account: '',
    telefone: '',
    password: '',
    confirmPassword: ''
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // Manipular mudanças nos inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manipular upload de foto
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setMessage({
        type: 'error',
        text: 'Por favor, selecione apenas arquivos de imagem'
      });
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'Imagem muito grande. Máximo: 5MB'
      });
      return;
    }

    setPhoto(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Limpar erro de foto
    if (errors.photo) {
      setErrors(prev => ({
        ...prev,
        photo: ''
      }));
    }
    
    setMessage({ type: '', text: '' });
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors = {};

    // Validar campos obrigatórios
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username deve ter pelo menos 3 caracteres';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.first_name || formData.first_name.length < 2) {
      newErrors.first_name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.last_name || formData.last_name.length < 2) {
      newErrors.last_name = 'Sobrenome deve ter pelo menos 2 caracteres';
    }

    if (!formData.telefone || formData.telefone.length < 10) {
      newErrors.telefone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    if (!photo) {
      newErrors.photo = 'Foto é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: 'Por favor, corrija os erros no formulário'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Criar FormData
      const submitData = new FormData();
      
      // Adicionar campos obrigatórios
      submitData.append('username', formData.username.trim());
      submitData.append('email', formData.email.trim());
      submitData.append('first_name', formData.first_name.trim());
      submitData.append('last_name', formData.last_name.trim());
      submitData.append('telefone', formData.telefone.trim());
      submitData.append('password', formData.password);
      
      // Adicionar campos opcionais se preenchidos
      if (formData.creci?.trim()) {
        submitData.append('creci', formData.creci.trim());
      }
      if (formData.address?.trim()) {
        submitData.append('address', formData.address.trim());
      }
      if (formData.pix_account?.trim()) {
        submitData.append('pix_account', formData.pix_account.trim());
      }
      
      // Adicionar foto
      submitData.append('photo', photo);

      console.log('📤 Enviando dados para:', `${API_URL}/corretor`);

      // Fazer requisição
      const response = await axios.post(`${API_URL}/corretor`, submitData);

      console.log('[FRONTEND] Resposta recebida:', response.data);

      setMessage({
        type: 'success',
        text: 'Corretor criado com sucesso!'
      });

      // Resetar formulário
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        creci: '',
        address: '',
        pix_account: '',
        telefone: '',
        password: '',
        confirmPassword: ''
      });
      setPhoto(null);
      setPhotoPreview(null);
      setErrors({});

    } catch (error) {
      console.error('❌ Erro:', error);

      let errorMessage = 'Erro ao criar corretor';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors[0];
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout - tente novamente';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      creci: '',
      address: '',
      pix_account: '',
      telefone: '',
      password: '',
      confirmPassword: ''
    });
    setPhoto(null);
    setPhotoPreview(null);
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Adicionar Corretor
          </h1>
          <p className="text-gray-400">
            Preencha os dados para cadastrar um novo corretor
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Upload de Foto */}
            <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-700/50">
              <div className="relative">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500/50 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    >
                      <AlertCircle className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-700/50 border-2 border-dashed border-gray-500 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Escolher Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400">
                  PNG, JPG, GIF até 5MB
                </p>
                {errors.photo && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.photo}
                  </p>
                )}
              </div>
            </div>

            {/* Campos do Formulário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Username"
                name="username"
                icon={User}
                required
                placeholder="Digite o username"
                value={formData.username}
                onChange={handleInputChange}
                error={errors.username}
              />
              
              <InputField
                label="E-mail"
                name="email"
                type="email"
                icon={Mail}
                required
                placeholder="Digite o e-mail"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
              />
              
              <InputField
                label="Nome"
                name="first_name"
                icon={User}
                required
                placeholder="Primeiro nome"
                value={formData.first_name}
                onChange={handleInputChange}
                error={errors.first_name}
              />
              
              <InputField
                label="Sobrenome"
                name="last_name"
                icon={User}
                required
                placeholder="Sobrenome"
                value={formData.last_name}
                onChange={handleInputChange}
                error={errors.last_name}
              />
              
              <InputField
                label="CRECI"
                name="creci"
                icon={CreditCard}
                placeholder="Número do CRECI"
                value={formData.creci}
                onChange={handleInputChange}
                error={errors.creci}
              />
              
              <InputField
                label="Telefone"
                name="telefone"
                icon={Phone}
                required
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={handleInputChange}
                error={errors.telefone}
              />
              
              <div className="md:col-span-2">
                <InputField
                  label="Endereço"
                  name="address"
                  icon={MapPin}
                  placeholder="Endereço completo"
                  value={formData.address}
                  onChange={handleInputChange}
                  error={errors.address}
                />
              </div>
              
              <div className="md:col-span-2">
                <InputField
                  label="PIX/Conta"
                  name="pix_account"
                  icon={CreditCard}
                  placeholder="Chave PIX ou dados da conta"
                  value={formData.pix_account}
                  onChange={handleInputChange}
                  error={errors.pix_account}
                />
              </div>
              
              <InputField
                label="Senha"
                name="password"
                type="password"
                icon={Lock}
                required
                placeholder="Digite a senha"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
              />
              
              <InputField
                label="Confirmar Senha"
                name="confirmPassword"
                type="password"
                icon={Lock}
                required
                placeholder="Confirme a senha"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                showPassword={showConfirmPassword}
                togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>

            {/* Botões */}
            <div className="pt-6 flex gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-3 px-6 rounded-xl font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Limpar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Criar Corretor
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Mensagens */}
          {message.text && (
            <div className={`mt-6 p-4 rounded-xl border flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-900/30 border-green-500/50 text-green-400'
                : 'bg-red-900/30 border-red-500/50 text-red-400'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCorretor;
