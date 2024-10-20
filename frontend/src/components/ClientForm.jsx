import React, { useState, useEffect } from "react";
import axios from "axios";
import InputMask from "react-input-mask";

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
  const [documentosPessoais, setDocumentosPessoais] = useState([]);
  const [extratoBancario, setExtratoBancario] = useState([]);
  const [documentosDependente, setDocumentosDependente] = useState([]);
  const [documentosConjuge, setDocumentosConjuge] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [estado, setEstado] = useState("");

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
    const numero = value.replace(/\D/g, ""); // Remove tudo que não é número
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
      console.error("Token de autenticação não encontrado");
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
      console.error("Erro ao adicionar cliente:", error);
      setMessage("Erro ao adicionar cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800 text-white rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Formulário de Cliente</h2>

      {/* Nome */}
      <div className="mb-4">
        <label htmlFor="nome" className="block mb-2">
          Nome
        </label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value.toUpperCase())}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
          required
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label htmlFor="email" className="block mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.toUpperCase())}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
          required
        />
      </div>

      {/* Telefone */}
      <div className="mb-4">
        <label htmlFor="telefone" className="block mb-2">
          Telefone
        </label>
        <InputMask
          id="telefone"
          mask="(99) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
          required
        />
      </div>

      {/* CPF */}
      <div className="mb-4">
        <label htmlFor="cpf" className="block mb-2">
          CPF
        </label>
        <InputMask
          id="cpf"
          mask="999.999.999-99"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
          required
        />
      </div>

      {/* Valor da Renda */}
      <div className="mb-4">
        <label htmlFor="valorRenda" className="block mb-2">
          Valor da Renda
        </label>
        <input
          id="valorRenda"
          type="text"
          value={formatarValorRenda(valorRenda)}
          onChange={(e) => {
            const value = e.target.value.replace(/\./g, '').replace(',', '.');
            setValorRenda(value);
          }}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
          required
        />
        <small className="text-gray-400">Use o formato: 2.000,00</small>
      </div>

      {/* Estado Civil */}
      <div className="mb-4">
        <label htmlFor="estadoCivil" className="block mb-2">
          Estado Civil
        </label>
        <select
          id="estadoCivil"
          value={estadoCivil}
          onChange={(e) => setEstadoCivil(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
        >
          <option value="solteiro">Solteiro</option>
          <option value="casado">Casado</option>
          <option value="divorciado">Divorciado</option>
          <option value="viuvo">Viúvo</option>
        </select>
      </div>

      {/* Naturalidade */}
      <div className="mb-4">
        <label htmlFor="estado" className="block mb-2">
          Estado
        </label>
        <select
          id="estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
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

      <div className="mb-4">
        <label htmlFor="naturalidade" className="block mb-2">
          Naturalidade
        </label>
        <select
          id="naturalidade"
          value={naturalidade}
          onChange={(e) => setNaturalidade(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
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

      {/* Profissão */}
      <div className="mb-4">
        <label htmlFor="profissao" className="block mb-2">
          Profissão
        </label>
        <input
          id="profissao"
          type="text"
          value={profissao}
          onChange={(e) => setProfissao(e.target.value.toUpperCase())}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
          required
        />
      </div>

      {/* Tipo de Renda */}
      <div className="mb-4">
        <label htmlFor="rendaTipo" className="block mb-2">
          Tipo de Renda
        </label>
        <select
          id="rendaTipo"
          value={rendaTipo}
          onChange={(e) => setRendaTipo(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
        >
          <option value="">Selecione</option>
          <option value="formal">Formal</option>
          <option value="informal">Informal</option>
          <option value="mista">Mista</option>
        </select>
      </div>

      {/* Data de Admissão */}
      {(rendaTipo === "formal" || rendaTipo === "mista") && (
        <div className="mb-4">
          <label htmlFor="dataAdmissao" className="block mb-2">
            Data de Admissão
          </label>
          <input
            id="dataAdmissao"
            type="date"
            value={dataAdmissao}
            onChange={(e) => setDataAdmissao(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
          />
        </div>
      )}

      {/* Data de Nascimento */}
      <div className="mb-4">
        <label htmlFor="dataNascimento" className="block mb-2">
          Data de Nascimento
        </label>
        <input
          id="dataNascimento"
          type="date"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
          required
        />
      </div>

      {/* Possui Carteira há mais de três anos */}
      <div className="mb-4">
        <label htmlFor="possuiCarteira" className="block mb-2">
          Possui Carteira de Trabalho há mais de 3 anos?
        </label>
        <select
          id="possuiCarteira"
          value={possui_carteira_mais_tres_anos}
          onChange={(e) => setPossuiCarteiraMaisTresAnos(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
        >
          <option value="">Selecione</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
      </div>

     {/* Número do PIS */}
{possui_carteira_mais_tres_anos === "sim" && (
  <div className="mb-4">
    <label htmlFor="numeroPis" className="block mb-2">
      Número do PIS
    </label>
    <input
      id="numeroPis"
      type="text"
      value={numeroPis}
      onChange={(e) => setNumeroPis(e.target.value)}
      className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
    />
  </div>
)}

      {/* Possui Dependente */}
      <div className="mb-4">
        <label htmlFor="possuiDependente" className="block mb-2">
          Possui Dependente?
        </label>
        <select
          id="possuiDependente"
          value={possuiDependente}
          onChange={(e) => setPossuiDependente(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
        >
          <option value="">Selecione</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
      </div>

      {/* Documentos Pessoais */}
      <div className="mb-4">
        <label htmlFor="documentosPessoais" className="block mb-2">
          Documentos Pessoais
        </label>
        <input
          type="file"
          multiple
          onChange={(e) => setDocumentosPessoais(Array.from(e.target.files))}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
        />
      </div>

      {/* Extrato Bancário */}
      <div className="mb-4">
        <label htmlFor="extratoBancario" className="block mb-2">
          Extrato Bancário
        </label>
        <input
          type="file"
          multiple
          onChange={(e) => setExtratoBancario(Array.from(e.target.files))}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
        />
      </div>

      {/* Documentos do Dependente */}
      {possuiDependente === "sim" && (
        <div className="mb-4">
          <label htmlFor="documentosDependente" className="block mb-2">
            Documentos do Dependente
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => setDocumentosDependente(Array.from(e.target.files))}
            className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
          />
        </div>
      )}

      {/* Documentos do Cônjuge */}
      {estadoCivil === "casado" && (
        <div className="mb-4">
          <label htmlFor="documentosConjuge" className="block mb-2">
            Documentos do Cônjuge
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => setDocumentosConjuge(Array.from(e.target.files))}
            className="w-full p-3 rounded-md bg-gray-700 border border-gray-600"
          />
        </div>
      )}

      {/* Botão de Enviar */}
      <button
        type="submit"
        className={`w-full p-3 rounded-md bg-blue-600 hover:bg-blue-500 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>

      {/* Mensagem de status */}
      {message && <p className="mt-4 text-red-400">{message}</p>}
    </form>
  );
};

export default ClientForm;
