// components/Lembrete.js
import React from "react";

const Lembrete = ({ lembrete }) => {
  return (
    <div className="p-4 mb-4 bg-white shadow rounded">
      <h3 className="text-xl font-bold">{lembrete.titulo}</h3>
      <p>{lembrete.descricao}</p>
      <p className="text-sm text-gray-500">
        {new Date(lembrete.data).toLocaleDateString()}
      </p>
    </div>
  );
};

export default Lembrete;
