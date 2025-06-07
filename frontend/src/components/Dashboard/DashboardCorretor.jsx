import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  Activity,
  RefreshCw,
  Filter,
  Search,
  Download,
} from "lucide-react";
import LineChart from "./Charts/LineChart";
import BarChart from "./Charts/BarChart";
import DashboardCard from "../DashboardCard";

const DashboardCorretor = () => {
  const [monthlyData, setMonthlyData] = useState({ labels: [], datasets: [] });
  const [weeklyData, setWeeklyData] = useState({ labels: [], datasets: [] });
  const [totalClientes, setTotalClientes] = useState(0);
  const [clientesNoMes, setClientesNoMes] = useState(0);
  const [clientesAguardandoAprovacao, setClientesAguardandoAprovacao] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      y: -4,
      transition: {
        duration: 0.2,
      },
    },
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        setTotalClientes(result.totalClientes);
        setClientesNoMes(result.clientesEsteMes);
      } else {
        console.error("Erro ao buscar dados do dashboard:", result);
      }
    };

    const fetchMonthlyData = async () => {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/dashboard/monthly`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log(result);
      if (response.ok) {
        const labels = Array.from(
          { length: result.monthlyData.length },
          (_, index) => `Mês ${index + 1}`
        );
        setMonthlyData({
          labels,
          datasets: [
            {
              label: "Clientes Mensais",
              data: result.monthlyData,
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "rgba(59, 130, 246, 1)",
              pointBorderColor: "rgba(255, 255, 255, 1)",
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
            },
          ],
        });
      } else {
        console.error("Erro ao buscar dados mensais:", result);
        setMonthlyData({ labels: [], datasets: [] });
      }
    };

    const fetchWeeklyData = async () => {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/dashboard/weekly`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log(result);
      if (response.ok) {
        const labels = [
          "Domingo",
          "Segunda",
          "Terça",
          "Quarta",
          "Quinta",
          "Sexta",
          "Sábado",
        ];
        setWeeklyData({
          labels,
          datasets: [
            {
              label: "Clientes Semanais",
              data: result.weeklyData,
              backgroundColor: labels.map((_, index) =>
                `rgba(${59 + index * 20}, ${130 + index * 15}, 246, 0.8)`
              ),
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        });
      } else {
        console.error("Erro ao buscar dados semanais:", result);
        setWeeklyData({ labels: [], datasets: [] });
      }
    };

    const fetchClientesAguardandoAprovacao = async () => {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/clientes?status=aguardando_aprovacao`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log(result);
      if (response.ok) {
        setClientesAguardandoAprovacao(result);
      } else {
        console.error("Erro ao buscar clientes aguardando aprovação:", result);
        setClientesAguardandoAprovacao([]);
      }
      setLoading(false);
    };

    fetchDashboardData();
    fetchMonthlyData();
    fetchWeeklyData();
    fetchClientesAguardandoAprovacao();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);

    const token = localStorage.getItem("authToken");

    try {
      // Refresh all data
      const [dashboardRes, monthlyRes, weeklyRes, clientesRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.REACT_APP_API_URL}/dashboard/monthly`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.REACT_APP_API_URL}/dashboard/weekly`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.REACT_APP_API_URL}/clientes?status=aguardando_aprovacao`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [dashboardData, monthlyResult, weeklyResult, clientesResult] = await Promise.all([
        dashboardRes.json(),
        monthlyRes.json(),
        weeklyRes.json(),
        clientesRes.json(),
      ]);

      // Update states
      if (dashboardRes.ok) {
        setTotalClientes(dashboardData.totalClientes);
        setClientesNoMes(dashboardData.clientesEsteMes);
      }

      if (monthlyRes.ok) {
        const labels = Array.from(
          { length: monthlyResult.monthlyData.length },
          (_, index) => `Mês ${index + 1}`
        );
        setMonthlyData({
          labels,
          datasets: [
            {
              label: "Clientes Mensais",
              data: monthlyResult.monthlyData,
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "rgba(59, 130, 246, 1)",
              pointBorderColor: "rgba(255, 255, 255, 1)",
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
            },
          ],
        });
      }

      if (weeklyRes.ok) {
        const labels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        setWeeklyData({
          labels,
          datasets: [
            {
              label: "Clientes Semanais",
              data: weeklyResult.weeklyData,
              backgroundColor: labels.map((_, index) =>
                `rgba(${59 + index * 20}, ${130 + index * 15}, 246, 0.8)`
              ),
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        });
      }

      if (clientesRes.ok) {
        setClientesAguardandoAprovacao(clientesResult);
      }
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAprovar = (clienteId) => {
    console.log("Aprovado:", clienteId);
  };

  const handleRejeitar = (clienteId) => {
    console.log("Rejeitado:", clienteId);
  };

  // Filter clientes based on search and status
  const filteredClientes = clientesAguardandoAprovacao.filter((cliente) => {
    const matchesSearch =
      cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = filterStatus === "all" || cliente.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats cards data
  const statsCards = [
    {
      title: "Total de Clientes",
      value: totalClientes,
      icon: Users,
      color: "blue",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Clientes este Mês",
      value: clientesNoMes,
      icon: Calendar,
      color: "green",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Aguardando Aprovação",
      value: clientesAguardandoAprovacao.length,
      icon: Clock,
      color: "yellow",
      trend: "-3%",
      trendUp: false,
    },
    {
      title: "Taxa de Conversão",
      value: "87%",
      icon: TrendingUp,
      color: "purple",
      trend: "+5%",
      trendUp: true,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-white">
            Carregando Dashboard
          </h2>
          <p className="text-blue-300 mt-2">Buscando dados atualizados...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Dashboard
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 ml-2">
                  Corretor
                </span>
              </h1>
              <p className="text-blue-200">
                Acompanhe suas métricas e gerencie seus clientes
              </p>
            </div>

            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-md border border-blue-500/30 text-blue-300 hover:text-blue-200 px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Atualizar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600/20 hover:bg-green-600/30 backdrop-blur-md border border-green-500/30 text-green-300 hover:text-green-200 px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </motion.button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-white/5 backdrop-blur-md rounded-xl p-1 w-fit">
            {[
              { id: "overview", label: "Visão Geral", icon: BarChart3 },
              { id: "analytics", label: "Análises", icon: Activity },
              { id: "clients", label: "Clientes", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-blue-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {statsCards.map((card, index) => {
                  const Icon = card.icon;
                  const colorClasses = {
                    blue: "from-blue-600/20 to-blue-800/20 border-blue-500/30 text-blue-300",
                    green: "from-green-600/20 to-green-800/20 border-green-500/30 text-green-300",
                    yellow: "from-yellow-600/20 to-yellow-800/20 border-yellow-500/30 text-yellow-300",
                    purple: "from-purple-600/20 to-purple-800/20 border-purple-500/30 text-purple-300",
                  };

                  return (
                    <motion.div
                      key={index}
                      variants={cardVariants}
                      whileHover="hover"
                      className={`bg-gradient-to-br ${colorClasses[card.color]} backdrop-blur-md border rounded-2xl p-6 relative overflow-hidden group`}
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`w-12 h-12 bg-${card.color}-500/20 rounded-xl flex items-center justify-center`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <span
                            className={`text-sm font-medium flex items-center ${
                              card.trendUp ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            <TrendingUp
                              className={`w-4 h-4 mr-1 ${
                                card.trendUp ? "" : "rotate-180"
                              }`}
                            />
                            {card.trend}
                          </span>
                        </div>

                        <div className="text-3xl font-bold text-white mb-1">
                          {typeof card.value === "number"
                            ? card.value.toLocaleString()
                            : card.value}
                        </div>

                        <div className="text-sm text-gray-300">{card.title}</div>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                  );
                })}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  variants={itemVariants}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">
                      Clientes Mensais
                    </h3>
                    <div className="flex items-center text-blue-300">
                      <Activity className="w-5 h-5 mr-2" />
                      <span className="text-sm">Últimos meses</span>
                    </div>
                  </div>

                  {monthlyData.labels.length > 0 && monthlyData.datasets.length > 0 ? (
                    <div className="h-64">
                      <LineChart data={monthlyData} />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Dados mensais não disponíveis</p>
                      </div>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">
                      Clientes Semanais
                    </h3>
                    <div className="flex items-center text-purple-300">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      <span className="text-sm">Esta semana</span>
                    </div>
                  </div>

                  {weeklyData.labels.length > 0 && weeklyData.datasets.length > 0 ? (
                    <div className="h-64">
                      <BarChart data={weeklyData} />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Dados semanais não disponíveis</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === "clients" && (
            <motion.div
              key="clients"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Clientes Aguardando Aprovação */}
              <motion.div
                variants={itemVariants}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Clientes Aguardando Aprovação
                      </h3>
                      <p className="text-blue-200">
                        {clientesAguardandoAprovacao.length} cliente(s) aguardando
                        sua aprovação
                      </p>
                    </div>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="all">Todos</option>
                        <option value="aguardando_aprovacao">Aguardando</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="rejeitado">Rejeitado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {filteredClientes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Cliente
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredClientes.map((cliente) => (
                          <motion.tr
                            key={cliente.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="hover:bg-white/5 transition-colors duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                                  {cliente.nome?.charAt(0)?.toUpperCase() || "C"}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">
                                    {cliente.nome || "Nome não informado"}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {cliente.email || "Email não informado"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  cliente.status === "aguardando_aprovacao"
                                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                    : cliente.status === "aprovado"
                                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full mr-2 ${
                                    cliente.status === "aguardando_aprovacao"
                                      ? "bg-yellow-400"
                                      : cliente.status === "aprovado"
                                      ? "bg-green-400"
                                      : "bg-red-400"
                                  }`}
                                />
                                {cliente.status === "aguardando_aprovacao"
                                  ? "Aguardando"
                                  : cliente.status === "aprovado"
                                  ? "Aprovado"
                                  : "Rejeitado"}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 p-2 rounded-lg transition-all duration-200"
                                  title="Visualizar"
                                >
                                  <Eye className="w-4 h-4" />
                                </motion.button>

                                {cliente.status === "aguardando_aprovacao" && (
                                  <>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleAprovar(cliente.id)}
                                      className="bg-green-600/20 hover:bg-green-600/30 text-green-300 hover:text-green-200 p-2 rounded-lg transition-all duration-200"
                                      title="Aprovar"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </motion.button>

                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleRejeitar(cliente.id)}
                                      className="bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 p-2 rounded-lg transition-all duration-200"
                                      title="Rejeitar"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </motion.button>
                                  </>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      Nenhum cliente encontrado
                    </h3>
                    <p className="text-gray-400">
                      {searchTerm || filterStatus !== "all"
                        ? "Tente ajustar os filtros de busca"
                        : "Todos os clientes foram processados!"}
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardCorretor;
