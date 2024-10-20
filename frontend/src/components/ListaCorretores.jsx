// frontend/src/components/ListaCorretores.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlinePicture } from 'react-icons/ai';
import { FaUserAlt } from 'react-icons/fa';

const apiUrl = process.env.REACT_APP_API_URL;

const ListaCorretores = () => {
  const [corretores, setCorretores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCorretores = async () => {
      try {
        const response = await axios.get(`${apiUrl}/listadecorretores`);
        setCorretores(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCorretores();
  }, []);

  const handleEdit = (id) => {
    window.location.href = `/corretores/editar/${id}`;
  };

  if (loading) return <div className="text-center text-lg text-gray-400">Carregando...</div>;
  if (error) return <div className="text-center text-lg text-red-500">Erro: {error}</div>;

  return (
    <div className="overflow-x-auto bg-gray-900 text-white min-h-screen m-4">
      <table className="min-w-full bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="p-3 text-left"><AiOutlineUser className="inline mr-2" /> Username</th>
            <th className="p-3 text-left"><AiOutlineMail className="inline mr-2" /> Email</th>
            <th className="p-3 text-left"><FaUserAlt className="inline mr-2" /> Nome</th>
            <th className="p-3 text-left"><AiOutlinePhone className="inline mr-2" /> Telefone</th>
            <th className="p-3 text-left"><AiOutlinePicture className="inline mr-2" /> Foto</th>
            <th className="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {corretores.map((corretor) => (
            <tr key={corretor.id} className="border-b border-gray-600 hover:bg-gray-700">
              <td className="p-3">{corretor.username}</td>
              <td className="p-3">{corretor.email}</td>
              <td className="p-3">{`${corretor.first_name} ${corretor.last_name}`}</td>
              <td className="p-3">{corretor.telefone}</td>
              <td className="p-3">
                {corretor.photo ? (
                  <img
                    src={`${apiUrl}/uploads/imagem_corretor/${corretor.photo}`}
                    alt={corretor.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center text-gray-400">
                    <AiOutlinePicture size={24} />
                  </div>
                )}
              </td>
              <td className="p-3">
                <button
                  onClick={() => handleEdit(corretor.id)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaCorretores;
