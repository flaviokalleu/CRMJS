import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalEditarImovel from "./ModalEditarImovel"; // Importe o modal
import { useAuth } from "../context/AuthContext"; // Importe o hook de autenticação

const ListaImoveis = () => {
  const { user } = useAuth(); // Obtém o usuário do contexto
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
      // Permite editar apenas se o usuário não for corretor
      setImovelSelecionado(imovel);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id) => {
    if (user.role !== "corretor") {
      // Permite deletar apenas se o usuário não for corretor
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
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Lista de Imóveis</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {imoveis.map((imovel) => (
            <div
              key={imovel.id}
              className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={`${process.env.REACT_APP_API_URL}/${imovel.imagem_capa}`}
                alt={imovel.nome}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-lg font-semibold mb-2">{imovel.nome}</h2>
              <p className="text-gray-400 mb-4">{imovel.descricao}</p>
              <div className="flex gap-2 justify-between">
                {user &&
                  user.role !== "corretor" && ( // Verifique se o usuário não é corretor
                    <>
                      <button
                        onClick={() => handleEdit(imovel)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(imovel.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Deletar
                      </button>
                    </>
                  )}
                <button
                  onClick={() => handleDownload(imovel.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Baixar
                </button>
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
