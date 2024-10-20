import React, { useState, useEffect } from "react";
import AddLembreteModal from "../components/AddLembreteModal"; // Mantém o modal
import MainLayout from "../layouts/MainLayout"; // Importa o MainLayout
import { FaEdit, FaTrashAlt, FaCheck } from "react-icons/fa"; // Importa ícones do React Icons

const Lembretes = () => {
  const [lembretes, setLembretes] = useState([]);
  const [concluidos, setConcluidos] = useState([]); // Estado para lembretes concluídos
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controle do modal
  const [currentLembrete, setCurrentLembrete] = useState(null); // Estado para o lembrete atual
  const [error, setError] = useState(null);
  const [showConcluidos, setShowConcluidos] = useState(false); // Estado para controle da aba
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchLembretes = async () => {
      try {
        const response = await fetch(`${API_URL}/lembretes`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          // Filtra os lembretes ativos e concluídos
          setLembretes(data.filter((lembrete) => !lembrete.concluido));
          setConcluidos(data.filter((lembrete) => lembrete.concluido));
        } else {
          console.error("Data is not an array:", data);
          setLembretes([]);
          setConcluidos([]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setLembretes([]);
        setConcluidos([]);
      }
    };

    fetchLembretes();
  }, [API_URL]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleEdit = (lembrete) => {
    setCurrentLembrete(lembrete); // Define o lembrete atual para edição
    setIsModalOpen(true); // Abre o modal
  };

  const handleDelete = async (id) => {
    if (window.confirm("Você realmente deseja excluir este lembrete?")) {
      try {
        const response = await fetch(`${API_URL}/lembretes/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Erro ao excluir lembrete");
        }
        // Atualiza a lista de lembretes
        setLembretes(lembretes.filter((lembrete) => lembrete.id !== id));
        setConcluidos(concluidos.filter((lembrete) => lembrete.id !== id)); // Remove também da lista de concluídos
      } catch (error) {
        console.error("Erro ao excluir lembrete:", error);
        setError("Erro ao excluir lembrete. Tente novamente.");
      }
    }
  };

  const handleConcluir = async (id) => {
    const lembreteConcluido = lembretes.find((l) => l.id === id);
    if (lembreteConcluido) {
      try {
        // Atualiza o lembrete no banco de dados
        await fetch(`${API_URL}/lembretes/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "concluido" }), // Atualiza o status para concluído
        });

        // Adiciona o lembrete à lista de concluídos e remove da lista de lembretes ativos
        setConcluidos((prev) => [
          ...prev,
          { ...lembreteConcluido, concluido: true }, // Atualiza o status para 'concluido' no objeto
        ]);
        setLembretes(lembretes.filter((l) => l.id !== id)); // Remove da lista de lembretes
      } catch (error) {
        console.error("Erro ao atualizar lembrete:", error);
        setError("Erro ao concluir lembrete. Tente novamente.");
      }
    }
  };

  return (
    <MainLayout>
      <div className="h-screen w-full p-6 bg-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-white text-center">
          Lembretes
        </h1>
        <button
          onClick={() => {
            setCurrentLembrete(null); // Reseta o lembrete atual ao abrir o modal
            setIsModalOpen(true); // Abre o modal
          }}
          className="bg-blue-600 text-white rounded-lg py-2 px-4 mb-6 block mx-auto shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
        >
          Adicionar Lembrete
        </button>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowConcluidos(false)}
            className={`px-4 py-2 rounded-lg ${
              !showConcluidos
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setShowConcluidos(true)}
            className={`px-4 py-2 rounded-lg ${
              showConcluidos
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Concluídos
          </button>
        </div>
        <div className="relative overflow-x-auto w-full">
          <table className="min-w-full text-sm text-left text-gray-400 bg-gray-900 rounded-lg shadow-lg">
            <thead className="text-xs text-gray-500 uppercase bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Título
                </th>
                <th scope="col" className="px-6 py-3">
                  Descrição
                </th>
                <th scope="col" className="px-6 py-3">
                  Data
                </th>
                <th scope="col" className="px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {(showConcluidos ? concluidos : lembretes).map((lembrete) => (
                <tr
                  key={lembrete.id}
                  className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700 transition duration-300"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap"
                  >
                    {lembrete.titulo}
                  </th>
                  <td className="px-6 py-4 text-gray-300">
                    {lembrete.descricao}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {formatDate(lembrete.data)}
                  </td>
                  <td className="px-6 py-4 flex space-x-4">
                    {!showConcluidos && (
                      <>
                        <button
                          onClick={() => handleEdit(lembrete)} // Chama a função de edição
                          className="text-blue-400 hover:text-blue-500 transition"
                        >
                          <FaEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(lembrete.id)} // Chama a função de exclusão
                          className="text-red-400 hover:text-red-500 transition"
                        >
                          <FaTrashAlt size={20} />
                        </button>
                        <button
                          onClick={() => handleConcluir(lembrete.id)} // Chama a função de concluir
                          className="text-green-400 hover:text-green-500 transition"
                        >
                          <FaCheck size={20} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddLembreteModal
          isOpen={isModalOpen} // Passa o estado do modal
          onClose={() => {
            setIsModalOpen(false); // Fecha o modal
            setCurrentLembrete(null); // Reseta o lembrete atual
          }}
          onAddLembrete={(lembrete) => {
            setLembretes((prev) => [...prev, lembrete]); // Atualiza a lista de lembretes com o novo lembrete
            setIsModalOpen(false); // Fecha o modal
          }}
          currentLembrete={currentLembrete} // Passa o lembrete atual para edição
        />
      </div>
    </MainLayout>
  );
};

export default Lembretes;
