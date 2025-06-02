import React, { useState, useRef } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";

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
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

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
      await axios.post(`${API_URL}/imoveis`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setLoading(false);
      setNotification("Imóvel adicionado com sucesso!");
      if (notificationRef.current) {
        notificationRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      setLoading(false);
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
    <div className="bg-gradient-to-br from-blue-950 via-gray-900 to-black min-h-screen py-10">
      <div className="max-w-4xl mx-auto p-8 bg-blue-950/80 rounded-2xl shadow-2xl border border-blue-900/40">
        <h1 className="text-4xl font-extrabold text-white text-center mb-8 tracking-tight">
          Cadastro de Imóvel
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome do Imóvel */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Nome do Imóvel
              </label>
              <input
                type="text"
                value={nomeImovel}
                onChange={(e) => setNomeImovel(e.target.value)}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                placeholder="Ex: Residencial Jardim Europa"
                required
              />
            </div>
            {/* Tipo */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition"
                required
              >
                <option value="novo">Novo</option>
                <option value="usado">Usado</option>
                <option value="agio">Ágio</option>
              </select>
            </div>
            {/* Descrição */}
            <div className="md:col-span-2">
              <label className="block text-white font-semibold mb-2">
                Descrição do Imóvel
              </label>
              <textarea
                value={descricaoImovel}
                onChange={(e) => setDescricaoImovel(e.target.value)}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                rows="3"
                placeholder="Descreva detalhes, diferenciais e características do imóvel"
              />
            </div>
            {/* Endereço */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                placeholder="Rua, número, bairro"
              />
            </div>
            {/* Localização */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Localização
              </label>
              <select
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition"
              >
                <option value="Valparaiso de Goiás - Goiás">
                  Valparaíso de Goiás - Goiás
                </option>
                <option value="Cidade Ocidental - Goias">
                  Cidade Ocidental - Goias
                </option>
                <option value="Luziania - Goias">Luziania - Goias</option>
                <option value="Jardim Inga - Goias">Jardim Inga - Goias</option>
              </select>
            </div>
            {/* Quartos */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Quartos
              </label>
              <input
                type="number"
                value={quartos}
                onChange={(e) => setQuartos(e.target.value)}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                placeholder="Ex: 3"
                required
              />
            </div>
            {/* Banheiros */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Banheiros
              </label>
              <input
                type="number"
                value={banheiro}
                onChange={(e) => setBanheiro(e.target.value)}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                placeholder="Ex: 2"
                required
              />
            </div>
            {/* Tags */}
            <div>
              <label className="block text-white font-semibold mb-2">
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
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition"
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
            {/* Valor de Avaliação */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Valor de Avaliação
              </label>
              <input
                type="text"
                value={formatCurrency(valorAvaliacao)}
                onChange={(e) =>
                  handleCurrencyChange(setValorAvaliacao, e.target.value)
                }
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                placeholder="Ex: R$ 350.000,00"
              />
            </div>
            {/* Valor de Venda */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Valor de Venda
              </label>
              <input
                type="text"
                value={formatCurrency(valorVenda)}
                onChange={(e) =>
                  handleCurrencyChange(setValorVenda, e.target.value)
                }
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                placeholder="Ex: R$ 320.000,00"
                required
              />
            </div>
            {/* Documentação */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Documentação (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleDocumentacaoChange}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-800/60 file:text-white hover:file:bg-blue-700/80"
              />
            </div>
            {/* Imagens */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Imagens (Múltiplas)
              </label>
              <input
                type="file"
                multiple
                onChange={handleImagensChange}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-800/60 file:text-white hover:file:bg-blue-700/80"
              />
            </div>
            {/* Imagem Capa */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Imagem Capa
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImagemCapaChange}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-800/60 file:text-white hover:file:bg-blue-700/80"
              />
            </div>
            {/* Exclusivo */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Exclusivo
              </label>
              <select
                value={exclusivo}
                onChange={(e) => setExclusivo(e.target.value)}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition"
              >
                <option value="não">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>
            {/* Tem Inquilino */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Tem Inquilino
              </label>
              <select
                value={temInquilino}
                onChange={(e) => setTemInquilino(e.target.value)}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition"
              >
                <option value="não">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>
            {/* Situação do Imóvel */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Situação do Imóvel
              </label>
              <input
                type="text"
                value={situacaoImovel}
                onChange={(e) => setSituacaoImovel(e.target.value)}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                placeholder="Ex: Pronto para morar"
              />
            </div>
            {/* Observações */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Observações
              </label>
              <select
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full p-3 rounded-lg bg-blue-900/60 text-white border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition"
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
          {/* Notificação */}
          <div ref={notificationRef}>
            {notification && (
              <div className="mt-4 p-4 bg-blue-700/80 border border-blue-400 text-white rounded-lg text-center font-semibold shadow">
                {notification}
              </div>
            )}
          </div>
          {/* Botão */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 font-bold text-lg shadow-lg transition-all duration-200 flex items-center justify-center text-white"
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
