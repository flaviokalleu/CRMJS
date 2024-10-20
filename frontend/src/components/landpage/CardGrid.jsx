import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Importando o Link

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
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Propriedades em Destaque
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {displayedProperties.map((property) => (
          <div
            key={property.id}
            className="shadow-md rounded-lg overflow-hidden bg-white transition-all hover:shadow-lg hover:scale-101 duration-300"
          >
            <img
              src={
                property.imagem_capa
                  ? `${
                      process.env.REACT_APP_API_URL
                    }/${property.imagem_capa.replace(/\\/g, "/")}`
                  : "https://via.placeholder.com/500"
              }
              alt={property.nome_imovel}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h5 className="text-xl font-bold text-gray-800 mb-2">
                {property.nome_imovel}
              </h5>
              <p className="text-gray-700 mb-4">
                {property.descricao_imovel.substring(0, 100)}...
              </p>
              <Link
                to={`/imoveis/${property.id}`} // Usando Link para direcionar para a página de detalhes
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Saiba Mais
                <svg
                  className="ml-2 -mr-1 w-4 h-4"
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
