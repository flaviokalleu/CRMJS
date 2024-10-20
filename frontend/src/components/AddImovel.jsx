import React, { useState, useRef } from "react";
import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/imoveis";

const AddImovel = () => {
  const [nomeImovel, setNomeImovel] = useState("");
  const [descricaoImovel, setDescricaoImovel] = useState("");
  const [endereco, setEndereco] = useState("");
  const [tipo, setTipo] = useState("novo");
  const [quartos, setQuartos] = useState("");
  const [banheiro, setBanheiro] = useState("");
  const [tags, setTags] = useState([]);
  const [valorAvaliacao, setValorAvaliacao] = useState("");
  const [valorVenda, setValorVenda] = useState("");
  const [documentacao, setDocumentacao] = useState(null);
  const [imagens, setImagens] = useState([]);
  const [imagemCapa, setImagemCapa] = useState(null);
  const [localizacao, setLocalizacao] = useState("Valparaiso de Goiás - Goiás");
  const [exclusivo, setExclusivo] = useState("não");
  const [temInquilino, setTemInquilino] = useState("não");
  const [situacaoImovel, setSituacaoImovel] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [notification, setNotification] = useState("");
  const notificationRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("nome_imovel", nomeImovel);
    formData.append("descricao_imovel", descricaoImovel);
    formData.append("endereco", endereco);
    formData.append("tipo", tipo);
    formData.append("quartos", quartos);
    formData.append("banheiro", banheiro);
    formData.append("tags", tags);
    formData.append("valor_avaliacao", valorAvaliacao);
    formData.append("valor_venda", valorVenda);
    formData.append("documentacao", documentacao); // Campo de arquivo
    imagens.forEach((imagem) => {
      formData.append("imagens", imagem); // Campo de múltiplos arquivos
    });
    formData.append("imagem_capa", imagemCapa); // Campo de arquivo
    formData.append("localizacao", localizacao);
    formData.append("exclusivo", exclusivo);
    formData.append("tem_inquilino", temInquilino);
    formData.append("situacao_imovel", situacaoImovel);
    formData.append("observacoes", observacoes);

    try {
      const response = await axios.post(`${API_URL}/imoveis`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Imóvel adicionado:", response.data);
      setNotification("Imóvel adicionado com sucesso!");
      // Rolar para a notificação
      if (notificationRef.current) {
        notificationRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Erro ao adicionar imóvel:", error);
      setNotification("Erro ao adicionar imóvel. Tente novamente.");
      // Rolar para a notificação
      if (notificationRef.current) {
        notificationRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="p-8 text-white">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Adicionar Imóvel
        </h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg"
        >
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Nome do Imóvel
            </label>
            <input
              type="text"
              value={nomeImovel}
              onChange={(e) => setNomeImovel(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Descrição do Imóvel
            </label>
            <textarea
              value={descricaoImovel}
              onChange={(e) => setDescricaoImovel(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Endereço
            </label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Tipo
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="novo">Novo</option>
              <option value="usado">Usado</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Quartos
            </label>
            <input
              type="number"
              value={quartos}
              onChange={(e) => setQuartos(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Banheiro
            </label>
            <input
              type="number"
              value={banheiro}
              onChange={(e) => setBanheiro(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Tags
            </label>
            <select
              multiple
              value={tags}
              onChange={(e) =>
                setTags(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="100% Financiado">100% Financiado</option>
              <option value="Alto Padrão">Alto Padrão</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Duplex">Duplex</option>
              <option value="Em construção">Em construção</option>
              <option value="Exclusivos">Exclusivos</option>
              <option value="Melhores Ofertas">Melhores Ofertas</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Valor de Avaliação
            </label>
            <input
              type="text"
              value={valorAvaliacao}
              onChange={(e) => setValorAvaliacao(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Valor de Venda
            </label>
            <input
              type="text"
              value={valorVenda}
              onChange={(e) => setValorVenda(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Documentação
            </label>
            <input
              type="file"
              onChange={(e) => setDocumentacao(e.target.files[0])}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Imagens
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setImagens(Array.from(e.target.files))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Imagem de Capa
            </label>
            <input
              type="file"
              onChange={(e) => setImagemCapa(e.target.files[0])}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Localização
            </label>
            <select
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Valparaiso de Goiás - Goiás">
                Valparaíso de Goiás - Goiás
              </option>
              <option value="Cidade Ocidental - Goias">
                Cidade Ocidental - Goias
              </option>
              <option value="Luziania - Goias">Luziania - Goias</option>
              <option value="Jardim Inga - Goias">Jardim Inga - Goias</option>
              {/* Adicione mais opções conforme necessário */}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Exclusivo
            </label>
            <select
              value={exclusivo}
              onChange={(e) => setExclusivo(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="não">Não</option>
              <option value="sim">Sim</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Tem Inquilino
            </label>
            <select
              value={temInquilino}
              onChange={(e) => setTemInquilino(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="não">Não</option>
              <option value="sim">Sim</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Situação do Imóvel
            </label>
            <input
              type="text"
              value={situacaoImovel}
              onChange={(e) => setSituacaoImovel(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Observações
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Adicionar Imóvel
            </button>
          </div>
        </form>
        {/* Notificação */}
        {notification && (
          <div
            ref={notificationRef}
            className="mt-4 p-4 bg-blue-600 text-white rounded-lg"
          >
            {notification}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddImovel;
