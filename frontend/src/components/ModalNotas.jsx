import React from "react";

const ModalNotas = ({ notas, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
        <h2 className="text-3xl font-semibold mb-4">Notas do Cliente</h2>
        {notas.length === 0 ? (
          <p className="text-gray-400">Nenhuma nota encontrada.</p>
        ) : (
          notas.map((nota) => (
            <div key={nota.id} className="mb-4">
              <p className="text-lg font-medium">
                {nota.texto || "Sem conteúdo"}
              </p>
              <p className="text-sm text-gray-400">
                Criado por: {nota.criado_por_id || "Desconhecido"}
              </p>
              <p className="text-xs text-gray-500">
                {nota.data_criacao
                  ? new Date(nota.data_criacao).toLocaleString()
                  : "Data desconhecida"}
              </p>
            </div>
          ))
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ModalNotas;
