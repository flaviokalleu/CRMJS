// src/components/AcessosList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

const AcessosList = () => {
  const [acessos, setAcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userFirstName, setUserFirstName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAcessos = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/acessos`
        );
        setAcessos(response.data);

        // Fetch the logged-in user's data
        const userResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/user/me`
        );
        setUserFirstName(userResponse.data.first_name);
      } catch (err) {
        setError("Erro ao buscar acessos.");
      } finally {
        setLoading(false);
      }
    };

    fetchAcessos();
  }, []);

  // Ordenar os acessos do mais recente para o mais antigo
  const sortedAcessos = acessos.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Filtrar os acessos com base na pesquisa
  const filteredAcessos = sortedAcessos.filter((acesso) => {
    const userName =
      acesso.corretor?.first_name ||
      acesso.correspondente?.first_name ||
      acesso.administrador?.first_name ||
      "N/A";
    return userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-2xl font-bold mb-4">Lista de Acessos</h2>
      <p className="mb-4">
        Usuário logado: <span className="font-semibold">{userFirstName}</span>
      </p>

      {/* Barra de Pesquisa */}
      <div className="mb-4">
        <div className="flex items-center bg-gray-800 p-2 rounded">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Pesquisar por nome de usuário..."
            className="bg-gray-800 text-white focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="border border-gray-600 p-3">Nome do Usuário</th>
              <th className="border border-gray-600 p-3">IP</th>
              <th className="border border-gray-600 p-3">Referer</th>
              <th className="border border-gray-600 p-3">User Agent</th>
              <th className="border border-gray-600 p-3">Cidade</th>
              <th className="border border-gray-600 p-3">Região</th>
              <th className="border border-gray-600 p-3">País</th>
              <th className="border border-gray-600 p-3">Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {filteredAcessos.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="text-center border border-gray-600 p-3"
                >
                  Nenhum acesso encontrado.
                </td>
              </tr>
            ) : (
              filteredAcessos.map((acesso, index) => {
                const userName =
                  acesso.corretor?.first_name ||
                  acesso.correspondente?.first_name ||
                  acesso.administrador?.first_name ||
                  "N/A";

                return (
                  <tr
                    key={acesso.id}
                    className={`border-b border-gray-600 ${
                      index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                    }`}
                  >
                    <td className="border border-gray-600 p-3">{userName}</td>
                    <td className="border border-gray-600 p-3">{acesso.ip}</td>
                    <td className="border border-gray-600 p-3">
                      {acesso.referer}
                    </td>
                    <td className="border border-gray-600 p-3">
                      {acesso.userAgent}
                    </td>
                    <td className="border border-gray-600 p-3">
                      {acesso.geoCity || "N/A"}
                    </td>
                    <td className="border border-gray-600 p-3">
                      {acesso.geoRegion || "N/A"}
                    </td>
                    <td className="border border-gray-600 p-3">
                      {acesso.geoCountry || "N/A"}
                    </td>
                    <td className="border border-gray-600 p-3">
                      {new Date(acesso.timestamp).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AcessosList;
