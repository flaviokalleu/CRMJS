// src/components/AcessosList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Search, 
  Users, 
  Globe, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Calendar,
  Filter,
  BarChart3,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const AcessosList = () => {
  const [acessos, setAcessos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userFirstName, setUserFirstName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: '',
    country: '',
    period: '7d',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    fetchAcessos();
    fetchStats();
    fetchUserData();
  }, [pagination.currentPage, filters]);

  const fetchAcessos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      });

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/acessos?${params}`
      );
      const data = await response.json();
      
      setAcessos(data.acessos || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      setError("Erro ao buscar acessos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/acessos/stats?period=${filters.period}`
      );
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/user/me`
      );
      const data = await response.json();
      setUserFirstName(data.first_name);
    } catch (err) {
      console.error("Erro ao buscar dados do usuário:", err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getUserName = (acesso) => {
    // Como não temos dados do usuário, usar o user_id ou "Anônimo"
    return acesso.user_id ? `Usuário #${acesso.user_id}` : 'Anônimo';
  };

  const getUserRole = (acesso) => {
    // Como não temos role, usar apenas "Usuário" ou "Visitante"
    return acesso.user_id ? 'Usuário' : 'Visitante';
  };

  const getRoleColor = (acesso) => {
    // Simplificar as cores
    return acesso.user_id 
      ? 'bg-blue-500/20 text-blue-400' 
      : 'bg-gray-500/20 text-gray-400';
  };

  // Filtrar acessos localmente por nome
  const filteredAcessos = acessos.filter((acesso) => {
    const userName = getUserName(acesso);
    return userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading && acessos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando acessos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="text-xl mb-2">❌ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Lista de Acessos
              </h1>
              <p className="text-gray-300 mt-2">
                Usuário logado: <span className="font-semibold text-blue-400">{userFirstName}</span>
              </p>
            </div>
            
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              {showStats ? 'Ocultar' : 'Mostrar'} Estatísticas
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Estatísticas */}
        {showStats && stats && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estatísticas ({filters.period})
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 text-sm font-medium">Total de Acessos</p>
                <p className="text-2xl font-bold text-white">{stats.totalAcessos}</p>
              </div>
              
              <div className="bg-green-500/20 rounded-lg p-4">
                <p className="text-green-400 text-sm font-medium">Corretores</p>
                <p className="text-2xl font-bold text-white">{stats.acessosPorRole?.corretor || 0}</p>
              </div>
              
              <div className="bg-purple-500/20 rounded-lg p-4">
                <p className="text-purple-400 text-sm font-medium">Correspondentes</p>
                <p className="text-2xl font-bold text-white">{stats.acessosPorRole?.correspondente || 0}</p>
              </div>
              
              <div className="bg-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-400 text-sm font-medium">Visitantes</p>
                <p className="text-2xl font-bold text-white">{stats.acessosPorRole?.anonimo || 0}</p>
              </div>
            </div>

            {/* Dispositivos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Dispositivos</h4>
                <div className="space-y-2">
                  {Object.entries(stats.topDispositivos || {}).map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device)}
                        <span className="text-gray-300">{device}</span>
                      </div>
                      <span className="text-white font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Top Países</h4>
                <div className="space-y-2">
                  {stats.topPaises?.slice(0, 5).map((country) => (
                    <div key={country.geoCountry} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{country.geoCountry}</span>
                      </div>
                      <span className="text-white font-semibold">{country.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca por nome */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Buscar por nome
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Digite o nome..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filtro por role */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de usuário
              </label>
              <select
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="corretor">Corretores</option>
                <option value="correspondente">Correspondentes</option>
                <option value="administrador">Administradores</option>
              </select>
            </div>

            {/* Filtro por período */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Período
              </label>
              <select
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
              >
                <option value="24h">Últimas 24h</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>

            {/* Items por página */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Items por página
              </label>
              <select
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                value={pagination.itemsPerPage}
                onChange={(e) => {
                  setPagination(prev => ({ 
                    ...prev, 
                    itemsPerPage: parseInt(e.target.value),
                    currentPage: 1
                  }));
                }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          {/* Mobile Cards */}
          <div className="block lg:hidden">
            {filteredAcessos.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum acesso encontrado</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {filteredAcessos.map((acesso) => (
                  <div key={acesso.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{getUserName(acesso)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(acesso)}`}>
                          {getUserRole(acesso)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        {getDeviceIcon(acesso.deviceType)}
                        <span className="text-xs">{acesso.deviceType}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Globe className="w-3 h-3" />
                        <span>{acesso.ip} • {acesso.geoCity || 'N/A'}, {acesso.geoCountry || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(acesso.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                      {acesso.page && (
                        <div className="text-blue-400 text-xs">
                          Página: {acesso.page}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Usuário</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">IP / Localização</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Dispositivo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Página</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {filteredAcessos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Nenhum acesso encontrado</p>
                    </td>
                  </tr>
                ) : (
                  filteredAcessos.map((acesso, index) => (
                    <tr key={acesso.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      index % 2 === 0 ? 'bg-white/2' : ''
                    }`}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{getUserName(acesso)}</div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getRoleColor(acesso)}`}>
                            {getUserRole(acesso)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-300">
                          <div className="font-medium">{acesso.ip}</div>
                          <div className="text-sm text-gray-400">
                            {acesso.geoCity && acesso.geoCountry 
                              ? `${acesso.geoCity}, ${acesso.geoCountry}`
                              : 'Localização não disponível'
                            }
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          {getDeviceIcon(acesso.deviceType)}
                          <span>{acesso.deviceType || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-blue-400 text-sm">
                          {acesso.page || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">
                          {new Date(acesso.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-gray-400 text-sm">
              Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} até{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{' '}
              {pagination.totalItems} resultados
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-white px-3">
                {pagination.currentPage} de {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcessosList;
