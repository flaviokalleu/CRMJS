import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaDollarSign,
  FaHeart,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCalendarAlt,
  FaTimes,
  FaSave,
  FaUpload,
  FaFileAlt,
  FaCheck,
  FaSpinner,
  FaEdit,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { MdCloudUpload, MdDelete } from "react-icons/md";

const API_URL = process.env.REACT_APP_API_URL;

const ModalEditarCliente = ({ cliente, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    valorRenda: "",
    estadoCivil: "",
    naturalidade: "",
    profissao: "",
    dataAdmissao: "",
    dataNascimento: "",
    rendaTipo: "",
    possuiCarteiraMaisTresAnos: false,
    numeroPis: "",
    possuiDependente: false,
    status: "",
    created_at: "",
    documentos_pessoais: [],
    extrato_bancario: [],
    documentos_dependente: [],
    documentos_conjuge: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const steps = [
    { number: 1, title: "Dados Pessoais", icon: FaUser },
    { number: 2, title: "Dados Profissionais", icon: FaBriefcase },
    { number: 3, title: "Documentos", icon: FaFileAlt },
  ];

  useEffect(() => {
    if (cliente && cliente.id) {
      setFormData({
        nome: cliente.nome || "",
        email: cliente.email || "",
        telefone: cliente.telefone || "",
        cpf: cliente.cpf || "",
        valorRenda: cliente.valor_renda || "",
        estadoCivil: cliente.estado_civil || "",
        naturalidade: cliente.naturalidade || "",
        profissao: cliente.profissao || "",
        dataAdmissao: cliente.data_admissao?.split("T")[0] || "",
        dataNascimento: cliente.data_nascimento?.split("T")[0] || "",
        rendaTipo: cliente.renda_tipo || "",
        possuiCarteiraMaisTresAnos:
          cliente.possui_carteira_mais_tres_anos || false,
        numeroPis: cliente.numero_pis || "",
        possuiDependente: cliente.possui_dependente || false,
        status: cliente.status || "",
        created_at: cliente.created_at || "",
        documentos_pessoais: [],
        extrato_bancario: [],
        documentos_dependente: [],
        documentos_conjuge: [],
      });
    }
  }, [cliente]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, files) => {
    const fileArray = Array.from(files);
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ...fileArray],
    }));
  };

  const removeFile = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setMessage("Token de autenticação não encontrado.");
      return;
    }

    if (!cliente || !cliente.id) {
      setMessage("Cliente não está definido ou não possui ID.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { created_at, ...rest } = formData;

      const formDataToSubmit = new FormData();
      Object.entries(rest).forEach(([key, value]) => {
        if (
          ![
            "documentos_pessoais",
            "extrato_bancario",
            "documentos_dependente",
            "documentos_conjuge",
          ].includes(key)
        ) {
          formDataToSubmit.append(key, value);
        }
      });

      // Adicionando arquivos ao FormData
      const fileFields = [
        "documentos_pessoais",
        "extrato_bancario",
        "documentos_dependente",
        "documentos_conjuge",
      ];

      fileFields.forEach((field) => {
        const files = formData[field] || [];
        files.forEach((file) => {
          formDataToSubmit.append(field, file);
        });
      });

      const response = await axios.put(
        `${API_URL}/clientes/${cliente.id}`,
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSave({
        ...rest,
        id: cliente.id,
        created_at: formData.created_at,
      });

      setMessage("Cliente atualizado com sucesso!");
      setTimeout(() => {
        onClose();
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage(
        "Erro ao atualizar cliente. Verifique os dados e tente novamente."
      );
      console.error("Erro ao atualizar cliente:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    icon: Icon,
    label,
    type = "text",
    field,
    placeholder,
    required = false,
  }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
        <Icon className="w-4 h-4 text-blue-400" />
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={formData[field] || ""}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
          transition-all duration-300 backdrop-blur-sm"
      />
    </div>
  );

  const SelectField = ({ icon: Icon, label, field, options, required = false }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
        <Icon className="w-4 h-4 text-blue-400" />
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <select
        value={formData[field] || ""}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white 
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
          transition-all duration-300 backdrop-blur-sm"
      >
        <option value="">Selecione...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const CheckboxField = ({ label, field }) => (
    <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
      <input
        type="checkbox"
        checked={formData[field] || false}
        onChange={(e) => handleInputChange(field, e.target.checked)}
        className="w-5 h-5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
      />
      <label className="text-slate-300 font-medium">{label}</label>
    </div>
  );

  const FileUploadField = ({ label, field, accept = "*" }) => (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
        <FaUpload className="w-4 h-4 text-blue-400" />
        {label}
      </label>

      <div className="relative">
        <input
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFileChange(field, e.target.files)}
          className="hidden"
          id={`file-${field}`}
        />
        <label
          htmlFor={`file-${field}`}
          className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-slate-800/50 border-2 border-dashed border-slate-600/50 rounded-xl text-slate-400 hover:text-white hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
        >
          <MdCloudUpload className="w-6 h-6" />
          <span>Clique para adicionar arquivos</span>
        </label>
      </div>

      {/* Lista de arquivos */}
      {formData[field] && formData[field].length > 0 && (
        <div className="space-y-2">
          {formData[field].map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FaFileAlt className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(field, index)}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
              >
                <MdDelete className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                icon={FaUser}
                label="Nome Completo"
                field="nome"
                placeholder="Digite o nome completo"
                required
              />
              <InputField
                icon={FaEnvelope}
                label="Email"
                type="email"
                field="email"
                placeholder="exemplo@email.com"
                required
              />
              <InputField
                icon={FaPhone}
                label="Telefone"
                field="telefone"
                placeholder="(11) 99999-9999"
                required
              />
              <InputField
                icon={FaIdCard}
                label="CPF"
                field="cpf"
                placeholder="000.000.000-00"
                required
              />
              <InputField
                icon={FaCalendarAlt}
                label="Data de Nascimento"
                type="date"
                field="dataNascimento"
              />
              <SelectField
                icon={FaHeart}
                label="Estado Civil"
                field="estadoCivil"
                options={[
                  { value: "solteiro", label: "Solteiro(a)" },
                  { value: "casado", label: "Casado(a)" },
                  { value: "divorciado", label: "Divorciado(a)" },
                  { value: "viuvo", label: "Viúvo(a)" },
                  { value: "uniao_estavel", label: "União Estável" },
                ]}
              />
              <InputField
                icon={FaMapMarkerAlt}
                label="Naturalidade"
                field="naturalidade"
                placeholder="Cidade de nascimento"
              />
              <InputField
                icon={FaIdCard}
                label="Número PIS"
                field="numeroPis"
                placeholder="000.00000.00-0"
              />
            </div>

            <div className="space-y-4">
              <CheckboxField
                label="Possui dependente"
                field="possuiDependente"
              />
              <CheckboxField
                label="Possui carteira há mais de 3 anos"
                field="possuiCarteiraMaisTresAnos"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                icon={FaBriefcase}
                label="Profissão"
                field="profissao"
                placeholder="Digite a profissão"
              />
              <InputField
                icon={FaCalendarAlt}
                label="Data de Admissão"
                type="date"
                field="dataAdmissao"
              />
              <InputField
                icon={FaDollarSign}
                label="Valor da Renda"
                type="number"
                field="valorRenda"
                placeholder="0.00"
              />
              <SelectField
                icon={FaBriefcase}
                label="Tipo de Renda"
                field="rendaTipo"
                options={[
                  { value: "clt", label: "CLT" },
                  { value: "autonomo", label: "Autônomo" },
                  { value: "empresario", label: "Empresário" },
                  { value: "aposentado", label: "Aposentado" },
                  { value: "pensionista", label: "Pensionista" },
                  { value: "outros", label: "Outros" },
                ]}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <FileUploadField
              label="Documentos Pessoais"
              field="documentos_pessoais"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <FileUploadField
              label="Extrato Bancário"
              field="extrato_bancario"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <FileUploadField
              label="Documentos do Dependente"
              field="documentos_dependente"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <FileUploadField
              label="Documentos do Cônjuge"
              field="documentos_conjuge"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700/50"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaEdit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Editar Cliente
                  </h2>
                  <p className="text-blue-100">{formData.nome || "Cliente"}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Steps Progress */}
          <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setCurrentStep(step.number)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                      currentStep === step.number
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700/50 text-slate-400 hover:text-white"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                    <span className="hidden md:inline font-medium">{step.title}</span>
                  </motion.button>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-0.5 bg-slate-700 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  message.includes("sucesso")
                    ? "bg-green-500/20 border border-green-500/50 text-green-300"
                    : "bg-red-500/20 border border-red-500/50 text-red-300"
                }`}
              >
                {message.includes("sucesso") ? (
                  <FaCheck className="w-5 h-5" />
                ) : (
                  <FaTimes className="w-5 h-5" />
                )}
                {message}
              </motion.div>
            )}

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StepContent />
            </motion.div>
          </div>

          {/* Footer */}
          <div className="bg-slate-800/50 p-6 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Anterior
                </motion.button>

                {currentStep < steps.length ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Próximo
                  </motion.button>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      Salvar Cliente
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalEditarCliente;
