import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { 
  FaTimes, FaUser, FaPhone, FaEnvelope, FaIdCard, 
  FaDollarSign, FaCalendarAlt, FaBriefcase, FaUsers,
  FaEye, FaFileAlt, FaPlus, FaCheck, FaTrash,
  FaStickyNote, FaMapMarkerAlt, FaHeart, FaEdit
} from "react-icons/fa";
import { 
  MdVisibility, MdAttachFile, MdLocationOn, 
  MdWork, MdFamily, MdDateRange, MdKeyboardArrowDown 
} from "react-icons/md";

const apiUrl = process.env.REACT_APP_API_URL;

const statusMap = {
  aguardando_aprovacao: {
    name: "Aguardando Aprovação",
    color: "bg-gradient-to-r from-yellow-500 to-amber-500",
    icon: "⏳",
    textColor: "text-yellow-300"
  },
  reprovado: { 
    name: "Cliente Reprovado", 
    color: "bg-gradient-to-r from-red-500 to-red-600",
    icon: "❌",
    textColor: "text-red-300"
  },
  cliente_aprovado: { 
    name: "Cliente Aprovado", 
    color: "bg-gradient-to-r from-green-500 to-emerald-500",
    icon: "✅",
    textColor: "text-green-300"
  },
  documentacao_pendente: {
    name: "Documentação Pendente",
    color: "bg-gradient-to-r from-orange-500 to-orange-600",
    icon: "📄",
    textColor: "text-orange-300"
  },
  aguardando_cancelamento_qv: {
    name: "Aguardando Cancelamento / QV",
    color: "bg-gradient-to-r from-purple-500 to-purple-600",
    icon: "🔄",
    textColor: "text-purple-300"
  },
  proposta_apresentada: { 
    name: "Proposta Apresentada", 
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    icon: "📋",
    textColor: "text-blue-300"
  },
  visita_efetuada: { 
    name: "Visita Efetuada", 
    color: "bg-gradient-to-r from-teal-500 to-cyan-500",
    icon: "🏠",
    textColor: "text-teal-300"
  },
  fechamento_proposta: { 
    name: "Fechamento Proposta", 
    color: "bg-gradient-to-r from-pink-500 to-rose-500",
    icon: "🤝",
    textColor: "text-pink-300"
  },
  processo_em_aberto: { 
    name: "Processo Aberto", 
    color: "bg-gradient-to-r from-gray-500 to-slate-500",
    icon: "📁",
    textColor: "text-gray-300"
  },
  conformidade: { 
    name: "Conformidade", 
    color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
    icon: "✔️",
    textColor: "text-indigo-300"
  },
  concluido: { 
    name: "Venda Concluída", 
    color: "bg-gradient-to-r from-teal-700 to-teal-800",
    icon: "🎉",
    textColor: "text-teal-300"
  },
  nao_deu_continuidade: { 
    name: "Não Deu Continuidade", 
    color: "bg-gradient-to-r from-gray-700 to-gray-800",
    icon: "⏸️",
    textColor: "text-gray-300"
  },
};

const ModalCliente = ({ cliente, isOpen, onClose, onStatusChange }) => {
  const [nota, setNota] = useState("");
  const [notas, setNotas] = useState([]);
  const [status, setStatus] = useState(cliente?.status || "");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotas = async () => {
      if (cliente?.id) {
        try {
          const response = await axios.get(
            `${apiUrl}/clientes/${cliente.id}/notas`
          );
          if (Array.isArray(response.data)) {
            setNotas(response.data);
          } else {
            console.error("Esperado um array mas recebido:", response.data);
          }
        } catch (error) {
          console.error("Erro ao buscar notas:", error);
        }
      }
    };

    if (isOpen) {
      fetchNotas();
      setStatus(cliente?.status || "");
    }
  }, [cliente, isOpen]);

  if (!isOpen) return null;

  const handleAddNota = async () => {
    if (nota.trim() === "") return;

    const novaNota = {
      cliente_id: cliente.id,
      processo_id: null,
      nova: true,
      destinatario: cliente.nome,
      texto: nota,
      data_criacao: new Date(),
      criado_por_id: user ? user.id : null,
    };

    try {
      const response = await axios.post(`${apiUrl}/notas`, novaNota);
      setNotas((prevNotas) => [...prevNotas, response.data]);
      setNota("");
    } catch (error) {
      console.error("Erro ao adicionar nota:", error);
    }
  };

  const handleConcluirNota = async (id) => {
    try {
      const response = await axios.put(`${apiUrl}/notas/${id}/concluir`);
      setNotas((prevNotas) =>
        prevNotas.map((n) => (n.id === id ? response.data : n))
      );
    } catch (error) {
      console.error("Erro ao concluir nota:", error);
    }
  };

  const handleDeletarNota = async (id) => {
    try {
      await axios.delete(`${apiUrl}/notas/${id}`);
      setNotas((prevNotas) => prevNotas.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Erro ao deletar nota:", error);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);

    try {
      await axios.patch(`${apiUrl}/clientes/${cliente.id}/status`, { 
        status: newStatus 
      });
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (path) => {
    window.open(`${apiUrl}/${path}`, "_blank");
  };

  const InfoCard = ({ icon: Icon, label, value, iconColor = "text-blue-400" }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-slate-400 text-sm font-medium">{label}</span>
      </div>
      <p className="text-white font-semibold break-words">
        {value || "Não informado"}
      </p>
    </motion.div>
  );

  const DocumentButton = ({ path, label, icon: Icon = FaFileAlt }) => (
    path && (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleDocumentClick(path)}
        className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-4 transition-all duration-300 w-full"
      >
        <Icon className="w-5 h-5 text-blue-400" />
        <span className="text-slate-300 font-medium">{label}</span>
        <MdVisibility className="w-4 h-4 text-slate-400 ml-auto" />
      </motion.button>
    )
  );

  const tabs = [
    { id: "info", label: "Informações", icon: FaUser },
    { id: "docs", label: "Documentos", icon: FaFileAlt },
    { id: "notes", label: "Notas", icon: FaStickyNote, count: notas.length },
  ];

  const currentStatus = statusMap[status] || statusMap.aguardando_aprovacao;

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
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {cliente?.nome?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {cliente?.nome || "Cliente"}
                  </h2>
                  <p className="text-blue-100 flex items-center gap-2">
                    <FaEnvelope className="w-4 h-4" />
                    {cliente?.email || "Email não informado"}
                  </p>
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

            {/* Status Badge */}
            <div className="mt-4">
              <div className={`${currentStatus.color} text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 font-medium text-sm w-fit`}>
                <span className="text-base">{currentStatus.icon}</span>
                <span>{currentStatus.name}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-slate-800/50 border-b border-slate-700/50">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "info" && (
                <div className="space-y-6">
                  {/* Status Change */}
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FaEdit className="w-5 h-5 text-blue-400" />
                      Alterar Status
                    </h3>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={handleStatusChange}
                        disabled={loading}
                        className="appearance-none w-full bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 pr-10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                      >
                        {Object.entries(statusMap).map(([key, value]) => (
                          <option key={key} value={key} className="bg-slate-800">
                            {value.icon} {value.name}
                          </option>
                        ))}
                      </select>
                      <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <FaUser className="w-5 h-5 text-blue-400" />
                      Informações Pessoais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoCard
                        icon={FaUser}
                        label="Nome Completo"
                        value={cliente?.nome}
                      />
                      <InfoCard
                        icon={FaEnvelope}
                        label="Email"
                        value={cliente?.email}
                      />
                      <InfoCard
                        icon={FaPhone}
                        label="Telefone"
                        value={cliente?.telefone}
                        iconColor="text-green-400"
                      />
                      <InfoCard
                        icon={FaIdCard}
                        label="CPF"
                        value={cliente?.cpf}
                        iconColor="text-yellow-400"
                      />
                      <InfoCard
                        icon={FaCalendarAlt}
                        label="Data de Nascimento"
                        value={cliente?.data_nascimento 
                          ? new Date(cliente.data_nascimento).toLocaleDateString('pt-BR')
                          : null}
                        iconColor="text-purple-400"
                      />
                      <InfoCard
                        icon={FaHeart}
                        label="Estado Civil"
                        value={cliente?.estado_civil}
                        iconColor="text-pink-400"
                      />
                      <InfoCard
                        icon={FaMapMarkerAlt}
                        label="Naturalidade"
                        value={cliente?.naturalidade}
                        iconColor="text-red-400"
                      />
                      <InfoCard
                        icon={FaIdCard}
                        label="Número PIS"
                        value={cliente?.numero_pis}
                        iconColor="text-indigo-400"
                      />
                      <InfoCard
                        icon={FaUsers}
                        label="Possui Dependente"
                        value={cliente?.possui_dependente ? "Sim" : "Não"}
                        iconColor="text-orange-400"
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <FaBriefcase className="w-5 h-5 text-blue-400" />
                      Informações Profissionais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoCard
                        icon={FaBriefcase}
                        label="Profissão"
                        value={cliente?.profissao}
                        iconColor="text-blue-400"
                      />
                      <InfoCard
                        icon={FaDollarSign}
                        label="Valor da Renda"
                        value={cliente?.valor_renda ? `R$ ${cliente.valor_renda}` : null}
                        iconColor="text-green-400"
                      />
                      <InfoCard
                        icon={MdWork}
                        label="Tipo de Renda"
                        value={cliente?.renda_tipo}
                        iconColor="text-teal-400"
                      />
                      {cliente?.renda_tipo !== "INFORMAL" && cliente?.renda_tipo !== "informal" && (
                        <InfoCard
                          icon={FaCalendarAlt}
                          label="Data de Admissão"
                          value={cliente?.data_admissao && !isNaN(new Date(cliente.data_admissao).getTime())
                            ? new Date(cliente.data_admissao).toLocaleDateString('pt-BR')
                            : null}
                          iconColor="text-cyan-400"
                        />
                      )}
                      <InfoCard
                        icon={FaIdCard}
                        label="Carteira há mais de 3 anos"
                        value={cliente?.possui_carteira_mais_tres_anos ? "Sim" : "Não"}
                        iconColor="text-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "docs" && (
                <div className="space-y-6">
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <FaFileAlt className="w-5 h-5 text-blue-400" />
                      Documentação
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DocumentButton
                        path={cliente?.documentos_pessoais}
                        label="Documentos Pessoais"
                        icon={FaIdCard}
                      />
                      <DocumentButton
                        path={cliente?.extrato_bancario}
                        label="Extrato Bancário"
                        icon={FaDollarSign}
                      />
                      <DocumentButton
                        path={cliente?.ficha_de_visita}
                        label="Ficha de Visita"
                        icon={FaEye}
                      />
                      <DocumentButton
                        path={cliente?.documentos_dependente}
                        label="Documentos do Dependente"
                        icon={FaUsers}
                      />
                      <DocumentButton
                        path={cliente?.documentos_conjuge}
                        label="Documentos do Cônjuge"
                        icon={FaHeart}
                      />
                    </div>
                    
                    {!cliente?.documentos_pessoais && !cliente?.extrato_bancario && !cliente?.ficha_de_visita && (
                      <div className="text-center py-8 text-slate-400">
                        <MdAttachFile className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Nenhum documento encontrado</p>
                        <p>Os documentos aparecerão aqui quando forem enviados</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-6">
                  {/* Add Note */}
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FaPlus className="w-5 h-5 text-blue-400" />
                      Adicionar Nova Nota
                    </h3>
                    <textarea
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all resize-none"
                      rows="4"
                      placeholder="Digite sua nota aqui..."
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddNota}
                      disabled={!nota.trim()}
                      className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
                    >
                      <FaPlus className="w-4 h-4" />
                      Adicionar Nota
                    </motion.button>
                  </div>

                  {/* Notes List */}
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <FaStickyNote className="w-5 h-5 text-blue-400" />
                      Histórico de Notas
                      {notas.length > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                          {notas.length}
                        </span>
                      )}
                    </h3>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <AnimatePresence>
                        {notas.length > 0 ? (
                          notas.map((notaItem, index) => (
                            <motion.div
                              key={notaItem.id || index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all"
                            >
                              <p className="text-white mb-3 break-words leading-relaxed">
                                {notaItem.texto}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-700/50">
                                <div className="text-sm text-slate-400">
                                  <p>Por: {notaItem.criado_por_id || "Usuário desconhecido"}</p>
                                  <p>Em: {new Date(notaItem.data_criacao).toLocaleDateString('pt-BR')} às {new Date(notaItem.data_criacao).toLocaleTimeString('pt-BR')}</p>
                                </div>
                                <div className="flex gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleConcluirNota(notaItem.id)}
                                    className="bg-green-600/20 hover:bg-green-600/30 border border-green-600/50 text-green-400 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                  >
                                    <FaCheck className="w-3 h-3" />
                                    Concluir
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDeletarNota(notaItem.id)}
                                    className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                  >
                                    <FaTrash className="w-3 h-3" />
                                    Deletar
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8 text-slate-400"
                          >
                            <FaStickyNote className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">Nenhuma nota encontrada</p>
                            <p>Adicione a primeira nota para este cliente</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalCliente;
