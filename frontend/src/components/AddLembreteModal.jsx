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
    const dataHoraUTC = toZonedTime(dataHora, "America/Sao_Paulo");
    const lembreteData = {
      titulo,
      descricao,
      data: dataHoraUTC.toISOString(),
    };

    if (currentLembrete) {
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-60">
      <div className="relative w-full max-w-md">
        <div className="relative bg-gradient-to-br from-blue-900 via-blue-950 to-black rounded-2xl shadow-2xl border border-blue-900/40">
          {/* Modal header */}
          <div className="flex items-center justify-between p-5 border-b border-blue-900/40 rounded-t">
            <h3 className="text-xl font-bold text-white">
              {currentLembrete ? "Editar Lembrete" : "Adicionar Lembrete"}
            </h3>
            <button
              type="button"
              className="text-blue-200 hover:bg-blue-900/40 hover:text-white rounded-lg text-sm w-8 h-8 flex justify-center items-center"
              onClick={onClose}
            >
              <svg
                className="w-4 h-4"
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
          <form className="p-6" onSubmit={handleSubmit}>
            <div className="grid gap-5">
              <div>
                <label
                  htmlFor="titulo"
                  className="block mb-2 text-sm font-semibold text-white"
                >
                  Título
                </label>
                <input
                  type="text"
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="bg-blue-900/60 border border-blue-800/40 text-white text-base rounded-lg focus:ring-blue-500 focus:border-blue-400 block w-full p-3 placeholder:text-white/60"
                  placeholder="Digite o título do lembrete"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="descricao"
                  className="block mb-2 text-sm font-semibold text-white"
                >
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="bg-blue-900/60 border border-blue-800/40 text-white text-base rounded-lg focus:ring-blue-500 focus:border-blue-400 block w-full p-3 placeholder:text-white/60 min-h-[60px]"
                  placeholder="Digite a descrição do lembrete"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="dataHora"
                  className="block mb-2 text-sm font-semibold text-white"
                >
                  Data e Hora
                </label>
                <input
                  type="datetime-local"
                  id="dataHora"
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                  className="bg-blue-900/60 border border-blue-800/40 text-white text-base rounded-lg focus:ring-blue-500 focus:border-blue-400 block w-full p-3 placeholder:text-white/60"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 w-full p-3 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 font-bold text-lg shadow-lg transition-all duration-200 text-white"
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
