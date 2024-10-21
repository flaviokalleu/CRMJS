import React, { useState, useRef } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners"; // Biblioteca para spinner

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
  const [loading, setLoading] = useState(false); // Estado para controlar o spinner
  const notificationRef = useRef(null);

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleCurrencyChange = (setter, value) => {
    const numericValue = value.replace(/\D/g, "");
    setter(numericValue ? (numericValue / 100).toFixed(2) : "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Inicia o spinner ao enviar o formulário

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
    formData.append("documentacao", documentacao);
    imagens.forEach((imagem) => {
      formData.append("imagens", imagem);
    });
    formData.append("imagem_capa", imagemCapa);
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
      setLoading(false); // Para o spinner
      setNotification("Imóvel adicionado com sucesso!");
      if (notificationRef.current) {
        notificationRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      setLoading(false); // Para o spinner
      setNotification("Erro ao adicionar imóvel. Tente novamente.");
      if (notificationRef.current) {
        notificationRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleDocumentacaoChange = (event) => {
    setDocumentacao(event.target.files[0]);
  };

  const handleImagensChange = (event) => {
    setImagens([...event.target.files]);
  };

  const handleImagemCapaChange = (event) => {
    setImagemCapa(event.target.files[0]);
  };

  return (
    <div className="bg-gray-900 min-h-screen py-8">
      <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Adicionar Imóvel
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
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
              <label className="block text-sm font-medium text-gray-400 mb-1">
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
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
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
              <label className="block text-sm font-medium text-gray-400 mb-1">
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
                <option value="agio">Ágio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
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
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Banheiros
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
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Tags
              </label>
              <select
                multiple
                value={tags}
                onChange={(e) =>
                  setTags(
                    Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    )
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
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Valor de Avaliação
              </label>
              <input
                type="text"
                value={formatCurrency(valorAvaliacao)}
                onChange={(e) =>
                  handleCurrencyChange(setValorAvaliacao, e.target.value)
                }
                className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Valor de Venda
              </label>
              <input
                type="text"
                value={formatCurrency(valorVenda)}
                onChange={(e) =>
                  handleCurrencyChange(setValorVenda, e.target.value)
                }
                className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Documentação
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleDocumentacaoChange}
                className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Imagens (Múltiplas)
              </label>
              <input
                type="file"
                multiple
                onChange={handleImagensChange}
                className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Imagem Capa
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImagemCapaChange}
                className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
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
              <label className="block text-sm font-medium text-gray-400 mb-1">
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
              <label className="block text-sm font-medium text-gray-400 mb-1">
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
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Observações
              </label>
              <select
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma observação</option>
                <option value="Próximo ao Centro">Próximo ao Centro</option>
                <option value="Próximo à Escola">Próximo à Escola</option>
                <option value="Próximo ao Comércio">Próximo ao Comércio</option>
                <option value="Próximo a Transporte Público">
                  Próximo a Transporte Público
                </option>
                <option value="Aceita Financiamento">
                  Aceita Financiamento
                </option>
                <option value="Reformado">Reformado</option>
                <option value="Com Lazer">Com Lazer</option>
                <option value="Garagem">Garagem</option>
                <option value="Jardim">Jardim</option>
                <option value="Área Privativa">Área Privativa</option>
                <option value="Alugado">Alugado</option>
                <option value="Em Construção">Em Construção</option>
                <option value="Próximo a Área Verde">
                  Próximo a Área Verde
                </option>
                <option value="Próximo a Shopping">Próximo a Shopping</option>
                <option value="Próximo a Farmácia">Próximo a Farmácia</option>
                <option value="Economicamente Acessível">
                  Economicamente Acessível
                </option>
                <option value="Sem Taxas de Condomínio">
                  Sem Taxas de Condomínio
                </option>
                <option value="Próximo a Mercado">Próximo a Mercado</option>
                <option value="Boa Iluminação Natural">
                  Boa Iluminação Natural
                </option>
                <option value="Área de Serviço">Área de Serviço</option>
                <option value="Cozinha Americana">Cozinha Americana</option>
                <option value="Sem Necessidade de Reforma">
                  Sem Necessidade de Reforma
                </option>
                <option value="Ideal para Família">Ideal para Família</option>
                <option value="Aceita Animais de Estimação">
                  Aceita Animais de Estimação
                </option>
                <option value="Com Segurança 24h">Com Segurança 24h</option>
                <option value="Próximo a Praça">Próximo a Praça</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          <div ref={notificationRef}>
            {notification && (
              <div className="mt-4 p-4 bg-blue-600 text-white rounded-md">
                {notification}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <ClipLoader color="#ffffff" loading={loading} size={20} />
            ) : (
              "Adicionar Imóvel"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddImovel;
