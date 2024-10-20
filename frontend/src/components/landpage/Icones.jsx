import React from "react";
import { FaHome, FaBuilding, FaKey } from "react-icons/fa"; // Ícones de casa, apartamento e aluguel

const Icones = () => {
  return (
    <div className="py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-screen-xl mx-auto">
        {/* Ícone de Casa */}
        <div className="flex flex-col items-center transition-transform transform hover:scale-105">
          <FaHome className="text-6xl text-[#78b439] mb-4 hover:shadow-lg transition-shadow" />
          <h3 className="text-2xl font-semibold mb-2">Casa</h3>
          <p className="text-gray-600 text-center">Encontre a casa perfeita para você e sua família.</p>
        </div>

        {/* Ícone de Apartamento */}
        <div className="flex flex-col items-center transition-transform transform hover:scale-105">
          <FaBuilding className="text-6xl text-[#78b439] mb-4 hover:shadow-lg transition-shadow" />
          <h3 className="text-2xl font-semibold mb-2">Apartamento</h3>
          <p className="text-gray-600 text-center">Descubra apartamentos confortáveis e modernos.</p>
        </div>

        {/* Ícone de Aluguel */}
        <div className="flex flex-col items-center transition-transform transform hover:scale-105">
          <FaKey className="text-6xl text-[#78b439] mb-4 hover:shadow-lg transition-shadow" />
          <h3 className="text-2xl font-semibold mb-2">Aluguel</h3>
          <p className="text-gray-600 text-center">Encontre a opção de aluguel que se encaixa no seu orçamento.</p>
        </div>
      </div>
    </div>
  );
};

export default Icones;
