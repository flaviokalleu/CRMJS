import React, { useState, useEffect } from "react";
import AddLembreteModal from "../components/AddLembreteModal";
import MainLayout from "../layouts/MainLayout";
import { FaEdit, FaTrashAlt, FaCheck } from "react-icons/fa";

const Lembretes = () => {
  const [lembretes, setLembretes] = useState([]);
  const [concluidos, setConcluidos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLembrete, setCurrentLembrete] = useState(null);
  const [error, setError] = useState(null);
  const [showConcluidos, setShowConcluidos] = useState(false);
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
          setLembretes(data.filter((lembrete) => !lembrete.concluido));
          setConcluidos(data.filter((lembrete) => lembrete.concluido));
        } else {
          setLembretes([]);
          setConcluidos([]);
        }
      } catch (error) {
        setLembretes([]);
        setConcluidos([]);
      }
    };

    fetchLembretes();
  }, [API_URL]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  const handleEdit = (lembrete) => {
    setCurrentLembrete(lembrete);
    setIsModalOpen(true);
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
        setLembretes(lembretes.filter((lembrete) => lembrete.id !== id));
        setConcluidos(concluidos.filter((lembrete) => lembrete.id !== id));
      } catch (error) {
        setError("Erro ao excluir lembrete. Tente novamente.");
      }
    }
  };

  const handleConcluir = async (id) => {
    const lembreteConcluido = lembretes.find((l) => l.id === id);
    if (lembreteConcluido) {
      try {
        await fetch(`${API_URL}/lembretes/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "concluido" }),
        });

        setConcluidos((prev) => [
          ...prev,
          { ...lembreteConcluido, concluido: true },
        ]);
        setLembretes(lembretes.filter((l) => l.id !== id));
      } catch (error) {
        setError("Erro ao concluir lembrete. Tente novamente.");
      }
    }
  };

  // Atualização para adicionar ou editar lembrete na lista
  const handleAddOrUpdateLembrete = (lembrete) => {
    if (lembrete.concluido) {
      setConcluidos((prev) => {
        const exists = prev.find((l) => l.id === lembrete.id);
        if (exists) {
          return prev.map((l) => (l.id === lembrete.id ? lembrete : l));
        }
        return [...prev, lembrete];
      });
      setLembretes((prev) => prev.filter((l) => l.id !== lembrete.id));
    } else {
      setLembretes((prev) => {
        const exists = prev.find((l) => l.id === lembrete.id);
        if (exists) {
          return prev.map((l) => (l.id === lembrete.id ? lembrete : l));
        }
        return [...prev, lembrete];
      });
      setConcluidos((prev) => prev.filter((l) => l.id !== lembrete.id));
    }
    setIsModalOpen(false);
    setCurrentLembrete(null);
  };

  return (
    <MainLayout>
      <div className="min-h-screen w-full p-6 bg-gradient-to-br from-blue-950 via-blue-900 to-black">
        <h1 className="text-3xl font-bold mb-6 text-white text-center">
          Lembretes
        </h1>
        <button
          onClick={() => {
            setCurrentLembrete(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-700 text-white rounded-lg py-2 px-4 mb-6 block mx-auto shadow-md hover:bg-blue-800 transition duration-300"
        >
          Adicionar Lembrete
        </button>
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        <div className="flex justify-center mb-4 gap-2">
          <button
            onClick={() => setShowConcluidos(false)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              !showConcluidos
                ? "bg-blue-700 text-white shadow"
                : "bg-blue-900 text-blue-200"
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setShowConcluidos(true)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              showConcluidos
                ? "bg-blue-700 text-white shadow"
                : "bg-blue-900 text-blue-200"
            }`}
          >
            Concluídos
          </button>
        </div>
        <div className="relative overflow-x-auto w-full rounded-xl shadow-lg">
          <table className="min-w-full text-sm text-left text-blue-100 bg-blue-950 rounded-xl">
            <thead className="text-xs text-blue-300 uppercase bg-blue-900">
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
                  className="bg-blue-900 border-b border-blue-950/60 hover:bg-blue-800 transition duration-300"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-white whitespace-nowrap"
                  >
                    {lembrete.titulo}
                  </th>
                  <td className="px-6 py-4 text-blue-100">
                    {lembrete.descricao}
                  </td>
                  <td className="px-6 py-4 text-blue-200">
                    {formatDate(lembrete.data)}
                  </td>
                  <td className="px-6 py-4 flex space-x-4">
                    {!showConcluidos && (
                      <>
                        <button
                          onClick={() => handleEdit(lembrete)}
                          className="text-blue-400 hover:text-blue-300 transition"
                          title="Editar"
                        >
                          <FaEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(lembrete.id)}
                          className="text-red-400 hover:text-red-300 transition"
                          title="Excluir"
                        >
                          <FaTrashAlt size={20} />
                        </button>
                        <button
                          onClick={() => handleConcluir(lembrete.id)}
                          className="text-green-400 hover:text-green-300 transition"
                          title="Concluir"
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
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCurrentLembrete(null);
          }}
          onAddLembrete={handleAddOrUpdateLembrete}
          currentLembrete={currentLembrete}
        />
      </div>
    </MainLayout>
  );
};

export default Lembretes;
