import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/";

const AlugueisPage = () => {
  const [alugueis, setAlugueis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlugueis = async () => {
      try {
        const response = await fetch(`${API_URL}/alugueis`);
        if (!response.ok) {
          throw new Error("Erro ao buscar aluguéis");
        }
        const data = await response.json();
        setAlugueis(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlugueis();
  }, []);

  const handleDownloadAll = async (aluguelId) => {
    console.log("Iniciando download de todas as imagens...");
    try {
      const response = await fetch(`${API_URL}/alugueis/${aluguelId}/download`);
      if (!response.ok) {
        console.error("Erro ao baixar o arquivo ZIP:", response.statusText);
        throw new Error("Erro ao baixar o arquivo ZIP");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fotos.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log("Download concluído com sucesso.");
    } catch (error) {
      console.error("Erro ao baixar o arquivo ZIP:", error);
    }
  };

  const handleToggleRentStatus = async (aluguelId, currentStatus) => {
    console.log(`Atualizando status de aluguel para ${!currentStatus}...`);
    try {
      const response = await fetch(`${API_URL}/alugueis/${aluguelId}/alugado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alugado: !currentStatus }),
      });
      if (!response.ok) {
        console.error(
          "Erro ao atualizar o status do imóvel:",
          response.statusText
        );
        throw new Error("Erro ao atualizar o status do imóvel");
      }
      setAlugueis((prevAlugueis) =>
        prevAlugueis.map((aluguel) =>
          aluguel.id === aluguelId
            ? { ...aluguel, alugado: !currentStatus }
            : aluguel
        )
      );
      console.log("Status de aluguel atualizado com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar o status do imóvel:", error);
    }
  };

  const handleDelete = async (aluguelId) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja deletar este imóvel?"
    );
    if (confirmed) {
      console.log("Iniciando a exclusão do imóvel...");
      try {
        const response = await fetch(`${API_URL}/alugueis/${aluguelId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          console.error("Erro ao deletar o imóvel:", response.statusText);
          throw new Error("Erro ao deletar o imóvel");
        }
        setAlugueis((prevAlugueis) =>
          prevAlugueis.filter((aluguel) => aluguel.id !== aluguelId)
        );
        console.log("Imóvel deletado com sucesso.");
      } catch (error) {
        console.error("Erro ao deletar o imóvel:", error);
      }
    } else {
      console.log("Exclusão do imóvel cancelada pelo usuário.");
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Todos os Aluguéis</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {alugueis.map((aluguel) => (
          <div
            key={aluguel.id}
            className="relative bg-gray-900 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
          >
            {aluguel.foto_capa && (
              <div className="relative">
                <img
                  src={`${API_URL}/uploads/alugueis/capa/${aluguel.foto_capa}`}
                  alt={aluguel.nome_imovel}
                  className="w-full h-64 object-cover rounded-t-lg mb-4"
                />
                {aluguel.alugado && (
                  <div className="absolute top-0 left-0 bg-red-600 text-white px-4 py-2 text-lg font-bold rounded-br-lg">
                    Alugado
                  </div>
                )}
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2">{aluguel.nome_imovel}</h2>
            <p className="text-gray-300 mb-2">{aluguel.descricao}</p>
            <p className="text-gray-200 mb-2">
              Valor: R${aluguel.valor_aluguel.toFixed(2)}
            </p>
            <p className="text-gray-300 mb-2">Quartos: {aluguel.quartos}</p>
            <p className="text-gray-300">Banheiros: {aluguel.banheiro}</p>

            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => handleDownloadAll(aluguel.id)}
                className="px-5 py-3 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 transition-colors duration-300"
              >
                Baixar Todas as Imagens
              </button>
              <button
                onClick={() =>
                  handleToggleRentStatus(aluguel.id, aluguel.alugado)
                }
                className={`px-5 py-3 ${
                  aluguel.alugado
                    ? "bg-red-700 hover:bg-red-800"
                    : "bg-green-700 hover:bg-green-800"
                } text-white rounded-lg shadow transition-colors duration-300`}
              >
                {aluguel.alugado ? "Desocupar" : "Alugar"}
              </button>
              <button
                onClick={() => handleDelete(aluguel.id)}
                className="px-5 py-3 bg-red-700 text-white rounded-lg shadow hover:bg-red-800 transition-colors duration-300"
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlugueisPage;
