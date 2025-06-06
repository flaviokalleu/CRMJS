import React, { useEffect, useState } from "react";
import { 
  Users, 
  CreditCard, 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Plus, 
  X, 
  AlertTriangle,
  Eye,
  Trash2,
  Edit
} from "lucide-react";

const ClienteAluguel = () => {
  const [clientes, setClientes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [pagamentoParaDeletar, setPagamentoParaDeletar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formPagamento, setFormPagamento] = useState({
    data: new Date().toISOString().split('T')[0],
    valor: '',
    status: 'Pago',
    forma_pagamento: 'Dinheiro'
  });

  // Carrega clientes do backend
  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + "/clientealuguel");
      const data = await response.json();
      
      // Proteção para garantir que data é sempre um array
      if (Array.isArray(data)) {
        setClientes(data);
      } else {
        console.error("Dados recebidos não são um array:", data);
        setClientes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      setClientes([]);
    }
  };

  // Verifica se o pagamento está em atraso
  const verificarAtraso = (cliente) => {
    const hoje = new Date();
    const diaVencimento = parseInt(cliente.dia_vencimento);
    
    // Verifica se já passou do dia de vencimento do mês atual
    if (hoje.getDate() > diaVencimento) {
      return true;
    }
    return false;
  };

  // Abre modal de histórico
  const abrirHistorico = (cliente) => {
    console.log("Cliente selecionado:", cliente);
    setClienteSelecionado(cliente);
    setModalAberto(true);
  };

  // Abre modal de pagamento
  const abrirModalPagamento = (cliente) => {
    setClienteSelecionado(cliente);
    setFormPagamento({
      data: new Date().toISOString().split('T')[0],
      valor: cliente.valor_aluguel,
      status: 'Pago',
      forma_pagamento: 'Dinheiro'
    });
    setModalPagamento(true);
  };

  // Abre modal de confirmação para deletar
  const abrirModalConfirmacao = (pagamento, index) => {
    setPagamentoParaDeletar({ pagamento, index, id: pagamento.id });
    setModalConfirmacao(true);
  };

  // Fecha modais
  const fecharModais = () => {
    setModalAberto(false);
    setModalPagamento(false);
    setModalConfirmacao(false);
    setClienteSelecionado(null);
    setPagamentoParaDeletar(null);
  };

  // Registra pagamento
  const registrarPagamento = async () => {
    if (!clienteSelecionado) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clientealuguel/${clienteSelecionado.id}/pagamento`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formPagamento),
        }
      );

      if (response.ok) {
        await carregarClientes();
        fecharModais();
      } else {
        console.error("Erro ao registrar pagamento");
      }
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
    } finally {
      setLoading(false);
    }
  };

  // Deleta pagamento
  const deletarPagamento = async () => {
    if (!clienteSelecionado || !pagamentoParaDeletar) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clientealuguel/${clienteSelecionado.id}/pagamento/${pagamentoParaDeletar.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const clienteAtualizado = await response.json();
        setClienteSelecionado(clienteAtualizado);
        await carregarClientes();
        
        setModalConfirmacao(false);
        setPagamentoParaDeletar(null);
      } else {
        console.error("Erro ao deletar pagamento");
      }
    } catch (error) {
      console.error("Erro ao deletar pagamento:", error);
    } finally {
      setLoading(false);
    }
  };

  // Renderiza histórico sem map complexo
  const renderHistorico = () => {
    if (!clienteSelecionado?.historico_pagamentos || 
        !Array.isArray(clienteSelecionado.historico_pagamentos) || 
        clienteSelecionado.historico_pagamentos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-blue-400" />
          </div>
          <p className="text-gray-400 text-center">Nenhum histórico de pagamentos encontrado</p>
        </div>
      );
    }

    const items = [];
    for (let i = 0; i < clienteSelecionado.historico_pagamentos.length; i++) {
      const pag = clienteSelecionado.historico_pagamentos[i];
      console.log("Processando pagamento:", pag);
      
      const isPago = pag.status === "Pago";
      
      items.push(
        <div key={i} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 mb-3 hover:bg-gray-700/50 transition-all duration-200 group">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isPago ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className={`font-medium ${isPago ? 'text-green-400' : 'text-red-400'}`}>
                  {pag.status || "N/A"}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Calendar className="w-3 h-3" />
                  <span>{pag.data || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-white font-semibold">
                  <DollarSign className="w-3 h-3" />
                  <span>R$ {pag.valor || "N/A"}</span>
                </div>
                {pag.forma_pagamento && (
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <CreditCard className="w-3 h-3" />
                    <span>{pag.forma_pagamento}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isPago 
                  ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
                  : 'bg-red-400/20 text-red-400 border border-red-400/30'
              }`}>
                {isPago ? 'Pago' : 'Pendente'}
              </div>
              
              {/* Botão de deletar - aparece no hover */}
              <button
                onClick={() => abrirModalConfirmacao(pag, i)}
                className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all duration-200 flex items-center justify-center"
                title="Deletar pagamento"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return items;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Clientes de Aluguel
          </h1>
          <p className="text-gray-300 mt-2">Gerencie os pagamentos dos seus clientes</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Cards para Mobile */}
        <div className="block lg:hidden space-y-4">
          {clientes.map((cliente) => {
            const emAtraso = verificarAtraso(cliente);
            
            return (
              <div key={cliente.id} className={`backdrop-blur-sm border rounded-xl p-5 transition-all duration-200 ${
                emAtraso 
                  ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}>
                {/* Aviso de Atraso */}
                {emAtraso && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm font-medium">Pagamento em atraso!</span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{cliente.nome}</h3>
                    <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                      <Mail className="w-3 h-3" />
                      <span>{cliente.email}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-lg">
                      {Number(cliente.valor_aluguel).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Calendar className="w-3 h-3" />
                      <span>Dia {cliente.dia_vencimento}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-300 text-sm">{cliente.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-300 text-sm">{cliente.cpf}</span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                    onClick={() => abrirModalPagamento(cliente)}
                  >
                    <Plus className="w-4 h-4" />
                    Registrar Pagamento
                  </button>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                    onClick={() => abrirHistorico(cliente)}
                  >
                    <Eye className="w-4 h-4" />
                    Ver Histórico
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabela para Desktop */}
        <div className="hidden lg:block">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Cliente</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contato</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Valor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Vencimento</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => {
                    const emAtraso = verificarAtraso(cliente);
                    
                    return (
                      <tr key={cliente.id} className={`border-b border-white/5 transition-all duration-200 ${
                        emAtraso ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-white/5'
                      }`}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white flex items-center gap-2">
                              {cliente.nome}
                              {emAtraso && <AlertTriangle className="w-4 h-4 text-red-400" />}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {cliente.cpf}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-white flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {cliente.email}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {cliente.telefone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-400 font-semibold flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {Number(cliente.valor_aluguel).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
                            <Calendar className="w-3 h-3" />
                            Dia {cliente.dia_vencimento}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {emAtraso ? (
                            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" />
                              Em Atraso
                            </span>
                          ) : (
                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" />
                              Em Dia
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center gap-1"
                              onClick={() => abrirModalPagamento(cliente)}
                              title="Registrar Pagamento"
                            >
                              <Plus className="w-4 h-4" />
                              Pagar
                            </button>
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center gap-1"
                              onClick={() => abrirHistorico(cliente)}
                              title="Ver Histórico"
                            >
                              <Eye className="w-4 h-4" />
                              Histórico
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Histórico */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Histórico de Pagamentos</h2>
                  <p className="text-blue-100 text-sm mt-1">{clienteSelecionado?.nome}</p>
                </div>
                <button
                  onClick={fecharModais}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {renderHistorico()}
            </div>

            <div className="border-t border-gray-700/50 p-4">
              <button
                onClick={fecharModais}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {modalPagamento && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Registrar Pagamento</h2>
                  <p className="text-green-100 text-sm mt-1">{clienteSelecionado?.nome}</p>
                </div>
                <button
                  onClick={fecharModais}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data do Pagamento</label>
                  <input
                    type="date"
                    value={formPagamento.data}
                    onChange={(e) => setFormPagamento({...formPagamento, data: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Valor</label>
                  <input
                    type="number"
                    value={formPagamento.valor}
                    onChange={(e) => setFormPagamento({...formPagamento, valor: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    placeholder="R$ 0,00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Forma de Pagamento</label>
                  <select
                    value={formPagamento.forma_pagamento}
                    onChange={(e) => setFormPagamento({...formPagamento, forma_pagamento: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={formPagamento.status}
                    onChange={(e) => setFormPagamento({...formPagamento, status: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Pago">Pago</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700/50 p-4 flex gap-3">
              <button
                onClick={fecharModais}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={registrarPagamento}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {modalConfirmacao && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Confirmar Exclusão</h2>
                  <p className="text-red-100 text-sm mt-1">Esta ação não pode ser desfeita</p>
                </div>
                <button
                  onClick={fecharModais}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Deletar Pagamento</h3>
                  <p className="text-gray-400 text-sm">Tem certeza que deseja deletar este pagamento?</p>
                </div>
              </div>

              {pagamentoParaDeletar && (
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-3 h-3" />
                      <span>Data: {pagamentoParaDeletar.pagamento.data}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <DollarSign className="w-3 h-3" />
                      <span>Valor: R$ {pagamentoParaDeletar.pagamento.valor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className={`w-3 h-3 rounded-full ${
                        pagamentoParaDeletar.pagamento.status === "Pago" ? 'bg-green-400' : 'bg-red-400'
                      }`}></span>
                      <span>Status: {pagamentoParaDeletar.pagamento.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-700/50 p-4 flex gap-3">
              <button
                onClick={fecharModais}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={deletarPagamento}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Deletar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteAluguel;
