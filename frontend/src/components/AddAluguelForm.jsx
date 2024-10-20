import React, { useState } from "react";
import axios from "axios";

export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/";

const AddAluguelForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    nome_imovel: "",
    descricao: "",
    valor_aluguel: "",
    quartos: "",
    banheiro: "",
    dia_vencimento: "",
  });
  const [fotoCapa, setFotoCapa] = useState(null);
  const [fotoAdicional, setFotoAdicional] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "fotoCapa") {
      setFotoCapa(files[0]);
    } else if (name === "fotoAdicional") {
      setFotoAdicional(files); // Mude para 'files' para pegar todos os arquivos
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formDataToSend = new FormData();
    formDataToSend.append("nome_imovel", formData.nome_imovel);
    formDataToSend.append("descricao", formData.descricao);
    formDataToSend.append("valor_aluguel", formData.valor_aluguel);
    formDataToSend.append("quartos", formData.quartos);
    formDataToSend.append("banheiro", formData.banheiro);
    formDataToSend.append("dia_vencimento", formData.dia_vencimento);
    if (fotoCapa) formDataToSend.append("fotoCapa", fotoCapa);
    if (fotoAdicional) {
      Array.from(fotoAdicional).forEach((file) =>
        formDataToSend.append("fotoAdicional", file)
      );
    }

    try {
      await axios.post(`${API_URL}/alugueis`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onSuccess();
    } catch (error) {
      setError("Erro ao enviar o formulário");
      console.error("Erro ao enviar o formulário:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg"
      >
        <h2 className="text-2xl font-semibold mb-6">Adicionar Novo Aluguel</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nome do Imóvel
            </label>
            <input
              type="text"
              name="nome_imovel"
              value={formData.nome_imovel}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-md border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do Imóvel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-md border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrição"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Valor do Aluguel
            </label>
            <input
              type="number"
              name="valor_aluguel"
              value={formData.valor_aluguel}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-md border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Valor do Aluguel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quartos</label>
            <input
              type="number"
              name="quartos"
              value={formData.quartos}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-md border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Número de Quartos"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Banheiro</label>
            <input
              type="number"
              name="banheiro"
              value={formData.banheiro}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-md border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Número de Banheiros"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Foto de Capa
            </label>
            <input
              type="file"
              name="fotoCapa"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-gray-400 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Fotos Adicionais
            </label>
            <input
              type="file"
              name="fotoAdicional"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full text-gray-400 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
          {error && <p className="mt-4 text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold ${
              loading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAluguelForm;
