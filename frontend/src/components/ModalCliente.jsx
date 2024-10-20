import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const apiUrl = process.env.REACT_APP_API_URL;

const ModalCliente = ({ cliente, isOpen, onClose, onStatusChange }) => {
  const [nota, setNota] = useState("");
  const [notas, setNotas] = useState([]);
  const [status, setStatus] = useState(cliente?.status || "");
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotas = async () => {
      if (cliente?.id) {
        try {
          const response = await axios.get(
            `${apiUrl}/clientes/${cliente.id}/notas`
          );
          if (Array.isArray(response.data)) {
            setNotas(response.data);
          } else {
            console.error("Esperado um array mas recebido:", response.data);
          }
        } catch (error) {
          console.error("Erro ao buscar notas:", error);
        }
      }
    };

    fetchNotas();
  }, [cliente]);

  if (!isOpen) return null;

  const handleAddNota = () => {
    if (nota.trim() === "") return;

    const novaNota = {
      cliente_id: cliente.id,
      processo_id: null,
      nova: true,
      destinatario: cliente.nome,
      texto: nota,
      data_criacao: new Date(),
      criado_por_id: user ? user.first_name : null,
    };

    axios
      .post(`${apiUrl}/notas`, novaNota)
      .then((response) => {
        setNotas((prevNotas) => [...prevNotas, response.data]);
        setNota("");
      })
      .catch((error) => console.error("Erro ao adicionar nota:", error));
  };

  const handleConcluirNota = (id) => {
    axios
      .put(`${apiUrl}/notas/${id}/concluir`)
      .then((response) => {
        setNotas((prevNotas) =>
          prevNotas.map((n) => (n.id === id ? response.data : n))
        );
      })
      .catch((error) => console.error("Erro ao concluir nota:", error));
  };

  const handleDeletarNota = (id) => {
    axios
      .delete(`${apiUrl}/notas/${id}`)
      .then(() => {
        setNotas((prevNotas) => prevNotas.filter((n) => n.id !== id));
      })
      .catch((error) => console.error("Erro ao deletar nota:", error));
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    axios
      .patch(`${apiUrl}/clientes/${cliente.id}/status`, { status: newStatus })
      .then((response) => {
        onStatusChange();
        alert("Status atualizado com sucesso!");
      })
      .catch((error) => console.error("Erro ao atualizar status:", error));
  };

  const handleDocumentClick = (path) => {
    window.open(`${apiUrl}/${path}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-[#1a2238] text-white p-6 rounded-lg shadow-xl w-full max-w-4xl h-screen max-h-screen overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Detalhes do Cliente</h2>
          <button onClick={onClose} className="text-white text-2xl">
            &times;
          </button>
        </div>
        {/* Informações completas do cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <strong>Nome:</strong> {cliente.nome}
          </div>
          <div>
            <strong>Email:</strong> {cliente.email}
          </div>
          <div>
            <strong>Telefone:</strong> {cliente.telefone}
          </div>
          <div>
            <strong>CPF:</strong> {cliente.cpf}
          </div>
          <div>
            <strong>Renda:</strong> {cliente.valor_renda}
          </div>
          <div>
            <strong>Estado Civil:</strong> {cliente.estado_civil}
          </div>
          <div>
            <strong>Naturalidade:</strong> {cliente.naturalidade}
          </div>
          <div>
            <strong>Profissão:</strong> {cliente.profissao}
          </div>
          <div>
            <strong>Data de Admissão:</strong>{" "}
            {new Date(cliente.data_admissao).toLocaleDateString()}
          </div>
          <div>
            <strong>Data de Nascimento:</strong>{" "}
            {new Date(cliente.data_nascimento).toLocaleDateString()}
          </div>
          <div>
            <strong>Tipo de Renda:</strong> {cliente.renda_tipo}
          </div>
          <div>
            <strong>Carteira de Trabalho (Mais de 3 Anos):</strong>{" "}
            {Boolean(cliente.possui_carteira_mais_tres_anos) ? "Sim" : "Não"}
          </div>
          <div>
            <strong>Possui Dependente:</strong>{" "}
            {Boolean(cliente.possui_dependente) ? "Sim" : "Não"}
          </div>

          <div className="col-span-2">
            <strong>Status:</strong>
            <select
              value={status}
              onChange={handleStatusChange}
              className="ml-2 bg-[#2e3b55] text-white p-2 rounded-lg border border-gray-600 w-full"
            >
              <option value="aguardando_aprovacao">Aguardando Aprovação</option>
              <option value="reprovado">Cliente Reprovado</option>
              <option value="condicionado">Cliente Condicionado</option>
              <option value="cliente_aprovado">Cliente Aprovado</option>
              <option value="documentacao_pendente">
                Documentação Pendente
              </option>
              <option value="aguardando_cancelamento_qv">
                Aguardando Cancelamento / QV
              </option>
              <option value="proposta_apresentada">Proposta Apresentada</option>
              <option value="visita_efetuada">Visita Efetuada</option>
              <option value="fechamento_proposta">Fechamento Proposta</option>
              <option value="processo_em_aberto">Processo Aberto</option>
              <option value="conformidade">Conformidade</option>
              <option value="concluido">Venda Concluída</option>
              <option value="nao_deu_continuidade">Não Deu Continuidade</option>
            </select>
          </div>
        </div>
        {/* Adicionar Nota */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Adicionar Nota:
          </label>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="w-full bg-[#2e3b55] text-white p-3 rounded-lg border border-gray-600"
            rows="4"
          ></textarea>
          <button
            onClick={handleAddNota}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-2 hover:bg-blue-700 transition-colors duration-200"
          >
            Adicionar Nota
          </button>
        </div>
        {/* Documentação */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Documentação</h3>
          {cliente.documentos_pessoais && (
            <button
              onClick={() => handleDocumentClick(cliente.documentos_pessoais)}
              className="block w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-2 hover:bg-gray-800 transition-colors duration-200"
            >
              Ver Documentos Pessoais
            </button>
          )}
          {cliente.extrato_bancario && (
            <button
              onClick={() => handleDocumentClick(cliente.extrato_bancario)}
              className="block w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-2 hover:bg-gray-800 transition-colors duration-200"
            >
              Ver Extrato Bancário
            </button>
          )}
          {cliente.ficha_de_visita && (
            <button
              onClick={() => handleDocumentClick(cliente.ficha_de_visita)}
              className="block w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-2 hover:bg-gray-800 transition-colors duration-200"
            >
              Ver Ficha de Visita
            </button>
          )}
        </div>
        {/* Notas */}
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Notas</h3>
          <ul className="space-y-2 max-h-80 overflow-auto">
            {notas.map((nota, index) => (
              <li key={index} className="bg-gray-800 p-4 rounded-lg">
                <p>{nota.texto}</p>
                <small className="text-gray-400">
                  Criado por: {nota.criado_por_id || "Desconhecido"} em{" "}
                  {new Date(nota.data_criacao).toLocaleDateString()}
                </small>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleConcluirNota(nota.id)}
                    className="bg-green-600 text-white px-4 py-1 rounded-lg hover transition-colors duration-200"
                  >
                    Concluir
                  </button>
                  <button
                    onClick={() => handleDeletarNota(nota.id)}
                    className="bg-red-600 text-white px-4 py-1 rounded-lg hover transition-colors duration-200"
                  >
                    Deletar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ModalCliente;
