import React, { useEffect, useState } from "react";
import {
  FaUsersCog,
  FaUserFriends,
  FaUserPlus,
  FaClipboardList,
  FaSpinner,
  FaExclamationTriangle,
  FaChartLine,
  FaChartBar,
} from "react-icons/fa";
import { motion } from "framer-motion";
import LineChart from "./Charts/LineChart";
import BarChart from "./Charts/BarChart";
import DashboardCard from "../DashboardCard";
import Top5Corretores from "../Top5Corretores";

const DashboardAdministrador = () => {
  const [dashboardData, setDashboardData] = useState({
    totalCorretores: 0,
    totalClientes: 0,
    totalCorrespondentes: 0,
    totalClientesAguardandoAprovacao: 0,
    clientesAguardandoAprovacao: [],
    top5Corretores: []
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
          top5Corretores: mainData.top5Corretores || []
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
                backgroundColor: "rgba(212, 175, 55, 0.2)",
                borderColor: "rgba(212, 175, 55, 1)",
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
                backgroundColor: "rgba(212, 175, 55, 0.3)",
                borderColor: "rgba(212, 175, 55, 1)",
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

  const toggleChartView = () => {
    setActiveChart(activeChart === "monthly" ? "weekly" : "monthly");
  };

  const {
    totalCorretores,
    totalClientes,
    totalCorrespondentes,
    totalClientesAguardandoAprovacao,
    clientesAguardandoAprovacao,
    top5Corretores
  } = dashboardData;

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
    <div className="bg-gray-900 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-blue-500 mb-8 text-center border-b border-blue-900 pb-4"
        >
          Dashboard Administrador
        </motion.h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DashboardCard 
              title="Total Corretores" 
              value={totalCorretores}
              icon={<FaUsersCog className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DashboardCard 
              title="Total Clientes" 
              value={totalClientes}
              icon={<FaUserFriends className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DashboardCard 
              title="Total Correspondentes" 
              value={totalCorrespondentes}
              icon={<FaClipboardList className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <DashboardCard 
              title="Aguardando Aprovação" 
              value={totalClientesAguardandoAprovacao}
              icon={<FaUserPlus className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />}
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl md:text-2xl font-bold text-blue-500 mb-4">
              Clientes Mensais
            </h2>
            {chartData.monthly.labels.length > 0 ? (
              <LineChart data={chartData.monthly} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">Dados não disponíveis</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl md:text-2xl font-bold text-blue-500 mb-4">
              Clientes Semanais
            </h2>
            {chartData.weekly.labels.length > 0 ? (
              <BarChart data={chartData.weekly} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">Dados não disponíveis</p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg mb-8"
        >
          <h2 className="text-xl md:text-2xl font-bold text-blue-500 mb-4">
            Top 5 Corretores
          </h2>
          <Top5Corretores corretores={top5Corretores} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-xl md:text-2xl font-bold text-blue-500 mb-4">
            Clientes Aguardando Aprovação
          </h2>
          {clientesAguardandoAprovacao.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {clientesAguardandoAprovacao.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {cliente.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className="px-3 py-1 rounded-full text-sm bg-yellow-200 text-yellow-800">
                        Aguardando
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400 text-center py-4">
              Nenhum cliente aguardando aprovação
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardAdministrador;