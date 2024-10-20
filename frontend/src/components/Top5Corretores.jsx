import React from "react";

const Top5Corretores = ({ corretores }) => {
  const API_URL = process.env.REACT_APP_API_URL;

  if (!Array.isArray(corretores) || corretores.length === 0) {
    return <p className="text-white">Nenhum corretor encontrado.</p>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <ul className="space-y-4">
        {corretores.map((corretor) => (
          <li
            key={corretor.corretor.id}
            className="flex items-center space-x-4 bg-gray-700 p-4 rounded-lg"
          >
            <img
              src={`${API_URL}/uploads/imagem_corretor/${corretor.corretor.photo}`}
              alt={`${corretor.corretor.first_name} ${corretor.corretor.last_name}`}
              className="h-16 w-16 rounded-full"
            />
            <div>
              <span className="text-xl font-semibold">
                {corretor.corretor.first_name} {corretor.corretor.last_name}
              </span>
              <p className="text-gray-400">{corretor.clients} clientes</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Top5Corretores;
