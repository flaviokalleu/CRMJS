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
      setFotoAdicional(files);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-black text-white">
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="bg-blue-950/90 p-8 rounded-2xl shadow-2xl w-full max-w-xl border border-blue-900/40"
      >
        <h2 className="text-3xl font-extrabold mb-8 text-center tracking-tight text-white">
          Adicionar Novo Aluguel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-2">
              Nome do Imóvel
            </label>
            <input
              type="text"
              name="nome_imovel"
              value={formData.nome_imovel}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
              placeholder="Nome do Imóvel"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-2">Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition min-h-[48px]"
              placeholder="Descrição"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Valor do Aluguel
            </label>
            <input
              type="number"
              name="valor_aluguel"
              value={formData.valor_aluguel}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
              placeholder="Valor do Aluguel"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Quartos</label>
            <input
              type="number"
              name="quartos"
              value={formData.quartos}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
              placeholder="Número de Quartos"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Banheiro</label>
            <input
              type="number"
              name="banheiro"
              value={formData.banheiro}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
              placeholder="Número de Banheiros"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Dia do Vencimento
            </label>
            <input
              type="number"
              name="dia_vencimento"
              value={formData.dia_vencimento}
              onChange={handleChange}
              required
              min={1}
              max={31}
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
              placeholder="Dia do vencimento"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Foto de Capa
            </label>
            <input
              type="file"
              name="fotoCapa"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-white file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Fotos Adicionais
            </label>
            <input
              type="file"
              name="fotoAdicional"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full text-white file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-600"
            />
          </div>
        </div>
        {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-8 py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 ${
            loading
              ? "bg-blue-700/60 opacity-60 cursor-not-allowed text-white"
              : "bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white"
          }`}
        >
          {loading ? "Enviando..." : "Adicionar Aluguel"}
        </button>
      </form>
    </div>
  );
};

export default AddAluguelForm;
