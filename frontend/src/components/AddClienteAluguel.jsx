// src/components/AddClienteAluguel.jsx
import React, { useState } from "react";

const AddClienteAluguel = ({ isOpen, onClose, onAddCliente }) => {
  const [cliente, setCliente] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    valor_aluguel: "",
    dia_vencimento: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Formatação do CPF
    if (name === "cpf") {
      const formattedCpf = value
        .replace(/\D/g, "") // Remove todos os caracteres não numéricos
        .replace(/(\d{3})(\d)/, "$1.$2") // Adiciona ponto após os três primeiros dígitos
        .replace(/(\d{3})(\d)/, "$1.$2") // Adiciona ponto após os três seguintes
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Adiciona hífen antes dos últimos dois dígitos
      setCliente((prev) => ({ ...prev, cpf: formattedCpf }));
    } else if (name === "telefone") {
      // Formatação do Telefone
      const formattedTelefone = value
        .replace(/\D/g, "") // Remove todos os caracteres não numéricos
        .replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4"); // Formata como (61) 9 9608-0740
      setCliente((prev) => ({
        ...prev,
        telefone: formattedTelefone,
      }));
    } else {
      setCliente((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Remover a formatação do telefone antes de enviar para o servidor
      const telefoneSemFormato = cliente.telefone.replace(/\D/g, "");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clientealuguel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...cliente,
            telefone: telefoneSemFormato, // Enviar telefone sem formatação
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao adicionar cliente");
      }
      const data = await response.json();
      onAddCliente(data); // Passa o cliente adicionado para o componente pai
      onClose(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl mb-4 text-white">
          Adicionar Cliente de Aluguel
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={cliente.nome}
            onChange={handleChange}
            required
            className="mb-4 p-2 rounded bg-gray-700 text-white w-full"
          />
          <input
            type="text"
            name="cpf"
            placeholder="CPF"
            value={cliente.cpf}
            onChange={handleChange}
            required
            className="mb-4 p-2 rounded bg-gray-700 text-white w-full"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={cliente.email}
            onChange={handleChange}
            required
            className="mb-4 p-2 rounded bg-gray-700 text-white w-full"
          />
          <input
            type="text"
            name="telefone"
            placeholder="Telefone"
            value={cliente.telefone}
            onChange={handleChange}
            required
            className="mb-4 p-2 rounded bg-gray-700 text-white w-full"
          />
          <input
            type="number"
            name="valor_aluguel"
            placeholder="Valor do Aluguel"
            value={cliente.valor_aluguel}
            onChange={handleChange}
            required
            className="mb-4 p-2 rounded bg-gray-700 text-white w-full"
          />
          <input
            type="number"
            name="dia_vencimento"
            placeholder="Dia do Vencimento"
            value={cliente.dia_vencimento}
            onChange={handleChange}
            required
            className="mb-4 p-2 rounded bg-gray-700 text-white w-full"
          />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white rounded-lg py-2 px-4"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg py-2 px-4"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClienteAluguel;
