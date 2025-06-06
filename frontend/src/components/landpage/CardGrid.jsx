import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const CardGrid = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/imoveis`
        );
        setProperties(response.data);
      } catch (error) {
        console.error("Erro ao buscar imóveis:", error);
      }
    };

    fetchProperties();
  }, []);

  // Limit to display 4 properties
  const displayedProperties = properties.slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-4xl font-extrabold text-center text-white mb-10 tracking-tight drop-shadow-lg">
        Propriedades em Destaque
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {displayedProperties.map((property) => (
          <div
            key={property.id}
            className="bg-gradient-to-br from-blue-950 via-blue-900 to-black border border-blue-900/40 shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] flex flex-col"
          >
            <img
              src={
                property.imagem_capa
                  ? `${process.env.REACT_APP_API_URL}/${property.imagem_capa.replace(/\\/g, "/")}`
                  : "https://via.placeholder.com/500"
              }
              alt={property.nome_imovel}
              className="w-full h-52 object-cover rounded-t-2xl"
            />
            <div className="flex-1 flex flex-col p-6">
              <h5 className="text-2xl font-bold text-white mb-2 truncate">
                {property.nome_imovel}
              </h5>
              <p className="text-blue-100/90 mb-4 line-clamp-3">
                {property.descricao_imovel
                  ? property.descricao_imovel.substring(0, 100) + "..."
                  : ""}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-800/60 text-blue-100 px-2 py-1 rounded text-xs font-semibold">
                  {property.tipo?.toUpperCase() || "TIPO"}
                </span>
                <span className="bg-blue-900/60 text-blue-100 px-2 py-1 rounded text-xs font-semibold">
                  {property.localizacao}
                </span>
                <span className="bg-blue-900/60 text-blue-100 px-2 py-1 rounded text-xs font-semibold">
                  {property.quartos} quarto(s)
                </span>
                <span className="bg-blue-900/60 text-blue-100 px-2 py-1 rounded text-xs font-semibold">
                  {property.banheiro} banheiro(s)
                </span>
              </div>
              <div className="flex flex-col gap-1 mb-6">
                <span className="text-blue-200 text-sm">
                  Valor Aluguel:{" "}
                  <span className="font-bold">
                    {Number(property.valor_aluguel).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </span>
              </div>
              <Link
                to={`/imoveis/${property.id}`}
                className="inline-flex items-center justify-center px-4 py-2 text-base font-semibold text-white bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 rounded-lg shadow transition-all duration-200"
              >
                Saiba Mais
                <svg
                  className="ml-2 -mr-1 w-5 h-5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardGrid;
