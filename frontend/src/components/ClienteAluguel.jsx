import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import AddClienteAluguel from "./AddClienteAluguel";
import EditClienteAluguel from "./EditClienteAluguel";
import ViewHistoricoPagamentos from "./ViewHistoricoPagamentos";
import moment from "moment-timezone";
import AlertVencimento from "./AlertVencimento";

const ClienteAluguel = () => {
  const [clientes, setClientes] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState(null);
  const [clienteToView, setClienteToView] = useState(null);
  const [dataFiltro, setDataFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch(`${API_URL}/clientealuguel`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setClientes(data);
        mostrarAlertas(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchClientes();
  }, [API_URL]);

  useEffect(() => {
    mostrarAlertas();
  }, [clientes]);

  const handleAddCliente = (cliente) => {
    setClientes((prev) => [...prev, cliente]);
    setIsAddModalOpen(false);
  };

  const handleEditCliente = async (updatedCliente) => {
    try {
      const response = await fetch(`${API_URL}/clientealuguel/${updatedCliente.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCliente),
      });
      if (!response.ok) {
        throw new Error("Erro ao editar cliente");
      }
      setClientes(clientes.map((cliente) => (cliente.id === updatedCliente.id ? updatedCliente : cliente)));
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
    }
  };

  const handleDeleteCliente = async (id) => {
    if (window.confirm("Você realmente deseja excluir este cliente?")) {
      try {
        const response = await fetch(`${API_URL}/clientealuguel/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Erro ao excluir cliente");
        }
        setClientes(clientes.filter((cliente) => cliente.id !== id));
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
      }
    }
  };

  const handleDeletarPagamento = async (clienteId, index) => {
    try {
      const clienteAtualizado = clientes.find(cliente => cliente.id === clienteId);
      if (clienteAtualizado) {
        const historicoAtualizado = clienteAtualizado.historico_pagamentos || [];
        const updatedCliente = { ...clienteAtualizado, historico_pagamentos: historicoAtualizado.filter((_, i) => i !== index) };

        const response = await fetch(`${API_URL}/clientealuguel/${clienteId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedCliente),
        });

        if (!response.ok) {
          throw new Error("Erro ao atualizar histórico de pagamentos");
        }

        setClientes(clientes.map(cliente => (cliente.id === clienteId ? updatedCliente : cliente)));
      }
    } catch (error) {
      console.error("Erro ao deletar pagamento:", error);
    }
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return "";
    return `(${telefone.slice(0, 2)}) ${telefone[2]} ${telefone.slice(3, 7)}-${telefone.slice(7)}`;
  };

  const verificarPagamentoMesAtual = (historicoPagamentos) => {
    if (!Array.isArray(historicoPagamentos)) return false;
    const agora = moment.tz("America/Sao_Paulo");
    const anoAtual = agora.year();
    return historicoPagamentos.some((pagamento) => {
      const dataPagamento = moment(pagamento.dataPagamento);
      return (
        dataPagamento.month() === agora.month() &&
        dataPagamento.year() === anoAtual &&
        pagamento.status === "Pago"
      );
    });
  };

  const verificarVencimentos = (diaVencimento) => {
    const agora = moment();
    const dataVencimento = moment().date(diaVencimento);
    const diffDays = dataVencimento.diff(agora, "days");
    return diffDays === 3;
  };

  const verificarAlertas = () => {
    return clientes.filter(cliente => verificarVencimentos(cliente.dia_vencimento));
  };

  const mostrarAlertas = (clientesList) => {
    const clientesAlertados = verificarAlertas(clientesList || clientes);
    if (clientesAlertados.length > 0) {
      setAlertOpen(true);
    } else {
      setAlertOpen(false);
    }
  };

  const calcularMulta = (valorAluguel, percentualMulta) => {
    return valorAluguel * (percentualMulta / 100);
  };

  const marcarComoPago = async (id, mes, dataPagamento, valorPago, formaPagamento) => {
    try {
      const clienteAtualizado = clientes.find(cliente => cliente.id === id);
      const novoPagamento = {
        mes: mes,
        dataPagamento: dataPagamento,
        valorPago: valorPago,
        formaPagamento: formaPagamento,
        status: valorPago ? "Pago" : "Não Pago",
        multa: valorPago ? 0 : calcularMulta(clienteAtualizado.valor_aluguel, clienteAtualizado.percentual_multa)
      };

      const updatedCliente = {
        ...clienteAtualizado,
        historico_pagamentos: [
          ...(clienteAtualizado.historico_pagamentos || []),
          novoPagamento
        ]
      };

      const response = await fetch(`${API_URL}/clientealuguel/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCliente),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status de pagamento");
      }

      setClientes(clientes.map(cliente => (cliente.id === id ? updatedCliente : cliente)));
    } catch (error) {
      console.error("Erro ao marcar como pago:", error);
    }
  };

  const filtrarClientes = () => {
    return clientes.filter(cliente => {
      const statusAtual = verificarPagamentoMesAtual(cliente.historico_pagamentos) ? "Pago" : "Não Pago";
      const statusMatch = statusFiltro ? statusAtual === statusFiltro : true;
      const dataMatch = dataFiltro ? cliente.historico_pagamentos && cliente.historico_pagamentos.some(p => {
        const dataPagamento = moment(p.dataPagamento);
        return dataPagamento.format("YYYY-MM") === dataFiltro;
      }) : true;
      return statusMatch && dataMatch;
    });
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-white text-center drop-shadow-lg">Clientes de Aluguel</h1>
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="bg-blue-700 text-white rounded-lg py-2 px-4 mb-6 shadow-md hover:bg-blue-800 transition"
      >
        Adicionar Cliente
      </button>
      {alertOpen && (
        <AlertVencimento
          clientes={verificarAlertas()}
          onClose={() => setAlertOpen(false)}
        />
      )}
      <div className="flex mb-4 space-x-4">
        <input
          type="month"
          value={dataFiltro}
          onChange={(e) => setDataFiltro(e.target.value)}
          className="border border-blue-800/40 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-700 transition duration-150 ease-in-out bg-blue-900/60 text-white placeholder-blue-200"
          placeholder="Filtrar por mês"
        />
        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="border border-blue-800/40 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-700 transition duration-150 ease-in-out bg-blue-900/60 text-white"
        >
          <option value="">Todos os Status</option>
          <option value="Pago">Pago</option>
          <option value="Não Pago">Não Pago</option>
        </select>
      </div>

      <div className="overflow-x-auto w-full rounded-2xl shadow-2xl border border-blue-900/40 bg-blue-950/80">
        <table className="min-w-full text-sm text-left text-blue-100 bg-blue-950 rounded-2xl">
          <thead className="text-xs text-blue-300 uppercase bg-blue-900">
            <tr className="text-center">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">CPF</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Dia do Vencimento</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Valor do Aluguel</th>
              <th className="px-4 py-3">Status do Pagamento</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrarClientes().map((cliente) => (
              <tr key={cliente.id} className="border-b border-blue-900/40 text-center transition hover:bg-blue-900/60 hover:shadow-lg hover:scale-[1.01]">
                <td className="px-4 py-3">{cliente.nome}</td>
                <td className="px-4 py-3">{cliente.cpf}</td>
                <td className="px-4 py-3">{cliente.email}</td>
                <td className="px-4 py-3">{cliente.dia_vencimento}</td>
                <td className="px-4 py-3">{formatarTelefone(cliente.telefone)}</td>
                <td className="px-4 py-3">
                  {Number(cliente.valor_aluguel).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td className="px-4 py-3">
                  {verificarPagamentoMesAtual(cliente.historico_pagamentos) ? (
                    <span className="bg-green-600 text-white py-1 px-3 rounded shadow-md font-semibold">
                      Pago
                    </span>
                  ) : (
                    <span className="bg-red-600 text-white py-1 px-3 rounded shadow-md font-semibold">
                      Não Pago
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 flex justify-center space-x-2">
                  <button
                    onClick={() => {
                      setClienteToEdit(cliente);
                      setIsEditModalOpen(true);
                    }}
                    className="text-blue-400 hover:text-blue-200 transition"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCliente(cliente.id)}
                    className="text-red-400 hover:text-red-200 transition"
                    title="Excluir"
                  >
                    <FaTrashAlt />
                  </button>
                  <button
                    onClick={() => {
                      setClienteToView(cliente);
                      setIsHistoricoModalOpen(true);
                    }}
                    className="text-green-400 hover:text-green-200 transition font-semibold underline underline-offset-2"
                    title="Ver Histórico"
                  >
                    Histórico
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddClienteAluguel
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCliente={handleAddCliente}
      />
      {clienteToEdit && (
        <EditClienteAluguel
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onEditCliente={handleEditCliente}
          cliente={clienteToEdit}
        />
      )}
      {clienteToView && (
        <ViewHistoricoPagamentos
          isOpen={isHistoricoModalOpen}
          onClose={() => setIsHistoricoModalOpen(false)}
          cliente={clienteToView}
          onMarcarComoPago={marcarComoPago}
          onDeletarPagamento={handleDeletarPagamento}
        />
      )}
    </div>
  );
};

export default ClienteAluguel;
