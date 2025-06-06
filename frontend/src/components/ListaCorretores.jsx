// frontend/src/components/ListaCorretores.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  AiOutlineUser, 
  AiOutlineMail, 
  AiOutlinePhone, 
  AiOutlinePicture,
  AiOutlineSearch,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlineReload,
  AiOutlineFilter,
  AiOutlineClose
} from 'react-icons/ai';
import { FaUserAlt, FaSpinner, FaUsers, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiOutlineViewGrid, HiOutlineViewList } from 'react-icons/hi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const ListaCorretores = () => {
  // Estados principais
  const [corretores, setCorretores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 12;

  // Função para buscar corretores
  const fetchCorretores = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await axios.get(`${API_URL}/corretor`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          page,
          limit: itemsPerPage,
          search: search.trim()
        }
      });

      if (response.data && response.data.success) {
        setCorretores(response.data.data || []);
        setCurrentPage(response.data.pagination?.currentPage || 1);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems || 0);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('Erro ao buscar corretores:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Erro ao carregar lista de corretores'
      );
      setCorretores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar corretores na inicialização
  useEffect(() => {
    fetchCorretores(1, searchTerm);
  }, [fetchCorretores]);

  // Debounce para busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchCorretores(1, searchTerm);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchCorretores, currentPage]);

  // Função para mudar página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      fetchCorretores(newPage, searchTerm);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Função para recarregar dados
  const handleRefresh = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchCorretores(1, '');
  };

  // Função para editar corretor
  const handleEdit = (id) => {
    window.location.href = `/corretores/editar/${id}`;
  };

  // Função para visualizar corretor
  const handleView = (id) => {
    window.location.href = `/corretores/visualizar/${id}`;
  };

  // Função para gerar URL da imagem
  const getImageUrl = (photo) => {
    if (!photo) return null;
    return `${API_URL}/uploads/corretor/${photo}`;
  };

  // Componente de Loading elegante
  const LoadingComponent = () => (
    <div className="flex flex-col justify-center items-center py-16 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <FaUsers className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 text-lg" />
      </div>
      <p className="text-gray-400 text-lg font-medium">Carregando corretores...</p>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );

  // Componente de Erro elegante
  const ErrorComponent = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
        <AiOutlineReload className="text-red-500 text-3xl" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-200">Ops! Algo deu errado</h3>
        <p className="text-gray-400 max-w-md">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        Tentar novamente
      </button>
    </div>
  );

  // Componente de Estado Vazio elegante
  const EmptyStateComponent = () => (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
        <FaUsers className="text-gray-400 text-5xl" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-200">
          {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum corretor cadastrado'}
        </h3>
        <p className="text-gray-400 max-w-md">
          {searchTerm 
            ? 'Tente ajustar os termos da sua busca ou limpar os filtros'
            : 'Quando houver corretores cadastrados, eles aparecerão aqui'
          }
        </p>
      </div>
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="text-blue-400 hover:text-blue-300 font-medium underline transition-colors"
        >
          Limpar busca
        </button>
      )}
    </div>
  );

  // Componente Card para modo Grid
  const CorretorCard = ({ corretor }) => (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-700 hover:border-blue-500">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Foto */}
        <div className="relative">
          {corretor.photo ? (
            <img
              src={getImageUrl(corretor.photo)}
              alt={`${corretor.first_name} ${corretor.last_name}`}
              className="w-20 h-20 rounded-full object-cover border-4 border-gray-600"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ display: corretor.photo ? 'none' : 'flex' }}>
            {corretor.first_name?.[0]?.toUpperCase()}{corretor.last_name?.[0]?.toUpperCase()}
          </div>
        </div>

        {/* Informações */}
        <div className="space-y-2 w-full">
          <h3 className="text-lg font-semibold text-white truncate">
            {corretor.first_name} {corretor.last_name}
          </h3>
          <p className="text-blue-400 text-sm font-medium">@{corretor.username}</p>
          <div className="space-y-1 text-sm text-gray-300">
            <div className="flex items-center justify-center space-x-2">
              <AiOutlineMail className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{corretor.email}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <AiOutlinePhone className="text-gray-400 flex-shrink-0" />
              <span>{corretor.telefone}</span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex space-x-2 w-full">
          <button
            onClick={() => handleView(corretor.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <AiOutlineEye />
            <span>Ver</span>
          </button>
          <button
            onClick={() => handleEdit(corretor.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <AiOutlineEdit />
            <span>Editar</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Componente de Paginação elegante
  const PaginationComponent = () => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mt-8 p-6 bg-gray-800 rounded-xl">
        <div className="text-sm text-gray-400">
          Mostrando <span className="font-medium text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
          <span className="font-medium text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de{' '}
          <span className="font-medium text-white">{totalItems}</span> corretores
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            <FaChevronLeft />
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-500">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {page}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Lista de Corretores
              </h1>
              <p className="text-gray-400">
                Gerencie todos os corretores cadastrados no sistema
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Toggle de visualização */}
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <HiOutlineViewList className="text-xl" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <HiOutlineViewGrid className="text-xl" />
                </button>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <AiOutlineReload className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>
            </div>
          </div>

          {/* Barra de busca e filtros */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative flex-1">
                <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <AiOutlineClose />
                  </button>
                )}
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 border border-gray-700"
              >
                <AiOutlineFilter />
                <span>Filtros</span>
              </button>
            </div>

            {/* Estatísticas */}
            {!loading && !error && (
              <div className="flex items-center justify-between text-sm text-gray-400 bg-gray-800 px-4 py-2 rounded-lg">
                <span>
                  {totalItems} corretor{totalItems !== 1 ? 'es' : ''} encontrado{totalItems !== 1 ? 's' : ''}
                  {searchTerm && (
                    <span className="ml-2 text-blue-400">
                      para "{searchTerm}"
                    </span>
                  )}
                </span>
                <span>Página {currentPage} de {totalPages}</span>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {loading ? (
            <LoadingComponent />
          ) : error ? (
            <ErrorComponent message={error} onRetry={handleRefresh} />
          ) : corretores.length === 0 ? (
            <EmptyStateComponent />
          ) : (
            <div className="p-6">
              {viewMode === 'grid' ? (
                // Visualização em Grid
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {corretores.map((corretor) => (
                    <CorretorCard key={corretor.id} corretor={corretor} />
                  ))}
                </div>
              ) : (
                // Visualização em Lista/Tabela
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <AiOutlineUser />
                            <span>Corretor</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                          <div className="flex items-center space-x-2">
                            <AiOutlineMail />
                            <span>Email</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                          <div className="flex items-center space-x-2">
                            <AiOutlinePhone />
                            <span>Telefone</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {corretores.map((corretor) => (
                        <tr key={corretor.id} className="hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {corretor.photo ? (
                                  <img
                                    src={getImageUrl(corretor.photo)}
                                    alt={`${corretor.first_name} ${corretor.last_name}`}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold" style={{ display: corretor.photo ? 'none' : 'flex' }}>
                                  {corretor.first_name?.[0]?.toUpperCase()}{corretor.last_name?.[0]?.toUpperCase()}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {corretor.first_name} {corretor.last_name}
                                </div>
                                <div className="text-sm text-blue-400">@{corretor.username}</div>
                                <div className="text-sm text-gray-400 md:hidden">{corretor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">
                            {corretor.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden lg:table-cell">
                            {corretor.telefone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => handleView(corretor.id)}
                              className="inline-flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                            >
                              <AiOutlineEye />
                              <span className="hidden sm:inline">Ver</span>
                            </button>
                            <button
                              onClick={() => handleEdit(corretor.id)}
                              className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                            >
                              <AiOutlineEdit />
                              <span className="hidden sm:inline">Editar</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Paginação */}
        {!loading && !error && corretores.length > 0 && <PaginationComponent />}
      </div>
    </div>
  );
};

export default ListaCorretores;
