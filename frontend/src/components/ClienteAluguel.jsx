// src/components/ClienteAluguel.jsx
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import AddClienteAluguel from "./AddClienteAluguel";
import moment from "moment";

const ClienteAluguel = () => {
  const [clientes, setClientes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchClientes();
  }, [API_URL]);

  const handleAddCliente = (cliente) => {
    setClientes((prev) => [...prev, cliente]);
    setIsModalOpen(false);
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

  const formatarTelefone = (telefone) => {
    if (!telefone) return "";
    return `(${telefone.slice(0, 2)}) ${telefone[2]} ${telefone.slice(
      3,
      7
    )}-${telefone.slice(7)}`;
  };

  const verificarVencimentos = (diaVencimento) => {
    const agora = moment();
    const dataVencimento = moment().date(diaVencimento);
    const diffDays = dataVencimento.diff(agora, "days");

    return diffDays === 3; // Retorna true se faltam 3 dias para o vencimento
  };

  const marcarComoPago = (id) => {
    setClientes(
      clientes.map((cliente) => {
        if (cliente.id === id) {
          return { ...cliente, pago: true }; // Marca como pago
        }
        return cliente;
      })
    );
  };

  return (
    <div className="p-6 bg-gray-900 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">
        Clientes de Aluguel
      </h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-white rounded-lg py-2 px-4 mb-6 block"
      >
        Adicionar Cliente
      </button>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full text-sm text-left text-gray-400 bg-gray-900">
          <thead className="text-xs text-gray-500 uppercase bg-gray-800">
            <tr className="text-center">
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">CPF</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Telefone</th>
              <th className="px-6 py-3">Valor do Aluguel</th>
              <th className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr
                key={cliente.id}
                className={`bg-gray-800 border-b border-gray-700 hover:bg-gray-700 text-center ${
                  verificarVencimentos(cliente.dia_vencimento) && !cliente.pago
                    ? "bg-yellow-500"
                    : ""
                }`}
              >
                <td className="px-6 py-4 text-gray-300">
                  {cliente.nome}
                  {verificarVencimentos(cliente.dia_vencimento) &&
                    !cliente.pago && (
                      <div className="text-red-500">
                        Alerta: Vencimento em 3 dias!
                      </div>
                    )}
                </td>
                <td className="px-6 py-4 text-gray-300">{cliente.cpf}</td>
                <td className="px-6 py-4 text-gray-300">{cliente.email}</td>
                <td className="px-6 py-4 text-gray-300">
                  {formatarTelefone(cliente.telefone)}
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {cliente.valor_aluguel}
                </td>
                <td className="px-6 py-4 flex justify-center">
                  {!cliente.pago && (
                    <button
                      className="bg-red-500 text-white mx-2 py-1 px-2 rounded"
                      onClick={() => marcarComoPago(cliente.id)}
                    >
                      Não Pago
                    </button>
                  )}
                  <button className="text-yellow-500 mx-2">
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-500 mx-2"
                    onClick={() => handleDeleteCliente(cliente.id)}
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddClienteAluguel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCliente={handleAddCliente}
      />
    </div>
  );
};

export default ClienteAluguel;
