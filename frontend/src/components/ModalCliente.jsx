import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { X, FileText, User, Phone, Mail, CreditCard, DollarSign, Calendar, Briefcase, Users, Eye } from "lucide-react";

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
      criado_por_id: user ? user.id : null,
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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-blue-800/30">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-blue-800/30 bg-blue-900/40">
          <div className="flex items-center gap-3 mb-2 sm:mb-0">
            <User className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-blue-100">
              Detalhes do Cliente
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-blue-300 hover:text-white transition-colors p-2 hover:bg-blue-800/30 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-100px)] p-4 sm:p-6 space-y-6">
          
          {/* Informações do Cliente */}
          <div className="bg-blue-900/30 rounded-xl p-4 sm:p-6 border border-blue-800/30">
            <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/20">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-blue-400" />
                  <strong className="text-blue-300 text-sm">Nome:</strong>
                </div>
                <p className="text-white break-words">{cliente.nome}</p>
              </div>

              <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/20">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <strong className="text-blue-300 text-sm">Email:</strong>
                </div>
                <p className="text-white break-all">{cliente.email}</p>
              </div>

              <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/20">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <strong className="text-blue-300 text-sm">Telefone:</strong>
                </div>
                <p className="text-white">{cliente.telefone}</p>
              </div>

              <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/20">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <strong className="text-blue-300 text-sm">CPF:</strong>
                </div>
                <p className="text-white">{cliente.cpf}</p>
              </div>

              <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/20">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                  <strong className="text-blue-300 text-sm">Renda:</strong>
                </div>
                <p className="text-white">{cliente.valor_renda}</p>
              </div>

              <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/20">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-400" />
                  <strong className="text-blue-300 text-sm">Estado Civil:</strong>
                </div>
                <p className="text-white">{cliente.estado_civil}</p>
              </div>

              <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/20">
                <div className="flex items-center gap-2 mb-1">
                  <strong className="text-blue-300 text-sm">Naturalidade:</strong>
                </div>
                <p className="text-white">{cliente.naturalidade}</p>
              </div>

              <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/20">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <strong className="text-blue-300 text-sm">Profissão:</strong>
                </div>
                <p className="text-white">{cliente.profissao}</p>
              </div>

              {/* Data de Admissão - só aparece se não for renda informal */}
              {cliente.renda_tipo !== "INFORMAL" && cliente.renda_tipo !== "informal" && (
                <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <strong className="text-blue-300 text-sm">Data de Admissão:</strong>
                  </div>
                  <p className="text-white">
                    {cliente.data_admissao && !isNaN(new Date(cliente.data_admissao).getTime())
                      ? new Date(cliente.data_admissao).toLocaleDateString()
                      : "Não informado"}
                  </p>
                </div>
              )}

              <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/20">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <strong className="text-blue-300 text-sm">Data de Nascimento:</strong>
                </div>
                <p className="text-white">
                  {cliente.data_nascimento 
                    ? new Date(cliente.data_nascimento).toLocaleDateString()
                    : "Não informado"}
                </p>
              </div>

              <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/20">
                <div className="flex items-center gap-2 mb-1">
                  <strong className="text-blue-300 text-sm">Tipo de Renda:</strong>
                </div>
                <p className="text-white">{cliente.renda_tipo}</p>
              </div>

              <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/20">
                <div className="flex items-center gap-2 mb-1">
                  <strong className="text-blue-300 text-sm">Carteira +3 Anos:</strong>
                </div>
                <p className="text-white">
                  {Boolean(cliente.possui_carteira_mais_tres_anos) ? "Sim" : "Não"}
                </p>
              </div>

              <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/20">
                <div className="flex items-center gap-2 mb-1">
                  <strong className="text-blue-300 text-sm">Possui Dependente:</strong>
                </div>
                <p className="text-white">
                  {Boolean(cliente.possui_dependente) ? "Sim" : "Não"}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-blue-900/30 rounded-xl p-4 sm:p-6 border border-blue-800/30">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Status do Cliente</h3>
            <select
              value={status}
              onChange={handleStatusChange}
              className="w-full bg-blue-950/60 text-white p-3 rounded-lg border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition"
            >
              <option value="aguardando_aprovacao">Aguardando Aprovação</option>
              <option value="reprovado">Cliente Reprovado</option>
              <option value="condicionado">Cliente Condicionado</option>
              <option value="cliente_aprovado">Cliente Aprovado</option>
              <option value="documentacao_pendente">Documentação Pendente</option>
              <option value="aguardando_cancelamento_qv">Aguardando Cancelamento / QV</option>
              <option value="proposta_apresentada">Proposta Apresentada</option>
              <option value="visita_efetuada">Visita Efetuada</option>
              <option value="fechamento_proposta">Fechamento Proposta</option>
              <option value="processo_em_aberto">Processo Aberto</option>
              <option value="conformidade">Conformidade</option>
              <option value="concluido">Venda Concluída</option>
              <option value="nao_deu_continuidade">Não Deu Continuidade</option>
            </select>
          </div>

          {/* Documentação */}
          <div className="bg-blue-900/30 rounded-xl p-4 sm:p-6 border border-blue-800/30">
            <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentação
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cliente.documentos_pessoais && (
                <button
                  onClick={() => handleDocumentClick(cliente.documentos_pessoais)}
                  className="flex items-center gap-2 bg-blue-800/40 hover:bg-blue-700/50 text-white px-4 py-3 rounded-lg transition-colors border border-blue-700/30"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Documentos Pessoais</span>
                </button>
              )}
              {cliente.extrato_bancario && (
                <button
                  onClick={() => handleDocumentClick(cliente.extrato_bancario)}
                  className="flex items-center gap-2 bg-blue-800/40 hover:bg-blue-700/50 text-white px-4 py-3 rounded-lg transition-colors border border-blue-700/30"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Extrato Bancário</span>
                </button>
              )}
              {cliente.ficha_de_visita && (
                <button
                  onClick={() => handleDocumentClick(cliente.ficha_de_visita)}
                  className="flex items-center gap-2 bg-blue-800/40 hover:bg-blue-700/50 text-white px-4 py-3 rounded-lg transition-colors border border-blue-700/30"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Ficha de Visita</span>
                </button>
              )}
            </div>
          </div>

          {/* Adicionar Nota */}
          <div className="bg-blue-900/30 rounded-xl p-4 sm:p-6 border border-blue-800/30">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Adicionar Nota</h3>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full bg-blue-950/60 text-white p-3 rounded-lg border border-blue-800/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60 resize-none"
              rows="4"
              placeholder="Digite sua nota aqui..."
            />
            <button
              onClick={handleAddNota}
              className="mt-3 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              Adicionar Nota
            </button>
          </div>

          {/* Notas */}
          <div className="bg-blue-900/30 rounded-xl p-4 sm:p-6 border border-blue-800/30">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Notas</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {notas.length > 0 ? (
                notas.map((nota, index) => (
                  <div key={index} className="bg-blue-950/40 p-4 rounded-lg border border-blue-800/20">
                    <p className="text-white mb-3 break-words">{nota.texto}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <small className="text-blue-300">
                        Criado por: {nota.criado_por_id || "Desconhecido"} em{" "}
                        {new Date(nota.data_criacao).toLocaleDateString()}
                      </small>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConcluirNota(nota.id)}
                          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Concluir
                        </button>
                        <button
                          onClick={() => handleDeletarNota(nota.id)}
                          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-blue-300 text-center py-4">Nenhuma nota encontrada.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCliente;
