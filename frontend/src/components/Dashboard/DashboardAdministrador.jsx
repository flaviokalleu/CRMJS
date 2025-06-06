import React, { useEffect, useState } from "react";
import {
  FaUsersCog,
  FaUserFriends,
  FaUserPlus,
  FaClipboardList,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import LineChart from "./Charts/LineChart";
import BarChart from "./Charts/BarChart";

const DashboardAdministrador = () => {
  const [dashboardData, setDashboardData] = useState({
    totalCorretores: 0,
    totalClientes: 0,
    totalCorrespondentes: 0,
    totalClientesAguardandoAprovacao: 0,
    clientesAguardandoAprovacao: [],
    top5Usuarios: [] // <-- alterado aqui
  });

  const [chartData, setChartData] = useState({
    monthly: { labels: [], datasets: [] },
    weekly: { labels: [], datasets: [] }
  });

  const [activeChart, setActiveChart] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const mainData = await fetchData(
          `${process.env.REACT_APP_API_URL}/dashboard`
        );

        setDashboardData({
          totalCorretores: mainData.totalCorretores,
          totalClientes: mainData.totalClientes,
          totalCorrespondentes: mainData.totalCorrespondentes,
          totalClientesAguardandoAprovacao: mainData.totalClientesAguardandoAprovacao,
          clientesAguardandoAprovacao: mainData.clientesAguardandoAprovacao || [],
          top5Usuarios: mainData.top5Usuarios || [] // <-- alterado aqui
        });

        const monthlyData = await fetchData(
          `${process.env.REACT_APP_API_URL}/dashboard/monthly`
        );

        const weeklyData = await fetchData(
          `${process.env.REACT_APP_API_URL}/dashboard/weekly`
        );

        const clientesAguardando = await fetchData(
          `${process.env.REACT_APP_API_URL}/clientes?status=aguardando_aprovacao`
        );

        setDashboardData(prev => ({
          ...prev,
          clientesAguardandoAprovacao: clientesAguardando || [],
          totalClientesAguardandoAprovacao: clientesAguardando.length || 0
        }));

        setChartData({
          monthly: {
            labels: [
              "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
              "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
            ],
            datasets: [
              {
                label: "Clientes Mensais",
                data: monthlyData.monthlyData,
                backgroundColor: "rgba(30, 64, 175, 0.2)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 2,
                tension: 0.4
              },
            ],
          },
          weekly: {
            labels: [
              "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"
            ],
            datasets: [
              {
                label: "Clientes Semanais",
                data: weeklyData.weeklyData,
                backgroundColor: "rgba(30, 64, 175, 0.3)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 2
              },
            ],
          }
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const {
    totalCorretores,
    totalClientes,
    totalCorrespondentes,
    totalClientesAguardandoAprovacao,
    clientesAguardandoAprovacao,
    top5Usuarios // <-- alterado aqui
  } = dashboardData;

  // Chart selector
  const ChartSelector = () => (
    <div className="flex justify-center mb-6 gap-4">
      <button
        onClick={() => setActiveChart("monthly")}
        className={`px-6 py-2 rounded-full font-semibold transition-all duration-300
          ${activeChart === "monthly"
            ? "bg-gradient-radial from-blue-600 via-blue-400 to-blue-900 text-white shadow-lg scale-105"
            : "bg-blue-900 text-blue-300 hover:bg-blue-800 hover:text-white"}
        `}
      >
        Mensal
      </button>
      <button
        onClick={() => setActiveChart("weekly")}
        className={`px-6 py-2 rounded-full font-semibold transition-all duration-300
          ${activeChart === "weekly"
            ? "bg-gradient-radial from-blue-600 via-blue-400 to-blue-900 text-white shadow-lg scale-105"
            : "bg-blue-900 text-blue-300 hover:bg-blue-800 hover:text-white"}
        `}
      >
        Semanal
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 mx-auto text-blue-600 mb-4" />
          <p className="text-xl font-medium text-blue-500">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg w-full border border-blue-700">
          <FaExclamationTriangle className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h2 className="text-xl font-bold text-blue-500 text-center mb-2">Erro</h2>
          <p className="text-blue-200 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black py-10 px-2">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/30 backdrop-blur-md rounded-2xl p-8 border border-blue-800/40 shadow-lg flex flex-col items-center w-full max-w-5xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-blue-200 text-center">
            Dashboard Administrativo
          </h1>
          <p className="text-blue-400/80 text-center mt-2">
            Visão geral do sistema
          </p>
        </motion.div>

        {/* Cards */}
        <div className="w-full flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
          {[
            {
              title: "Total de Corretores",
              value: totalCorretores,
              icon: FaUsersCog,
              color: "blue",
            },
            {
              title: "Total de Clientes",
              value: totalClientes,
              icon: FaUserFriends,
              color: "indigo",
            },
            {
              title: "Correspondentes",
              value: totalCorrespondentes,
              icon: FaClipboardList,
              color: "cyan",
            },
            {
              title: "Aguardando Aprovação",
              value: totalClientesAguardandoAprovacao,
              icon: FaUserPlus,
              color: "sky",
            },
          ].map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-blue-900/60 to-blue-950/60 backdrop-blur-sm rounded-xl p-6 border border-blue-800/30 hover:border-blue-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 flex flex-col items-center"
            >
              <div className="flex items-center justify-center mb-3">
                <card.icon className="w-10 h-10 text-blue-400/80" />
              </div>
              <p className="text-sm font-medium text-blue-300/80 text-center">{card.title}</p>
              <p className="text-3xl font-bold text-blue-100 mt-2 text-center">{card.value}</p>
            </motion.div>
          ))}
          </div>
        </div>

       { /* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-900/30 backdrop-blur-md rounded-2xl p-8 border border-blue-800/40 shadow-lg flex flex-col items-center w-full max-w-5xl mx-auto"
          >
            <h2 className="text-xl font-semibold text-blue-200 mb-4">
              {activeChart === "monthly" ? "Evolução Mensal" : "Análise Semanal"}
            </h2>
            <ChartSelector />
            <div className="w-full h-[400px] flex-1 flex items-center">
              {/* O gráfico agora ocupa 100% da largura e altura do container */}
              <div className="w-full h-full">
                {activeChart === "monthly" ? (
                  <LineChart data={chartData.monthly} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <BarChart data={chartData.weekly} style={{ width: "100%", height: "100%" }} />
                )}
              </div>
            </div>
          </motion.div>

          {/* Top 5 Corretores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/30 backdrop-blur-md rounded-2xl p-8 border border-blue-800/40 shadow-lg w-full max-w-5xl mx-auto"
        >
          <h2 className="text-xl font-semibold text-blue-200 mb-6 text-center">
            Top 5 Usuários
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {top5Usuarios.map((item, index) => {
  const user = item.user || {};
  const firstName = user.first_name || user.dataValues?.first_name || "";
  const lastName = user.last_name || user.dataValues?.last_name || "";
  const nomeCompleto =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || lastName || "Usuário não definido";
  return (
    <div
      key={user.id || index}
      className="bg-blue-950/60 rounded-lg p-4 border border-blue-800/30 flex flex-col items-center"
    >
      <div className="w-10 h-10 rounded-full bg-blue-700/30 flex items-center justify-center mb-2">
        <span className="text-blue-300 font-bold">#{index + 1}</span>
      </div>
      <p className="text-blue-200 font-medium text-center">
        {nomeCompleto}
      </p>
      <p className="text-blue-400 text-sm text-center">
        {item.clientes} clientes
      </p>
    </div>
  );
})}
          </div>
        </motion.div>

        {/* Clientes Aguardando Aprovação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/30 backdrop-blur-md rounded-2xl p-8 border border-blue-800/40 shadow-lg w-full max-w-5xl mx-auto"
        >
          <h2 className="text-xl font-semibold text-blue-200 mb-6 text-center">
            Aguardando Aprovação
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-800/30">
                  <th className="text-left py-3 px-4 text-blue-300">Nome</th>
                  <th className="text-left py-3 px-4 text-blue-300">Status</th>
                  <th className="text-right py-3 px-4 text-blue-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientesAguardandoAprovacao.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-b border-blue-800/20 hover:bg-blue-900/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-blue-200">{cliente.nome}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-blue-400/20 text-blue-300">
                        Aguardando
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="px-4 py-1 rounded-md bg-blue-700/30 text-blue-300 hover:bg-blue-600/40 transition-colors">
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardAdministrador;