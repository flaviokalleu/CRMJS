import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalCliente from "./ModalCliente";
import ModalNotas from "./ModalNotas";
import ModalEditarCliente from "./ModalEditarCliente";
import { FaEdit, FaTrashAlt, FaSearch, FaFilter, FaSort, FaEye, FaUser, FaCalendarAlt, FaColumns, FaList, FaTh } from "react-icons/fa";
import { MdVisibility, MdFilterList, MdRefresh, MdKeyboardArrowDown, MdDragIndicator } from "react-icons/md";
import { HiOutlineDocumentText, HiOutlineClock, HiOutlineUserCircle } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const statusMap = {
  aguardando_aprovacao: {
    name: "Aguardando Aprovação",
    color: "bg-gradient-to-r from-yellow-500 to-amber-500",
    icon: "⏳",
    darkColor: "bg-gradient-to-r from-yellow-600 to-amber-600",
    borderColor: "border-yellow-500/50"
  },
  proposta_apresentada: { 
    name: "Proposta Apresentada", 
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    icon: "📋",
    darkColor: "bg-gradient-to-r from-blue-600 to-blue-700",
    borderColor: "border-blue-500/50"
  },
  documentacao_pendente: {
    name: "Documentação Pendente",
    color: "bg-gradient-to-r from-orange-500 to-orange-600",
    icon: "📄",
    darkColor: "bg-gradient-to-r from-orange-600 to-orange-700",
    borderColor: "border-orange-500/50"
  },
  visita_efetuada: { 
    name: "Visita Efetuada", 
    color: "bg-gradient-to-r from-teal-500 to-cyan-500",
    icon: "🏠",
    darkColor: "bg-gradient-to-r from-teal-600 to-cyan-600",
    borderColor: "border-teal-500/50"
  },
  aguardando_cancelamento_qv: {
    name: "Aguardando Cancelamento / QV",
    color: "bg-gradient-to-r from-purple-500 to-purple-600",
    icon: "🔄",
    darkColor: "bg-gradient-to-r from-purple-600 to-purple-700",
    borderColor: "border-purple-500/50"
  },
  fechamento_proposta: { 
    name: "Fechamento Proposta", 
    color: "bg-gradient-to-r from-pink-500 to-rose-500",
    icon: "🤝",
    darkColor: "bg-gradient-to-r from-pink-600 to-rose-600",
    borderColor: "border-pink-500/50"
  },
  conformidade: { 
    name: "Conformidade", 
    color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
    icon: "✔️",
    darkColor: "bg-gradient-to-r from-indigo-600 to-indigo-700",
    borderColor: "border-indigo-500/50"
  },
  cliente_aprovado: { 
    name: "Cliente Aprovado", 
    color: "bg-gradient-to-r from-green-500 to-emerald-500",
    icon: "✅",
    darkColor: "bg-gradient-to-r from-green-600 to-emerald-600",
    borderColor: "border-green-500/50"
  },
  concluido: { 
    name: "Venda Concluída", 
    color: "bg-gradient-to-r from-emerald-600 to-emerald-700",
    icon: "🎉",
    darkColor: "bg-gradient-to-r from-emerald-700 to-emerald-800",
    borderColor: "border-emerald-600/50"
  },
  reprovado: { 
    name: "Cliente Reprovado", 
    color: "bg-gradient-to-r from-red-500 to-red-600",
    icon: "❌",
    darkColor: "bg-gradient-to-r from-red-600 to-red-700",
    borderColor: "border-red-500/50"
  },
  nao_deu_continuidade: { 
    name: "Não Deu Continuidade", 
    color: "bg-gradient-to-r from-gray-700 to-gray-800",
    icon: "⏸️",
    darkColor: "bg-gradient-to-r from-gray-800 to-gray-900",
    borderColor: "border-gray-700/50"
  },
  processo_em_aberto: { 
    name: "Processo Aberto", 
    color: "bg-gradient-to-r from-gray-500 to-slate-500",
    icon: "📁",
    darkColor: "bg-gradient-to-r from-gray-600 to-slate-600",
    borderColor: "border-gray-500/50"
  },
};

// Definir a ordem das colunas no Kanban
const kanbanColumns = [
  'aguardando_aprovacao',
  'proposta_apresentada', 
  'documentacao_pendente',
  'visita_efetuada',
  'aguardando_cancelamento_qv',
  'fechamento_proposta',
  'conformidade',
  'cliente_aprovado',
  'concluido',
  'reprovado',
  'nao_deu_continuidade',
  'processo_em_aberto'
];

const ListaClientes = () => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [status, setStatus] = useState("Todos");
  const [corretor, setCorretor] = useState("Todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotasModalOpen, setIsNotasModalOpen] = useState(false);
  const [selectedNotas, setSelectedNotas] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // "table", "cards" ou "kanban"

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/clientes`,
          {
            params: { status, corretor, dataInicio, dataFim },
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setClientes(response.data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        setError("Erro ao buscar clientes. Tente novamente mais tarde.");
      }
      setLoading(false);
    };

    fetchClientes();
  }, [status, corretor, dataInicio, dataFim]);

  // Sort and filter clientes
  const processedClientes = React.useMemo(() => {
    let filtered = clientes.filter((cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "name":
        filtered.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      default:
        break;
    }

    return filtered;
  }, [clientes, searchTerm, sortBy]);

  // Agrupar clientes por status para o Kanban
  const clientesPorStatus = React.useMemo(() => {
    const grupos = {};
    kanbanColumns.forEach(statusKey => {
      grupos[statusKey] = processedClientes.filter(cliente => cliente.status === statusKey);
    });
    return grupos;
  }, [processedClientes]);

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`${process.env.REACT_APP_API_URL}/clientes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClientes(clientes.filter((cliente) => cliente.id !== id));
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
      }
    }
  };

  const handleEditSave = async (clienteAtualizado) => {
    try {
      if (!clienteAtualizado || typeof clienteAtualizado !== "object") {
        throw new Error("Cliente atualizado está indefinido ou inválido.");
      }
      clienteAtualizado.documentos_pessoais = clienteAtualizado.documentos_pessoais || [];

      const token = localStorage.getItem('authToken');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/clientes/${clienteAtualizado.id}`,
        clienteAtualizado,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setClientes(
        clientes.map((c) =>
          c.id === clienteAtualizado.id ? clienteAtualizado : c
        )
      );
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      setError("Erro ao atualizar cliente. Verifique os dados e tente novamente.");
    }
  };

  const handleViewDetails = (cliente) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const handleViewNotas = (notas) => {
    setSelectedNotas(notas);
    setIsNotasModalOpen(true);
  };

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    setIsEditModalOpen(true);
  };

  const handleStatusChange = async (clienteId, newStatus) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clientes/${clienteId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (response.ok) {
        setClientes((prev) =>
          prev.map((c) =>
            c.id === clienteId ? { ...c, status: newStatus } : c
          )
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const StatusBadge = ({ status, isEditable = false, clienteId = null, compact = false }) => {
    const statusInfo = statusMap[status] || statusMap.aguardando_aprovacao;
    
    if (isEditable && user.role !== "corretor") {
      return (
        <div className="relative">
          <select
            value={status}
            onChange={(e) => handleStatusChange(clienteId, e.target.value)}
            className={`appearance-none bg-gradient-to-r from-slate-800 to-slate-900 text-white px-3 py-2 pr-8 rounded-xl border border-slate-600 hover:border-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer font-medium shadow-lg ${compact ? 'text-xs' : 'text-sm'}`}
          >
            {Object.entries(statusMap).map(([key, value]) => (
              <option key={key} value={key} className="bg-slate-800">
                {value.icon} {value.name}
              </option>
            ))}
          </select>
          <MdKeyboardArrowDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      );
    }

    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${statusInfo.darkColor} text-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 font-medium ${compact ? 'text-xs' : 'text-sm'}`}
      >
        <span className={compact ? "text-sm" : "text-base"}>{statusInfo.icon}</span>
        <span className={compact ? "hidden lg:inline" : "hidden sm:inline"}>{statusInfo.name}</span>
      </motion.div>
    );
  };

  const KanbanCard = ({ cliente }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-500/50 group cursor-pointer"
    >
      {/* Header do Card */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {cliente.nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors truncate">
              {cliente.nome}
            </h4>
          </div>
        </div>
        
        {/* Notas Badge */}
        {cliente.notas && cliente.notas.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleViewNotas(cliente.notas);
            }}
            className="relative bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-full p-1.5 transition-colors"
          >
            <HiOutlineDocumentText className="w-3 h-3 text-red-400" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {cliente.notas.length}
            </span>
          </motion.button>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <FaCalendarAlt className="w-3 h-3" />
          <span>{new Date(cliente.created_at).toLocaleDateString('pt-BR')}</span>
        </div>
        
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <HiOutlineUserCircle className="w-3 h-3 text-blue-400" />
          <span className="truncate">
            {cliente.user
              ? `${cliente.user.first_name} ${cliente.user.last_name}`
              : "Sem corretor"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(cliente);
          }}
          className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 text-blue-400 px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
        >
          <FaEye className="w-3 h-3" />
          Ver
        </motion.button>
        
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(cliente);
            }}
            className="p-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/50 rounded-lg transition-colors"
          >
            <FaEdit className="w-3 h-3 text-yellow-400" />
          </motion.button>
          
          {user.role === "Administrador" && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(cliente.id);
              }}
              className="p-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg transition-colors"
            >
              <FaTrashAlt className="w-3 h-3 text-red-400" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const KanbanColumn = ({ statusKey, clientes }) => {
    const statusInfo = statusMap[statusKey];
    
    return (
      <div className="flex-shrink-0 w-80">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 h-full">
          {/* Header da Coluna */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${statusInfo.color}`}></div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span>{statusInfo.icon}</span>
                <span className="text-sm">{statusInfo.name}</span>
              </h3>
            </div>
            <div className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full text-xs font-medium">
              {clientes.length}
            </div>
          </div>

          {/* Cards da Coluna */}
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
            <AnimatePresence>
              {clientes.map((cliente) => (
                <KanbanCard key={cliente.id} cliente={cliente} />
              ))}
            </AnimatePresence>
            
            {clientes.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                  {statusInfo.icon}
                </div>
                <p className="text-xs">Nenhum cliente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ClienteCard = ({ cliente }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-blue-500/50 group"
    >
      {/* Header do Card */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {cliente.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors">
              {cliente.nome}
            </h3>
            <p className="text-slate-400 text-sm flex items-center gap-1">
              <FaCalendarAlt className="w-3 h-3" />
              {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        
        {/* Notas Badge */}
        {cliente.notas && cliente.notas.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleViewNotas(cliente.notas)}
            className="relative bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-full p-2 transition-colors"
          >
            <HiOutlineDocumentText className="w-5 h-5 text-red-400" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {cliente.notas.length}
            </span>
          </motion.button>
        )}
      </div>

      {/* Status */}
      <div className="mb-4">
        <StatusBadge 
          status={cliente.status} 
          isEditable={true} 
          clienteId={cliente.id} 
        />
      </div>

      {/* Corretor */}
      <div className="mb-4 flex items-center gap-2 text-slate-300">
        <HiOutlineUserCircle className="w-5 h-5 text-blue-400" />
        <span className="text-sm">
          {cliente.user
            ? `${cliente.user.first_name} ${cliente.user.last_name}`
            : "Corretor não definido"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleViewDetails(cliente)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-lg"
        >
          <FaEye className="w-4 h-4" />
          Detalhes
        </motion.button>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleEdit(cliente)}
            className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/50 rounded-lg transition-colors"
          >
            <FaEdit className="w-4 h-4 text-yellow-400" />
          </motion.button>
          
          {user.role === "Administrador" && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDelete(cliente.id)}
              className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg transition-colors"
            >
              <FaTrashAlt className="w-4 h-4 text-red-400" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const TableRow = ({ cliente, index }) => (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-all duration-200 group"
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {cliente.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
              {cliente.nome}
            </div>
            <div className="text-xs text-slate-400 md:hidden">
              {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <StatusBadge 
          status={cliente.status} 
          isEditable={true} 
          clienteId={cliente.id} 
        />
      </td>
      
      <td className="p-4 text-slate-300 text-sm hidden md:table-cell">
        {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
      </td>
      
      <td className="p-4 text-slate-300 text-sm hidden lg:table-cell">
        <div className="flex items-center gap-2">
          <HiOutlineUserCircle className="w-4 h-4 text-blue-400" />
          {cliente.user
            ? `${cliente.user.first_name} ${cliente.user.last_name}`
            : "Não definido"}
        </div>
      </td>
      
      <td className="p-4 text-center">
        {cliente.notas && cliente.notas.length > 0 ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleViewNotas(cliente.notas)}
            className="relative bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-full p-2 transition-colors"
          >
            <MdVisibility className="w-5 h-5 text-red-400" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {cliente.notas.length}
            </span>
          </motion.button>
        ) : (
          <div className="text-slate-500">-</div>
        )}
      </td>
      
      <td className="p-4 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleViewDetails(cliente)}
          className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 text-blue-400 px-3 py-1 rounded-lg font-medium text-sm transition-colors"
        >
          Ver
        </motion.button>
      </td>
      
      <td className="p-4">
        <div className="flex items-center justify-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleEdit(cliente)}
            className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/50 rounded-lg transition-colors"
          >
            <FaEdit className="w-4 h-4 text-yellow-400" />
          </motion.button>
          
          {user.role === "Administrador" && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDelete(cliente.id)}
              className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg transition-colors"
            >
              <FaTrashAlt className="w-4 h-4 text-red-400" />
            </motion.button>
          )}
        </div>
      </td>
    </motion.tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaUser className="w-5 h-5 text-white" />
                </div>
                Lista de Clientes
              </h1>
              <p className="text-slate-400 mt-1">
                {processedClientes.length} cliente{processedClientes.length !== 1 ? 's' : ''} encontrado{processedClientes.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {/* View Toggle - Desktop */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FaList className="w-4 h-4" />
                Lista
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  viewMode === "cards"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FaTh className="w-4 h-4" />
                Cards
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  viewMode === "kanban"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FaColumns className="w-4 h-4" />
                Kanban
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={viewMode === "kanban" ? "w-full" : "max-w-7xl mx-auto"}>
        <div className={viewMode === "kanban" ? "px-4 py-6" : "px-4 py-6"}>
          {/* Search and Filters */}
          <div className="mb-6">
            {/* Search Bar */}
            <div className="relative mb-4">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar clientes por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all text-lg backdrop-blur-sm"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white transition-all backdrop-blur-sm"
              >
                <MdFilterList className="w-5 h-5" />
                Filtros
                <motion.div
                  animate={{ rotate: showFilters ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MdKeyboardArrowDown className="w-5 h-5" />
                </motion.div>
              </motion.button>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all backdrop-blur-sm"
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="name">Ordem alfabética</option>
              </select>

              {/* Mobile View Toggle */}
              <div className="sm:hidden flex items-center gap-1 bg-slate-800/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex-1 px-2 py-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1 ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400"
                  }`}
                >
                  <FaList className="w-3 h-3" />
                  Lista
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`flex-1 px-2 py-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1 ${
                    viewMode === "cards"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400"
                  }`}
                >
                  <FaTh className="w-3 h-3" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`flex-1 px-2 py-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1 ${
                    viewMode === "kanban"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400"
                  }`}
                >
                  <FaColumns className="w-3 h-3" />
                  Kanban
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                        >
                          <option value="Todos">Todos os status</option>
                          {Object.entries(statusMap).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value.icon} {value.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Corretor</label>
                        <select
                          value={corretor}
                          onChange={(e) => setCorretor(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                        >
                          <option value="Todos">Todos os corretores</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Data Início</label>
                        <input
                          type="date"
                          value={dataInicio}
                          onChange={(e) => setDataInicio(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Data Fim</label>
                        <input
                          type="date"
                          value={dataFim}
                          onChange={(e) => setDataFim(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-6 py-4 rounded-2xl text-center">
              {error}
            </div>
          ) : viewMode === "kanban" ? (
            <div className="flex gap-6 overflow-x-auto pb-6">
              {kanbanColumns.map((statusKey) => (
                <KanbanColumn
                  key={statusKey}
                  statusKey={statusKey}
                  clientes={clientesPorStatus[statusKey] || []}
                />
              ))}
            </div>
          ) : viewMode === "cards" ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {processedClientes.map((cliente) => (
                  <ClienteCard key={cliente.id} cliente={cliente} />
                ))}
              </AnimatePresence>
              
              {processedClientes.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400">
                  <FaUser className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-medium">Nenhum cliente encontrado</p>
                  <p>Tente ajustar os filtros de busca</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-700/50">
                      <th className="text-left p-4 text-slate-300 font-semibold">Cliente</th>
                      <th className="text-left p-4 text-slate-300 font-semibold">Status</th>
                      <th className="text-left p-4 text-slate-300 font-semibold hidden md:table-cell">Data</th>
                      <th className="text-left p-4 text-slate-300 font-semibold hidden lg:table-cell">Corretor</th>
                      <th className="text-center p-4 text-slate-300 font-semibold">Notas</th>
                      <th className="text-center p-4 text-slate-300 font-semibold">Detalhes</th>
                      <th className="text-center p-4 text-slate-300 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {processedClientes.map((cliente, index) => (
                        <TableRow key={cliente.id} cliente={cliente} index={index} />
                      ))}
                    </AnimatePresence>
                    
                    {processedClientes.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-slate-400">
                          <FaUser className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-xl font-medium">Nenhum cliente encontrado</p>
                          <p>Tente ajustar os filtros de busca</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ModalCliente
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cliente={selectedCliente}
      />
      <ModalNotas
        isOpen={isNotasModalOpen}
        onClose={() => setIsNotasModalOpen(false)}
        notas={selectedNotas}
      />
      <ModalEditarCliente
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        cliente={selectedCliente || { documentos_pessoais: [] }}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default ListaClientes;