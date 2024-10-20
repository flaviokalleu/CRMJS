import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalCliente from "./ModalCliente";
import ModalNotas from "./ModalNotas";
import ModalEditarCliente from "./ModalEditarCliente";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { MdVisibility } from "react-icons/md";
import { useAuth } from "../context/AuthContext"; // Já está correto

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
  const { user, authToken } = useAuth(); // Agora estamos obtendo o authToken corretamente
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

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
      console.log("clienteAtualizado:", clienteAtualizado);

      // Garantir que o clienteAtualizado exista corretamente
      if (!clienteAtualizado || typeof clienteAtualizado !== "object") {
        throw new Error("Cliente atualizado está indefinido ou inválido.");
      }

      // Verificar se o campo documentos_pessoais está presente, senão inicializar
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

  const handleStatusChange = () => {
    // Recarregar a lista de clientes após a atualização do status
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
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-800">
      <main className="flex-1 p-4 sm:p-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-8">
          Lista de Clientes
        </h1>

        {/* Filtros */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
            <input
              type="text"
              placeholder="Buscar por nome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded"
            >
              <option value="Todos">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
            <select
              value={corretor}
              onChange={(e) => setCorretor(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded"
            >
              <option value="Todos">Todos</option>
              {/* Mapear corretores disponíveis */}
            </select>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded"
            />
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded"
            />
          </div>
        </div>

        {/* Tabela de Clientes */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-700 text-white">
            <thead>
              <tr>
                <th className="p-2 sm:p-4 border-b border-gray-600 text-center">
                  Nome
                </th>
                <th className="p-2 sm:p-4 border-b border-gray-600 text-center">
                  Status
                </th>
                <th className="p-2 sm:p-4 border-b border-gray-600 text-center">
                  Dia do Cadastro
                </th>
                <th className="p-2 sm:p-4 border-b border-gray-600 text-center">
                  Nome Corretor
                </th>
                <th className="p-2 sm:p-4 border-b border-gray-600 text-center">
                  Notas
                </th>
                <th className="p-2 sm:p-4 border-b border-gray-600 text-center">
                  Detalhes
                </th>
                <th className="p-2 sm:p-4 border-b border-gray-600 text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="p-2 sm:p-4 border-b border-gray-600 text-center">
                      {cliente.nome}
                    </td>
                    <td className="p-2 sm:p-4 border-b border-gray-600 text-center">
                      {user.role === "corretor" ? (
                        <span
                          className={`inline-block text-white px-2 py-1 rounded ${
                            statusMap[cliente.status]?.color
                          }`}
                        >
                          {statusMap[cliente.status]?.name}
                        </span>
                      ) : (
                        <select
                          value={cliente.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
                            try {
                              const response = await fetch(
                                `${process.env.REACT_APP_API_URL}/clientes/${cliente.id}/status`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`, // Use the token from localStorage
                                  },
                                  body: JSON.stringify({ status: newStatus }),
                                }
                              );

                              if (response.ok) {
                                console.log("Status atualizado com sucesso");
                              } else {
                                const errorData = await response.json(); // Capture error response for debugging
                                console.error(
                                  "Erro ao atualizar status:",
                                  errorData.message
                                );
                              }
                            } catch (error) {
                              console.error(
                                "Erro ao enviar requisição:",
                                error
                              );
                            }
                          }}
                          className="bg-gray-800 text-white px-2 py-1 rounded"
                        >
                          {Object.keys(statusMap).map((statusKey) => (
                            <option key={statusKey} value={statusKey}>
                              {statusMap[statusKey].name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="p-2 sm:p-4 border-b border-gray-600 text-center">
                      {new Date(cliente.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2 sm:p-4 border-b border-gray-600 text-center">
                      {cliente.corretor
                        ? `${cliente.corretor.first_name} ${cliente.corretor.last_name}`
                        : "Corretor não definido"}
                    </td>
                    <td className="p-2 sm:p-4 border-b border-gray-600 text-center">
                      <div className="relative inline-block">
                        <button className="text-blue-500 hover:text-blue-700 relative">
                          {cliente.notas.length > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                              {cliente.notas.length}
                            </span>
                          )}
                          <MdVisibility />
                        </button>
                      </div>
                    </td>

                    <td className="p-2 sm:p-4 border-b border-gray-600 text-center">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => handleViewDetails(cliente)}
                      >
                        Ver Detalhes
                      </button>
                    </td>

                    {/* Conditionally render edit and delete buttons for "Corretor" role */}
                    {/* Renderizar botão de editar para todos e botão de deletar apenas para administradores */}
                    <td className="p-2 sm:p-4 border-b border-gray-600 text-center">
                      <button
                        className="text-yellow-500 hover:text-yellow-700"
                        onClick={() => handleEdit(cliente)}
                      >
                        <FaEdit />
                      </button>

                      {/* Renderizar botão de deletar apenas para administradores */}
                      {user.role === "Administrador" && (
                        <button
                          className="text-red-500 hover:text-red-700 ml-2"
                          onClick={() => handleDelete(cliente.id)}
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
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
        cliente={selectedCliente || { documentos_pessoais: [] }} // Defina um valor padrão
        onSave={handleEditSave}
      />
    </div>
  );
};

export default ListaClientes;
