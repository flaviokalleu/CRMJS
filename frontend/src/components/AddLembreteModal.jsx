import React, { useState, useEffect } from "react";
import { format, toZonedTime } from "date-fns-tz";

const AddLembreteModal = ({
  isOpen,
  onClose,
  onAddLembrete,
  currentLembrete,
}) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataHora, setDataHora] = useState("");
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (currentLembrete) {
      setTitulo(currentLembrete.titulo);
      setDescricao(currentLembrete.descricao);
      // Formata a data para datetime-local, sempre em UTC-3
      const localDate = toZonedTime(currentLembrete.data, "America/Sao_Paulo");
      setDataHora(format(localDate, "yyyy-MM-dd'T'HH:mm"));
    } else {
      setTitulo("");
      setDescricao("");
      setDataHora("");
    }
  }, [currentLembrete]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Converte data e hora para UTC para salvar no servidor
    const dataHoraUTC = toZonedTime(dataHora, "America/Sao_Paulo"); // Converte para o horário de Brasília
    const lembreteData = {
      titulo,
      descricao,
      // Armazena como UTC, considerando que toZonedTime não altera o formato
      data: dataHoraUTC.toISOString(),
    };

    if (currentLembrete) {
      // Atualizar lembrete existente
      const response = await fetch(
        `${API_URL}/lembretes/${currentLembrete.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lembreteData),
        }
      );
      const updatedLembrete = await response.json();
      onAddLembrete(updatedLembrete);
    } else {
      // Criar novo lembrete
      const response = await fetch(`${API_URL}/lembretes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lembreteData),
      });
      const newLembrete = await response.json();
      onAddLembrete(newLembrete);
    }
    onClose(); // Fecha o modal após adicionar/editar
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
      <div className="relative p-4 w-full max-w-md">
        {/* Modal content */}
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentLembrete ? "Editar Lembrete" : "Adicionar Lembrete"}
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={onClose}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Fechar modal</span>
            </button>
          </div>
          {/* Modal body */}
          <form className="p-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 mb-4">
              <div className="col-span-2">
                <label
                  htmlFor="titulo"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Título
                </label>
                <input
                  type="text"
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Digite o título do lembrete"
                  required
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="descricao"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Descrição
                </label>
                <input
                  type="text"
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Digite a descrição do lembrete"
                  required
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="dataHora"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Data e Hora
                </label>
                <input
                  type="datetime-local"
                  id="dataHora"
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              {currentLembrete ? "Atualizar" : "Adicionar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLembreteModal;
