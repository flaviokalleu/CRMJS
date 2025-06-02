import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalEditarImovel from "./ModalEditarImovel";
import { useAuth } from "../context/AuthContext";
import { FaEdit, FaTrashAlt, FaDownload } from "react-icons/fa";

const ListaImoveis = () => {
  const { user } = useAuth();
  const [imoveis, setImoveis] = useState([]);
  const [imovelSelecionado, setImovelSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchImoveis = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/imoveis`
        );
        setImoveis(response.data);
      } catch (error) {
        console.error("Erro ao buscar imóveis:", error);
      }
    };

    fetchImoveis();
  }, []);

  const handleEdit = (imovel) => {
    if (user.role !== "corretor") {
      setImovelSelecionado(imovel);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id) => {
    if (user.role !== "corretor") {
      axios
        .delete(`${process.env.REACT_APP_API_URL}/imoveis/${id}`)
        .then(() => {
          setImoveis(imoveis.filter((imovel) => imovel.id !== id));
        })
        .catch((error) => console.error("Erro ao deletar imóvel:", error));
    }
  };

  const handleDownload = (id) => {
    window.location.href = `${process.env.REACT_APP_API_URL}/imoveis/${id}/download-imagens`;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setImovelSelecionado(null);
  };

  const handleUpdate = (updatedImovel) => {
    setImoveis(
      imoveis.map((imovel) =>
        imovel.id === updatedImovel.id ? updatedImovel : imovel
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black py-8 px-2">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-10 text-center tracking-tight drop-shadow-lg">
          Lista de Imóveis
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {imoveis.map((imovel) => (
            <div
              key={imovel.id}
              className="bg-blue-950/80 border border-blue-900/40 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
            >
              <img
                src={`${process.env.REACT_APP_API_URL}/${imovel.imagem_capa}`}
                alt={imovel.nome}
                className="w-full h-48 object-cover rounded-t-2xl"
              />
              <div className="flex-1 flex flex-col p-5">
                <h2 className="text-lg font-bold text-white mb-2 truncate">
                  {imovel.nome}
                </h2>
                <p className="text-blue-100/90 text-sm mb-4 line-clamp-3">
                  {imovel.descricao}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-blue-800/60 text-blue-100 px-2 py-1 rounded text-xs font-semibold">
                    {imovel.tipo?.toUpperCase() || "TIPO"}
                  </span>
                  <span className="bg-blue-900/60 text-blue-100 px-2 py-1 rounded text-xs font-semibold">
                    {imovel.localizacao}
                  </span>
                  <span className="bg-blue-900/60 text-blue-100 px-2 py-1 rounded text-xs font-semibold">
                    {imovel.quartos} quarto(s)
                  </span>
                  <span className="bg-blue-900/60 text-blue-100 px-2 py-1 rounded text-xs font-semibold">
                    {imovel.banheiro} banheiro(s)
                  </span>
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-blue-200 text-sm">
                    Valor Avaliação:{" "}
                    <span className="font-bold">
                      {Number(imovel.valor_avaliacao).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </span>
                  <span className="text-blue-200 text-sm">
                    Valor Venda:{" "}
                    <span className="font-bold">
                      {Number(imovel.valor_venda).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </span>
                </div>
                <div className="flex gap-2 mt-auto">
                  {user && user.role !== "corretor" && (
                    <>
                      <button
                        onClick={() => handleEdit(imovel)}
                        className="flex items-center gap-1 bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition"
                        title="Editar"
                      >
                        <FaEdit />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      <button
                        onClick={() => handleDelete(imovel.id)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition"
                        title="Deletar"
                      >
                        <FaTrashAlt />
                        <span className="hidden sm:inline">Deletar</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDownload(imovel.id)}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition"
                    title="Baixar imagens"
                  >
                    <FaDownload />
                    <span className="hidden sm:inline">Baixar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isModalOpen && (
        <ModalEditarImovel
          imovel={imovelSelecionado}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default ListaImoveis;
