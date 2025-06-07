// frontend/src/components/ListaCorrespondentes.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlinePicture,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineEye,
} from "react-icons/ai";
import { FaUserAlt } from "react-icons/fa";

const apiUrl = process.env.REACT_APP_API_URL;

const ListaCorrespondentes = () => {
  const [correspondentes, setCorrespondentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCorrespondente, setSelectedCorrespondente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'delete'

  useEffect(() => {
    fetchCorrespondentes();
  }, []);

  const fetchCorrespondentes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/correspondente/lista`);
      setCorrespondentes(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (correspondente) => {
    setSelectedCorrespondente(correspondente);
    setModalType('view');
    setShowModal(true);
  };

  const handleEdit = (correspondente) => {
    setSelectedCorrespondente(correspondente);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = (correspondente) => {
    setSelectedCorrespondente(correspondente);
    setModalType('delete');
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${apiUrl}/correspondente/${selectedCorrespondente.id}`);
      setCorrespondentes(correspondentes.filter(c => c.id !== selectedCorrespondente.id));
      setShowModal(false);
      setSelectedCorrespondente(null);
    } catch (error) {
      console.error('Erro ao deletar correspondente:', error);
      alert('Erro ao deletar correspondente');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCorrespondente(null);
    setModalType('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black flex items-center justify-center">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg text-white font-medium">
              Carregando correspondentes...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black flex items-center justify-center p-4">
        <div className="bg-red-900/20 backdrop-blur-sm rounded-2xl border border-red-500/50 p-8 shadow-2xl max-w-md w-full">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <AiOutlineUser className="text-red-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Ops! Algo deu errado
            </h3>
            <p className="text-red-400 text-lg">Erro: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Lista de Correspondentes
          </h1>
          <p className="text-gray-400 text-lg">
            Gerencie nossa equipe de correspondentes
          </p>
          <div className="mt-4 inline-flex items-center bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full">
            <FaUserAlt className="mr-2" />
            <span className="font-medium">
              {correspondentes.length} correspondentes cadastrados
            </span>
          </div>
        </div>

        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden lg:block bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-b border-gray-700/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                    <div className="flex items-center gap-2">
                      <AiOutlinePicture className="text-blue-400" />
                      Foto
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                    <div className="flex items-center gap-2">
                      <AiOutlineUser className="text-blue-400" />
                      Username
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                    <div className="flex items-center gap-2">
                      <FaUserAlt className="text-blue-400" />
                      Nome
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                    <div className="flex items-center gap-2">
                      <AiOutlineMail className="text-blue-400" />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                    <div className="flex items-center gap-2">
                      <AiOutlinePhone className="text-blue-400" />
                      Telefone
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-200">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {correspondentes.map((correspondente, index) => (
                  <tr
                    key={correspondente.id}
                    className={`border-b border-gray-700/50 hover:bg-blue-900/20 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-gray-800/20" : "bg-gray-800/30"
                    }`}
                  >
                    <td className="px-6 py-4">
                      {correspondente.photo ? (
                        <img
                          src={`${apiUrl}/uploads/imagem_correspondente/${correspondente.photo}`}
                          alt={correspondente.username}
                          className="w-14 h-14 rounded-full object-cover border-3 border-blue-500/50 shadow-lg"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-full flex items-center justify-center border-2 border-blue-500/50">
                          <AiOutlinePicture className="text-blue-400 text-xl" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium text-lg">
                        @{correspondente.username}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 font-medium">
                        {`${correspondente.first_name} ${correspondente.last_name}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{correspondente.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{correspondente.telefone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleView(correspondente)}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <AiOutlineEye className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleEdit(correspondente)}
                          className="p-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <AiOutlineEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(correspondente)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
                          title="Deletar"
                        >
                          <AiOutlineDelete className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards - Visible only on mobile */}
        <div className="lg:hidden space-y-4">
          {correspondentes.map((correspondente, index) => (
            <div
              key={correspondente.id}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl hover:border-blue-500/50 transition-all duration-300"
            >
              {/* Header do Card */}
              <div className="flex items-center space-x-4 mb-4">
                {correspondente.photo ? (
                  <img
                    src={`${apiUrl}/uploads/imagem_correspondente/${correspondente.photo}`}
                    alt={correspondente.username}
                    className="w-16 h-16 rounded-full object-cover border-3 border-blue-500/50 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-full flex items-center justify-center border-2 border-blue-500/50">
                    <AiOutlinePicture className="text-blue-400 text-2xl" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">
                    {`${correspondente.first_name} ${correspondente.last_name}`}
                  </h3>
                  <p className="text-blue-400 font-medium">
                    @{correspondente.username}
                  </p>
                </div>
              </div>

              {/* Informações do Card */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <AiOutlineMail className="text-blue-400" />
                  </div>
                  <span className="text-gray-300 flex-1">
                    {correspondente.email}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <AiOutlinePhone className="text-blue-400" />
                  </div>
                  <span className="text-gray-300 flex-1">
                    {correspondente.telefone}
                  </span>
                </div>
              </div>

              {/* Ações Mobile */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                <span className="inline-flex items-center bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                  <FaUserAlt className="mr-2 text-xs" />
                  Correspondente
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleView(correspondente)}
                    className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <AiOutlineEye className="text-lg" />
                  </button>
                  <button
                    onClick={() => handleEdit(correspondente)}
                    className="p-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <AiOutlineEdit className="text-lg" />
                  </button>
                  <button
                    onClick={() => handleDelete(correspondente)}
                    className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
                    title="Deletar"
                  >
                    <AiOutlineDelete className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 max-w-md w-full shadow-2xl">
              {modalType === 'view' && (
                <ViewModal correspondente={selectedCorrespondente} onClose={closeModal} />
              )}
              {modalType === 'edit' && (
                <EditModal 
                  correspondente={selectedCorrespondente} 
                  onClose={closeModal}
                  onUpdate={fetchCorrespondentes}
                />
              )}
              {modalType === 'delete' && (
                <DeleteModal 
                  correspondente={selectedCorrespondente} 
                  onClose={closeModal}
                  onConfirm={confirmDelete}
                />
              )}
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-12 text-center">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-blue-400">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Sistema Online</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-700"></div>
              <div className="text-gray-400">
                Última atualização: {new Date().toLocaleString("pt-BR")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Modal de Visualização
const ViewModal = ({ correspondente, onClose }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-white">Detalhes do Correspondente</h3>
      <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
    </div>
    <div className="space-y-3">
      <div className="text-center mb-4">
        {correspondente.photo ? (
          <img
            src={`${apiUrl}/uploads/imagem_correspondente/${correspondente.photo}`}
            alt={correspondente.username}
            className="w-20 h-20 rounded-full object-cover border-4 border-blue-500/50 mx-auto"
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-full flex items-center justify-center border-2 border-blue-500/50 mx-auto">
            <AiOutlinePicture className="text-blue-400 text-2xl" />
          </div>
        )}
      </div>
      <div><span className="text-gray-400">Nome:</span> <span className="text-white">{correspondente.first_name} {correspondente.last_name}</span></div>
      <div><span className="text-gray-400">Username:</span> <span className="text-white">@{correspondente.username}</span></div>
      <div><span className="text-gray-400">Email:</span> <span className="text-white">{correspondente.email}</span></div>
      <div><span className="text-gray-400">Telefone:</span> <span className="text-white">{correspondente.telefone}</span></div>
      {correspondente.address && <div><span className="text-gray-400">Endereço:</span> <span className="text-white">{correspondente.address}</span></div>}
      {correspondente.pix_account && <div><span className="text-gray-400">PIX:</span> <span className="text-white">{correspondente.pix_account}</span></div>}
    </div>
  </div>
);

// Componente Modal de Edição (versão corrigida)
const EditModal = ({ correspondente, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: correspondente.username || '',
    email: correspondente.email || '',
    first_name: correspondente.first_name || '',
    last_name: correspondente.last_name || '',
    phone: correspondente.telefone || '', // Mapear telefone para phone
    address: correspondente.address || '',
    pix_account: correspondente.pix_account || '',
    password: ''
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = new FormData();
    
    // Adicionar apenas campos que foram alterados ou são obrigatórios
    Object.keys(formData).forEach(key => {
      if (formData[key] && (key !== 'password' || formData[key].trim())) {
        submitData.append(key, formData[key]);
      }
    });
    
    if (photo) {
      submitData.append('photo', photo);
    }

    try {
      console.log('Enviando dados para correspondente ID:', correspondente.id);
      
      const response = await axios.put(`${apiUrl}/correspondente/${correspondente.id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Resposta do servidor:', response.data);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar correspondente:', error);
      console.error('Resposta do erro:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar correspondente';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">
          Editar Correspondente (ID: {correspondente.id})
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome"
            value={formData.first_name}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
            required
          />
          <input
            type="text"
            placeholder="Sobrenome"
            value={formData.last_name}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
            required
          />
        </div>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
          required
        />
        <input
          type="text"
          placeholder="Telefone"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
          required
        />
        <input
          type="text"
          placeholder="Endereço"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
        />
        <input
          type="text"
          placeholder="PIX/Conta"
          value={formData.pix_account}
          onChange={(e) => setFormData({...formData, pix_account: e.target.value})}
          className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
        />
        <input
          type="password"
          placeholder="Nova senha (deixe vazio para manter atual)"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
          className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
        />
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Componente Modal de Exclusão
const DeleteModal = ({ correspondente, onClose, onConfirm }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-white">Confirmar Exclusão</h3>
      <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
    </div>
    <div className="mb-6">
      <p className="text-gray-300 mb-4">
        Tem certeza que deseja deletar o correspondente <strong className="text-white">{correspondente.first_name} {correspondente.last_name}</strong>?
      </p>
      <p className="text-red-400 text-sm">Esta ação não pode ser desfeita.</p>
    </div>
    <div className="flex space-x-3">
      <button
        onClick={onClose}
        className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      >
        Deletar
      </button>
    </div>
  </div>
);

export default ListaCorrespondentes;
