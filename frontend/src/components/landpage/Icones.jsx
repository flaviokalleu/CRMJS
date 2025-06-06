import React from "react";
import { FaHome, FaBuilding, FaKey } from "react-icons/fa";

const Icones = () => {
  return (
    <div className="py-10 bg-gradient-to-br from-blue-950 via-blue-900 to-black">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-screen-xl mx-auto">
        {/* Ícone de Casa */}
        <div className="flex flex-col items-center bg-blue-950/80 border border-blue-900/40 rounded-2xl shadow-xl p-8 transition-transform hover:scale-105 hover:shadow-2xl">
          <FaHome className="text-6xl text-[#78b439] mb-4 drop-shadow-lg transition-shadow" />
          <h3 className="text-2xl font-bold mb-2 text-white">Casa</h3>
          <p className="text-blue-100 text-center">
            Encontre a casa perfeita para você e sua família, com conforto e segurança.
          </p>
        </div>

        {/* Ícone de Apartamento */}
        <div className="flex flex-col items-center bg-blue-950/80 border border-blue-900/40 rounded-2xl shadow-xl p-8 transition-transform hover:scale-105 hover:shadow-2xl">
          <FaBuilding className="text-6xl text-[#78b439] mb-4 drop-shadow-lg transition-shadow" />
          <h3 className="text-2xl font-bold mb-2 text-white">Apartamento</h3>
          <p className="text-blue-100 text-center">
            Descubra apartamentos modernos, bem localizados e com infraestrutura completa.
          </p>
        </div>

        {/* Ícone de Aluguel */}
        <div className="flex flex-col items-center bg-blue-950/80 border border-blue-900/40 rounded-2xl shadow-xl p-8 transition-transform hover:scale-105 hover:shadow-2xl">
          <FaKey className="text-6xl text-[#78b439] mb-4 drop-shadow-lg transition-shadow" />
          <h3 className="text-2xl font-bold mb-2 text-white">Aluguel</h3>
          <p className="text-blue-100 text-center">
            Encontre opções de aluguel flexíveis e que cabem no seu orçamento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Icones;
