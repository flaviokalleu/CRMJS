import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  TrendingUp,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  Phone,
  Mail,
  Calendar,
  Activity,
  Star,
  Award,
  Zap,
  PieChart,
  LineChart as LineChartIcon
} from "lucide-react";

import LineChart from "./Charts/LineChart";
import BarChart from "./Charts/BarChart";

const DashboardCorrespondente = () => {
  const [totalCorretores, setTotalCorretores] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalCorrespondentes, setTotalCorrespondentes] = useState(0);
  const [totalClientesAguardandoAprovacao, setTotalClientesAguardandoAprovacao] = useState(0);
  const [clientesAguardandoAprovacao, setClientesAguardandoAprovacao] = useState([]);
  const [monthlyData, setMonthlyData] = useState({ labels: [], datasets: [] });
  const [weeklyData, setWeeklyData] = useState({ labels: [], datasets: [] });
  const [top5Usuarios, setTop5Usuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChart, setSelectedChart] = useState('monthly');

  const fetchData = async (url) => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Erro ao buscar dados do dashboard");
    }
    return await response.json();
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const fetchDashboardData = async () => {
    try {
      const dashboardData = await fetchData(
        `${process.env.REACT_APP_API_URL}/dashboard`
      );
      setTotalCorretores(dashboardData.totalCorretores);
      setTotalClientes(dashboardData.totalClientes);
      setTotalCorrespondentes(dashboardData.totalCorrespondentes);
      setTotalClientesAguardandoAprovacao(dashboardData.totalClientesAguardandoAprovacao);
      setClientesAguardandoAprovacao(dashboardData.clientesAguardandoAprovacao || []);
      setTop5Usuarios(dashboardData.top5Usuarios || []);

      const monthlyData = await fetchData(
        `${process.env.REACT_APP_API_URL}/dashboard/monthly`
      );
      setMonthlyData({
        labels: [
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
        ],
        datasets: [
          {
            label: "Clientes Mensais",
            data: monthlyData.monthlyData,
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
        ],
      });

      const weeklyData = await fetchData(
        `${process.env.REACT_APP_API_URL}/dashboard/weekly`
      );
      setWeeklyData({
        labels: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        datasets: [
          {
            label: "Clientes Semanais",
            data: weeklyData.weeklyData,
            backgroundColor: "rgba(16, 185, 129, 0.8)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      });

      const clientesAguardando = await fetchData(
        `${process.env.REACT_APP_API_URL}/clientes?status=aguardando_aprovacao`
      );
      setClientesAguardandoAprovacao(clientesAguardando || []);
      setTotalClientesAguardandoAprovacao(clientesAguardando.length || 0);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-white text-lg font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black flex items-center justify-center p-4">
        <div className="bg-red-900/20 backdrop-blur-sm rounded-2xl border border-red-500/50 p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Erro no Dashboard</h3>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const getCurrentChartData = () => {
    return selectedChart === 'monthly' ? monthlyData : weeklyData;
  };

  const getCurrentChartTitle = () => {
    return selectedChart === 'monthly' ? 'Clientes Mensais' : 'Clientes Semanais';
  };

  const getCurrentChartDescription = () => {
    return selectedChart === 'monthly' ? 'Crescimento ao longo do ano' : 'Atividade da semana atual';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black">
      <div className="p-4 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Dashboard Correspondente
            </h1>
            <p className="text-gray-400 flex items-center justify-center sm:justify-start gap-2">
              <Activity className="h-4 w-4" />
              Visão geral do sistema em tempo real
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('pt-BR')}
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 p-2 rounded-lg transition-colors disabled:opacity-50"
              title="Atualizar dados"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Estatísticas Gerais</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Total Corretores */}
            <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 backdrop-blur-sm rounded-2xl border border-blue-500/20 p-6 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Corretores</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{totalCorretores}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 text-sm">Ativos</span>
                  </div>
                </div>
                <div className="bg-blue-600/20 p-3 rounded-xl group-hover:bg-blue-600/30 transition-colors">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Total Clientes */}
            <div className="bg-gradient-to-br from-green-600/10 to-green-800/10 backdrop-blur-sm rounded-2xl border border-green-500/20 p-6 hover:border-green-500/50 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Clientes</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{totalClientes}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 text-sm">Registrados</span>
                  </div>
                </div>
                <div className="bg-green-600/20 p-3 rounded-xl group-hover:bg-green-600/30 transition-colors">
                  <UserCheck className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </div>

            {/* Total Correspondentes */}
            <div className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Correspondentes</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{totalCorrespondentes}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-400 text-sm">Parceiros</span>
                  </div>
                </div>
                <div className="bg-purple-600/20 p-3 rounded-xl group-hover:bg-purple-600/30 transition-colors">
                  <Award className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Aguardando Aprovação */}
            <div className="bg-gradient-to-br from-orange-600/10 to-orange-800/10 backdrop-blur-sm rounded-2xl border border-orange-500/20 p-6 hover:border-orange-500/50 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Aguardando</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{totalClientesAguardandoAprovacao}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="h-4 w-4 text-orange-400" />
                    <span className="text-orange-400 text-sm">Pendentes</span>
                  </div>
                </div>
                <div className="bg-orange-600/20 p-3 rounded-xl group-hover:bg-orange-600/30 transition-colors">
                  <UserPlus className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="xl:col-span-2 bg-gray-900/30 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-xl font-semibold text-white">{getCurrentChartTitle()}</h3>
                <p className="text-gray-400 text-sm">{getCurrentChartDescription()}</p>
              </div>
              
              {/* Chart Type Selector */}
              <div className="flex items-center bg-gray-800/50 rounded-xl p-1">
                <button
                  onClick={() => setSelectedChart('monthly')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedChart === 'monthly'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LineChartIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Mensal</span>
                </button>
                <button
                  onClick={() => setSelectedChart('weekly')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedChart === 'weekly'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm font-medium">Semanal</span>
                </button>
              </div>
            </div>
            
            {getCurrentChartData().labels.length > 0 && getCurrentChartData().datasets.length > 0 ? (
              <div className="h-80">
                {selectedChart === 'monthly' ? (
                  <LineChart data={getCurrentChartData()} />
                ) : (
                  <BarChart data={getCurrentChartData()} />
                )}
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Dados não disponíveis</p>
                  <p className="text-gray-500 text-sm">Tente atualizar os dados</p>
                </div>
              </div>
            )}
          </div>

          {/* Top 5 Usuarios */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-900/30 backdrop-blur-md rounded-3xl p-6 border border-blue-800/40 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-blue-200 mb-6 text-center flex items-center justify-center gap-2">
              <Zap className="h-6 w-6 text-yellow-400" />
              Top 5 Usuários
            </h2>
            
            {top5Usuarios.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {top5Usuarios.map((item, index) => {
                  const user = item.user || {};
                  const firstName = user.first_name || user.dataValues?.first_name || "";
                  const lastName = user.last_name || user.dataValues?.last_name || "";
                  const nomeCompleto =
                    firstName && lastName
                      ? `${firstName} ${lastName}`
                      : firstName || lastName || "Usuário não definido";
                  
                  return (
                    <motion.div
                      key={user.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-blue-950/60 rounded-xl p-4 border border-blue-800/30 hover:border-blue-600/50 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-700/30 to-blue-800/30 flex items-center justify-center border border-blue-600/30 group-hover:border-blue-500/50 transition-colors">
                          <span className="text-blue-300 font-bold text-lg">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-blue-200 font-medium text-sm leading-tight">
                            {nomeCompleto}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3 text-blue-400" />
                            <p className="text-blue-400 text-xs">
                              {item.clientes} cliente{item.clientes !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-blue-600/20 px-2 py-1 rounded-lg">
                            <Star className="h-4 w-4 text-yellow-400 mx-auto" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Star className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <p className="text-blue-400">Nenhum dado de ranking disponível</p>
                <p className="text-blue-500 text-sm mt-1">Aguardando dados dos usuários</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-6 w-6 text-orange-400" />
            <div>
              <h3 className="text-xl font-semibold text-white">Clientes Aguardando Aprovação</h3>
              <p className="text-gray-400 text-sm">
                {totalClientesAguardandoAprovacao} cliente{totalClientesAguardandoAprovacao !== 1 ? 's' : ''} pendente{totalClientesAguardandoAprovacao !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {clientesAguardandoAprovacao.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
              {clientesAguardandoAprovacao.map((cliente, index) => (
                <motion.div
                  key={cliente.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/30 rounded-2xl p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center group-hover:bg-orange-600/30 transition-colors">
                      <UserPlus className="h-6 w-6 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{cliente.nome}</p>
                      <p className="text-gray-400 text-sm">Cliente #{cliente.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="bg-orange-600/20 text-orange-400 px-3 py-1 rounded-full text-xs font-medium">
                      Pendente
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <button className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors" title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg transition-colors" title="Ligar">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg transition-colors" title="Email">
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Nenhum cliente aguardando aprovação</p>
              <p className="text-gray-500 text-sm mt-1">Todos os clientes estão aprovados!</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </div>
  );
};

export default DashboardCorrespondente;
