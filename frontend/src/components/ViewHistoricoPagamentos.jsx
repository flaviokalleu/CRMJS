import React, { useState } from "react";
import Modal from "react-modal";
import moment from "moment";

// Configurações do Modal
Modal.setAppElement("#root"); // Certifique-se de que este ID corresponda ao seu elemento raiz

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const ViewHistoricoPagamentos = ({ isOpen, onClose, cliente, onMarcarComoPago, onDeletarPagamento }) => {
  const [mes, setMes] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [valorPago, setValorPago] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onMarcarComoPago(cliente.id, mes, dataPagamento, valorPago, formaPagamento);
    onClose();
  };

  const handleDeletePagamento = (index) => {
    if (window.confirm("Você realmente deseja excluir este pagamento?")) {
      onDeletarPagamento(cliente.id, index);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center z-50" // Mantém o modal centralizado e na frente
      overlayClassName="fixed inset-0 bg-black bg-opacity-50" // Sobreposição escura
    >
      <div className="bg-gray-800 rounded-lg p-6 w-11/12 md:w-1/3">
        <h2 className="text-2xl mb-4 text-white">Histórico de Pagamentos - {cliente.nome}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-gray-300">Mês:</label>
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="border border-gray-600 rounded p-2 w-full bg-gray-700 text-white"
              required
            >
              <option value="">Selecione</option>
              {meses.map((mesNome, index) => (
                <option key={index} value={mesNome}>
                  {mesNome}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-300">Data do Pagamento:</label>
            <input
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              className="border border-gray-600 rounded p-2 w-full bg-gray-700 text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-300">Valor Pago:</label>
            <input
              type="number"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              className="border border-gray-600 rounded p-2 w-full bg-gray-700 text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-300">Forma de Pagamento:</label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="border border-gray-600 rounded p-2 w-full bg-gray-700 text-white"
              required
            >
              <option value="">Selecione</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Pix">Pix</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cheque">Cheque</option>
              <option value="Transferência">Transferência</option>
            </select>
          </div>
          <button type="submit" className="bg-green-500 text-white rounded-lg py-2 px-4">
            Marcar como Pago
          </button>
        </form>
        <h3 className="mt-4 text-xl text-white">Histórico de Pagamentos</h3>
        <ul className="text-gray-300">
          {cliente.historico_pagamentos?.map((pagamento, index) => (
            <li key={index} className="my-2 flex justify-between items-center">
              <span>
                {moment(pagamento.dataPagamento).format("DD/MM/YYYY")} - {pagamento.mes}: 
                {pagamento.status === "Pago" ? (
                  <span className="text-green-500"> Pago - R$ {pagamento.valorPago} ({pagamento.formaPagamento})</span>
                ) : (
                  <span className="text-red-500"> Não Pago - Multa: R$ {pagamento.multa}</span>
                )}
              </span>
              <button
                onClick={() => handleDeletePagamento(index)}
                className="text-red-500 ml-2"
              >
                Deletar
              </button>
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="mt-4 text-red-500">Fechar</button>
      </div>
    </Modal>
  );
};

export default ViewHistoricoPagamentos;
