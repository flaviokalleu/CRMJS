import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalCliente from "./ModalCliente";
import ModalNotas from "./ModalNotas";
import ModalEditarCliente from "./ModalEditarCliente";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { MdVisibility } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const statusMap = {
  aguardando_aprovacao: {
    name: "Aguardando Aprovação",
    color: "bg-yellow-500",
  },
  reprovado: { name: "Cliente Reprovado", color: "bg-red-500" },
  cliente_aprovado: { name: "Cliente Aprovado", color: "bg-green-500" },
  documentacao_pendente: {
    name: "Documentação Pendente",
    color: "bg-orange-500",
  },
  aguardando_cancelamento_qv: {
    name: "Aguardando Cancelamento / QV",
    color: "bg-purple-500",
  },
  proposta_apresentada: { name: "Proposta Apresentada", color: "bg-blue-500" },
  visita_efetuada: { name: "Visita Efetuada", color: "bg-teal-500" },
  fechamento_proposta: { name: "Fechamento Proposta", color: "bg-pink-500" },
  processo_em_aberto: { name: "Processo Aberto", color: "bg-gray-500" },
  conformidade: { name: "Conformidade", color: "bg-indigo-500" },
  concluido: { name: "Venda Concluída", color: "bg-teal-700" },
  nao_deu_continuidade: { name: "Não Deu Continuidade", color: "bg-gray-700" },
};

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

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/clientes`,
          {
            params: { status, corretor, dataInicio, dataFim },
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

  // Sort clientes from newest to oldest based on created_at
  const sortedClientes = [...clientes].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Filtered clients based on search term
  const filteredClientes = sortedClientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/clientes/${id}`);
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
      clienteAtualizado.documentos_pessoais =
        clienteAtualizado.documentos_pessoais || [];

      await axios.put(
        `${process.env.REACT_APP_API_URL}/clientes/${clienteAtualizado.id}`,
        clienteAtualizado
      );

      setClientes(
        clientes.map((c) =>
          c.id === clienteAtualizado.id ? clienteAtualizado : c
        )
      );
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      setError(
        "Erro ao atualizar cliente. Verifique os dados e tente novamente."
      );
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

  // Efeito de hover para linhas da tabela
  const rowHover =
    "transition duration-200 hover:bg-blue-900/60 hover:shadow-lg hover:scale-[1.01]";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black">
      <main className="flex-1 p-4 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 text-center tracking-tight drop-shadow-lg">
          Lista de Clientes
        </h1>

        {/* Filtros */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 sm:gap-6 mb-4 justify-center">
            <input
              type="text"
              placeholder="Buscar por nome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-blue-900/60 text-white p-3 rounded-lg border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60 shadow"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-blue-900/60 text-white p-3 rounded-lg border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition shadow"
            >
              <option value="Todos">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
            <select
              value={corretor}
              onChange={(e) => setCorretor(e.target.value)}
              className="bg-blue-900/60 text-white p-3 rounded-lg border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition shadow"
            >
              <option value="Todos">Todos</option>
              {/* Mapear corretores disponíveis */}
            </select>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-blue-900/60 text-white p-3 rounded-lg border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition shadow"
            />
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-blue-900/60 text-white p-3 rounded-lg border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition shadow"
            />
          </div>
        </div>

        {/* Tabela de Clientes */}
        <div className="overflow-x-auto rounded-2xl shadow-2xl border border-blue-900/40 bg-blue-950/80">
          <table className="min-w-full text-white text-sm">
            <thead>
              <tr className="bg-blue-900/80 text-blue-200 uppercase text-xs">
                <th className="p-4 border-b border-blue-900 text-center">
                  Nome
                </th>
                <th className="p-4 border-b border-blue-900 text-center">
                  Status
                </th>
                <th className="p-4 border-b border-blue-900 text-center">
                  Dia do Cadastro
                </th>
                <th className="p-4 border-b border-blue-900 text-center">
                  Nome Corretor
                </th>
                <th className="p-4 border-b border-blue-900 text-center">
                  Notas
                </th>
                <th className="p-4 border-b border-blue-900 text-center">
                  Detalhes
                </th>
                <th className="p-4 border-b border-blue-900 text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-blue-200">
                    Carregando...
                  </td>
                </tr>
              ) : filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className={`${rowHover} border-b border-blue-900/40`}
                  >
                    <td className="p-4 text-center font-semibold text-white">
                      {cliente.nome}
                    </td>
                    <td className="p-4 text-center">
                      {user.role === "corretor" ? (
                        <span
                          className={`inline-block text-white px-2 py-1 rounded shadow ${statusMap[cliente.status]?.color}`}
                        >
                          {statusMap[cliente.status]?.name}
                        </span>
                      ) : (
                        <select
                          value={cliente.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            const token = localStorage.getItem("authToken");
                            try {
                              const response = await fetch(
                                `${process.env.REACT_APP_API_URL}/clientes/${cliente.id}/status`,
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
                                // Atualize o status localmente
                                setClientes((prev) =>
                                  prev.map((c) =>
                                    c.id === cliente.id
                                      ? { ...c, status: newStatus }
                                      : c
                                  )
                                );
                              }
                            } catch (error) {
                              // Erro silencioso
                            }
                          }}
                          className="bg-blue-900/80 text-white px-2 py-1 rounded shadow"
                        >
                          {Object.keys(statusMap).map((statusKey) => (
                            <option key={statusKey} value={statusKey}>
                              {statusMap[statusKey].name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="p-4 text-center text-blue-200">
                      {new Date(cliente.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center text-blue-100">
                      {cliente.corretor
                        ? `${cliente.corretor.first_name} ${cliente.corretor.last_name}`
                        : "Corretor não definido"}
                    </td>
                    <td className="p-4 text-center">
                      <div className="relative inline-block">
                        <button
                          className="text-blue-400 hover:text-blue-200 transition relative"
                          onClick={() => handleViewNotas(cliente.notas)}
                          title="Ver notas"
                        >
                          <MdVisibility size={22} />
                          {cliente.notas.length > 0 && (
                            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                              {cliente.notas.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        className="text-blue-400 hover:text-blue-200 transition font-semibold underline underline-offset-2"
                        onClick={() => handleViewDetails(cliente)}
                      >
                        Ver Detalhes
                      </button>
                    </td>
                    <td className="p-4 text-center flex items-center justify-center gap-2">
                      <button
                        className="text-yellow-400 hover:text-yellow-200 transition"
                        onClick={() => handleEdit(cliente)}
                        title="Editar"
                      >
                        <FaEdit size={18} />
                      </button>
                      {user.role === "Administrador" && (
                        <button
                          className="text-red-500 hover:text-red-300 transition"
                          onClick={() => handleDelete(cliente.id)}
                          title="Excluir"
                        >
                          <FaTrashAlt size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-blue-200">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

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
