import React, { useState, useEffect } from "react";
import axios from "axios";
import InputMask from "react-input-mask";
import {
  Loader2,
  FileText,
  User,
  Mail,
  Phone,
  CreditCard,
  Briefcase,
  Calendar,
  FilePlus,
  Wallet,
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL;
const ESTADOS_API_URL = process.env.REACT_APP_ESTADOS_API_URL;
const MUNICIPIOS_API_URL = process.env.REACT_APP_MUNICIPIOS_API_URL;

const ClientForm = ({ onSuccess }) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [valorRenda, setValorRenda] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("solteiro");
  const [naturalidade, setNaturalidade] = useState("");
  const [profissao, setProfissao] = useState("");
  const [dataAdmissao, setDataAdmissao] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [rendaTipo, setRendaTipo] = useState("");
  const [possui_carteira_mais_tres_anos, setPossuiCarteiraMaisTresAnos] = useState("");
  const [numeroPis, setNumeroPis] = useState("");
  const [possuiDependente, setPossuiDependente] = useState("");
  const [qtdDependentes, setQtdDependentes] = useState("");
  const [nomeDependentes, setNomeDependentes] = useState("");
  const [documentosPessoais, setDocumentosPessoais] = useState([]);
  const [extratoBancario, setExtratoBancario] = useState([]);
  const [documentosDependente, setDocumentosDependente] = useState([]);
  const [documentosConjuge, setDocumentosConjuge] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [estado, setEstado] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const { data } = await axios.get(ESTADOS_API_URL);
        setEstados(data);
      } catch (error) {
        console.error("Erro ao buscar estados:", error);
      }
    };
    fetchEstados();
  }, []);

  useEffect(() => {
    if (estado) {
      const fetchMunicipios = async () => {
        try {
          const estadoSelecionado = estados.find((est) => est.sigla === estado);
          if (estadoSelecionado) {
            const estadoId = estadoSelecionado.id;
            const { data } = await axios.get(
              `${MUNICIPIOS_API_URL}/${estadoId}`
            );
            setMunicipios(data);
          } else {
            console.error("Estado não encontrado");
          }
        } catch (error) {
          console.error("Erro ao buscar municípios:", error);
        }
      };

      fetchMunicipios();
    } else {
      setMunicipios([]);
    }
  }, [estado, estados]);

  const formatarValorRenda = (value) => {
    const numero = value.replace(/\D/g, "");
    return (Number(numero) / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setMessage("Token de autenticação não encontrado.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("nome", nome.toUpperCase());
    formData.append("email", email.toUpperCase());
    formData.append("telefone", telefone);
    formData.append("cpf", cpf);
    formData.append("valor_renda", valorRenda);
    formData.append("estado_civil", estadoCivil.toUpperCase());
    formData.append("naturalidade", naturalidade.toUpperCase());
    formData.append("profissao", profissao.toUpperCase());
    formData.append("data_admissao", dataAdmissao);
    formData.append("data_nascimento", dataNascimento);
    formData.append("renda_tipo", rendaTipo.toUpperCase());
    formData.append(
      "tem_mais_de_tres_anos",
      possui_carteira_mais_tres_anos === "sim" ? 1 : 0
    );
    formData.append("numero_pis", numeroPis);
    formData.append("possui_dependente", possuiDependente === "sim" ? 1 : 0);
    formData.append("qtd_dependentes", qtdDependentes);
    formData.append("nome_dependentes", nomeDependentes);
    formData.append("observacoes", observacoes);

    documentosPessoais.forEach((file) => {
      formData.append("documentosPessoais", file);
    });

    extratoBancario.forEach((file) => {
      formData.append("extratoBancario", file);
    });

    documentosDependente.forEach((file) => {
      formData.append("documentosDependente", file);
    });

    documentosConjuge.forEach((file) => {
      formData.append("documentosConjuge", file);
    });

    try {
      await axios.post(`${API_URL}/clientes`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Cliente adicionado com sucesso!");
      await axios.post(`${API_URL}/notificarCorrespondentes`, {
        clienteNome: nome,
      });
      onSuccess();
    } catch (error) {
      setMessage("Erro ao adicionar cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
     
    >
      <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-3 tracking-tight text-white">
        <FileText className="w-7 h-7 text-blue-400" />
        Cadastro de Cliente
      </h2>
      <p className="mb-8 text-lg text-white">
        Preencha os campos abaixo com atenção. Todos os dados são importantes para o cadastro e análise do cliente.
      </p>

      {/* Nome */}
      <div className="mb-5">
        <label htmlFor="nome" className="block mb-1 font-semibold flex items-center gap-2 text-white">
          <User className="w-4 h-4 text-blue-400" /> Nome completo do cliente
        </label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value.toUpperCase())}
          className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60 text-white"
          placeholder="Ex: MARIA DA SILVA"
          required
        />
      </div>

      {/* Email */}
      <div className="mb-5">
        <label htmlFor="email" className="block mb-1 font-semibold flex items-center gap-2 text-white">
          <Mail className="w-4 h-4 text-blue-400" /> E-mail para contato
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.toUpperCase())}
          className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60 text-white"
          placeholder="Ex: MARIA@EMAIL.COM"
          required
        />
      </div>

      {/* Telefone */}
      <div className="mb-5">
        <label htmlFor="telefone" className="block mb-1 font-semibold flex items-center gap-2 text-white">
          <Phone className="w-4 h-4 text-blue-400" /> Telefone celular
        </label>
        <InputMask
          id="telefone"
          mask="(99) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60 text-white"
          placeholder="(00) 00000-0000"
          required
        />
      </div>

      {/* CPF */}
      <div className="mb-5">
        <label htmlFor="cpf" className="block mb-1 font-semibold flex items-center gap-2 text-white">
          <CreditCard className="w-4 h-4 text-blue-400" /> CPF do cliente
        </label>
        <InputMask
          id="cpf"
          mask="999.999.999-99"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60 text-white"
          placeholder="000.000.000-00"
          required
        />
      </div>

      {/* Valor da Renda */}
      <div className="mb-5">
        <label htmlFor="valorRenda" className="block mb-1 font-semibold flex items-center gap-2 text-white">
          <Wallet className="w-4 h-4 text-blue-400" /> Valor da renda mensal
        </label>
        <input
          id="valorRenda"
          type="text"
          value={formatarValorRenda(valorRenda)}
          onChange={(e) => {
            const value = e.target.value.replace(/\./g, '').replace(',', '.');
            setValorRenda(value);
          }}
          className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60 text-white"
          placeholder="Ex: 2.000,00"
          required
        />
        <small className="text-white/70">Informe o valor bruto da renda mensal. Use o formato: 2.000,00</small>
      </div>

      {/* Estado Civil */}
      <div className="mb-5">
        <label htmlFor="estadoCivil" className="block mb-1 font-semibold text-white">
          Estado civil do cliente
        </label>
        <select
          id="estadoCivil"
          value={estadoCivil}
          onChange={(e) => setEstadoCivil(e.target.value)}
          className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition text-white"
        >
          <option value="solteiro">Solteiro(a)</option>
          <option value="casado">Casado(a)</option>
          <option value="divorciado">Divorciado(a)</option>
          <option value="viuvo">Viúvo(a)</option>
        </select>
      </div>

      {/* Estado e Naturalidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label htmlFor="estado" className="block mb-1 font-semibold text-white">
            Estado de nascimento
          </label>
          <select
            id="estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition text-white"
            required
          >
            <option value="">Selecione um estado</option>
            {estados.map((est) => (
              <option key={est.id} value={est.sigla}>
                {est.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="naturalidade" className="block mb-1 font-semibold text-white">
            Cidade de nascimento
          </label>
          <select
            id="naturalidade"
            value={naturalidade}
            onChange={(e) => setNaturalidade(e.target.value)}
            className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition text-white"
            required
          >
            <option value="">Selecione uma cidade</option>
            {municipios.map((municipio) => (
              <option key={municipio.id} value={`${municipio.nome} - ${estado}`}>
                {municipio.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Profissão */}
      <div className="mb-5">
        <label htmlFor="profissao" className="block mb-1 font-semibold flex items-center gap-2 text-white">
          <Briefcase className="w-4 h-4 text-blue-400" /> Profissão atual
        </label>
        <input
          id="profissao"
          type="text"
          value={profissao}
          onChange={(e) => setProfissao(e.target.value.toUpperCase())}
          className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60 text-white"
          placeholder="Ex: GERENTE DE VENDAS"
          required
        />
      </div>

      {/* Tipo de Renda */}
      <div className="mb-5">
        <label htmlFor="rendaTipo" className="block mb-1 font-semibold text-white">
          Tipo de renda
        </label>
        <select
          id="rendaTipo"
          value={rendaTipo}
          onChange={(e) => setRendaTipo(e.target.value)}
          className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition text-white"
        >
          <option value="">Selecione</option>
          <option value="formal">Formal</option>
          <option value="informal">Informal</option>
          <option value="mista">Mista</option>
        </select>
      </div>

      {/* Data de Admissão */}
      {(rendaTipo === "formal" || rendaTipo === "mista") && (
        <div className="mb-5">
          <label htmlFor="dataAdmissao" className="block mb-1 font-semibold flex items-center gap-2 text-white">
            <Calendar className="w-4 h-4 text-blue-400" /> Data de admissão no emprego atual
          </label>
          <input
            id="dataAdmissao"
            type="date"
            value={dataAdmissao}
            onChange={(e) => setDataAdmissao(e.target.value)}
            className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition text-white"
          />
        </div>
      )}

      {/* Data de Nascimento */}
      <div className="mb-5">
        <label htmlFor="dataNascimento" className="block mb-1 font-semibold flex items-center gap-2 text-white">
          <Calendar className="w-4 h-4 text-blue-400" /> Data de nascimento
        </label>
        <input
          id="dataNascimento"
          type="date"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition text-white"
          required
        />
      </div>

      {/* Possui Carteira há mais de três anos */}
      <div className="mb-5">
        <label htmlFor="possuiCarteira" className="block mb-1 font-semibold text-white">
          Possui carteira de trabalho há mais de 3 anos?
        </label>
        <select
          id="possuiCarteira"
          value={possui_carteira_mais_tres_anos}
          onChange={(e) => setPossuiCarteiraMaisTresAnos(e.target.value)}
          className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition text-white"
        >
          <option value="">Selecione</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
      </div>

      {/* Número do PIS */}
      {possui_carteira_mais_tres_anos === "sim" && (
        <div className="mb-5">
          <label htmlFor="numeroPis" className="block mb-1 font-semibold text-white">
            Número do PIS
          </label>
          <input
            id="numeroPis"
            type="text"
            value={numeroPis}
            onChange={(e) => setNumeroPis(e.target.value)}
            className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition text-white"
            placeholder="Ex: 123.45678.90-1"
          />
        </div>
      )}

      {/* Possui Dependente */}
      <div className="mb-5">
        <label htmlFor="possuiDependente" className="block mb-1 font-semibold text-white">
          Possui dependente(s)?
        </label>
        <select
          id="possuiDependente"
          value={possuiDependente}
          onChange={(e) => setPossuiDependente(e.target.value)}
          className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition text-white"
        >
          <option value="">Selecione</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
      </div>

      {/* Quantidade e Nome dos Dependentes */}
      {possuiDependente === "sim" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label htmlFor="qtdDependentes" className="block mb-1 font-semibold text-white">
              Quantidade de dependentes
            </label>
            <input
              id="qtdDependentes"
              type="number"
              min="1"
              value={qtdDependentes}
              onChange={(e) => setQtdDependentes(e.target.value)}
              className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition text-white"
              placeholder="Ex: 2"
            />
          </div>
          <div>
            <label htmlFor="nomeDependentes" className="block mb-1 font-semibold text-white">
              Nome dos dependentes
            </label>
            <input
              id="nomeDependentes"
              type="text"
              value={nomeDependentes}
              onChange={(e) => setNomeDependentes(e.target.value.toUpperCase())}
              className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition text-white"
              placeholder="Ex: JOÃO, ANA"
            />
          </div>
        </div>
      )}

      {/* Documentos Pessoais */}
      <div className="mb-5">
        <label htmlFor="documentosPessoais" className="block mb-1 font-semibold flex items-center gap-2 text-white">
          <FilePlus className="w-4 h-4 text-blue-400" /> Documentos pessoais (RG, CPF, etc)
        </label>
        <input
          type="file"
          multiple
          onChange={(e) => setDocumentosPessoais(Array.from(e.target.files))}
          className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-800/60 file:text-white hover:file:bg-blue-700/80"
        />
      </div>

      {/* Extrato Bancário */}
      <div className="mb-5">
        <label htmlFor="extratoBancario" className="block mb-1 font-semibold flex items-center gap-2 text-white">
          <FilePlus className="w-4 h-4 text-blue-400" /> Extrato bancário dos últimos 3 meses
        </label>
        <input
          type="file"
          multiple
          onChange={(e) => setExtratoBancario(Array.from(e.target.files))}
          className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-800/60 file:text-white hover:file:bg-blue-700/80"
        />
      </div>

      {/* Documentos do Dependente */}
      {possuiDependente === "sim" && (
        <div className="mb-5">
          <label htmlFor="documentosDependente" className="block mb-1 font-semibold flex items-center gap-2 text-white">
            <FilePlus className="w-4 h-4 text-blue-400" /> Documentos dos dependentes
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => setDocumentosDependente(Array.from(e.target.files))}
            className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-800/60 file:text-white hover:file:bg-blue-700/80"
          />
        </div>
      )}

      {/* Documentos do Cônjuge */}
      {estadoCivil === "casado" && (
        <div className="mb-5">
          <label htmlFor="documentosConjuge" className="block mb-1 font-semibold flex items-center gap-2 text-white">
            <FilePlus className="w-4 h-4 text-blue-400" /> Documentos do cônjuge
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => setDocumentosConjuge(Array.from(e.target.files))}
            className="w-full p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-800/60 file:text-white hover:file:bg-blue-700/80"
          />
        </div>
      )}

      {/* Observações */}
      <div className="mb-8">
        <label htmlFor="observacoes" className="block mb-1 font-semibold text-white">
          Observações adicionais
        </label>
        <textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="w-full min-h-[80px] p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60 text-white"
          placeholder="Inclua aqui qualquer informação relevante sobre o cliente, situação financeira, histórico, etc."
        />
      </div>

      {/* Botão de Enviar */}
      <button
        type="submit"
        className={`w-full p-3 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
          loading ? "opacity-60 cursor-not-allowed" : ""
        } text-white`}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enviando...
          </>
        ) : (
          "Cadastrar Cliente"
        )}
      </button>

      {/* Mensagem de status */}
      {message && (
        <div
          className={`mt-6 p-4 rounded-lg text-center font-semibold text-lg ${
            message.includes("sucesso")
              ? "bg-green-900/30 border border-green-800/50 text-white"
              : "bg-red-900/30 border border-red-800/50 text-white"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
};

export default ClientForm;
