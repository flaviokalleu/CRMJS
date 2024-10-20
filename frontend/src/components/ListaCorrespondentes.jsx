// frontend/src/components/ListaCorrespondentes.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlinePicture,
} from "react-icons/ai";
import { FaUserAlt } from "react-icons/fa";

const apiUrl = process.env.REACT_APP_API_URL;

const ListaCorrespondentes = () => {
  const [correspondentes, setCorrespondentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCorrespondentes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/correspondente/lista`);
        setCorrespondentes(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCorrespondentes();
  }, []);

  if (loading)
    return (
      <div className="text-center text-lg text-gray-400">Carregando...</div>
    );
  if (error)
    return (
      <div className="text-center text-lg text-red-500">Erro: {error}</div>
    );

  return (
    <div className="overflow-x-auto bg-gray-900 text-white min-h-screen m-4">
      <table className="min-w-full bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="p-3 text-left">
              <AiOutlineUser className="inline mr-2" /> Username
            </th>
            <th className="p-3 text-left">
              <AiOutlineMail className="inline mr-2" /> Email
            </th>
            <th className="p-3 text-left">
              <FaUserAlt className="inline mr-2" /> Nome
            </th>
            <th className="p-3 text-left">
              <AiOutlinePhone className="inline mr-2" /> Telefone
            </th>
            <th className="p-3 text-left">
              <AiOutlinePicture className="inline mr-2" /> Foto
            </th>
          </tr>
        </thead>
        <tbody>
          {correspondentes.map((correspondente) => (
            <tr
              key={correspondente.id}
              className="border-b border-gray-600 hover:bg-gray-700"
            >
              <td className="p-3">{correspondente.username}</td>
              <td className="p-3">{correspondente.email}</td>
              <td className="p-3">{`${correspondente.first_name} ${correspondente.last_name}`}</td>
              <td className="p-3">{correspondente.phone}</td>
              <td className="p-3">
                {correspondente.photo ? (
                  <img
                    src={`${apiUrl}/uploads/imagem_correspondente/${correspondente.photo}`}
                    alt={correspondente.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center text-gray-400">
                    <AiOutlinePicture size={24} />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaCorrespondentes;
