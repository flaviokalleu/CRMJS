import React, { useEffect, useState } from "react";
import {
  FaUsersCog,
  FaUserFriends,
  FaUserPlus,
  FaClipboardList,
  FaSpinner,
  FaExclamationTriangle,
  FaChartLine,
  FaChartBar
} from "react-icons/fa";

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
  
  const [activeChart, setActiveChart] = useState("monthly"); // "monthly" ou "weekly"
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
        // Fetch main dashboard data
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

        // Fetch monthly data
        const monthlyData = await fetchData(
          `${process.env.REACT_APP_API_URL}/dashboard/monthly`
        );
        
        // Fetch weekly data
        const weeklyData = await fetchData(
          `${process.env.REACT_APP_API_URL}/dashboard/weekly`
        );
        
        // Fetch clients awaiting approval
        const clientesAguardando = await fetchData(
          `${process.env.REACT_APP_API_URL}/clientes?status=aguardando_aprovacao`
        );
        
        // Update dashboard data with awaiting clients
        setDashboardData(prev => ({
          ...prev,
          clientesAguardandoAprovacao: clientesAguardando || [],
          totalClientesAguardandoAprovacao: clientesAguardando.length || 0
        }));
        
        // Set chart data with gold theme
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

  // Toggle between monthly and weekly charts
  const toggleChartView = () => {
    setActiveChart(activeChart === "monthly" ? "weekly" : "monthly");
  };

  // Destructure for easier access
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
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 mx-auto text-blue-600 mb-4" />
          <p className="text-xl font-medium text-blue-500">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="bg-black p-8 rounded-lg shadow-lg max-w-lg w-full border border-blue-700">
          <FaExclamationTriangle className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h2 className="text-xl font-bold text-blue-500 text-center mb-2">Erro</h2>
          <p className="text-blue-200 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-500 mb-8 text-center border-b border-blue-900 pb-4">
          Dashboard Administrador
        </h1>
        
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <DashboardCard 
            title="Total Corretores" 
            value={totalCorretores}
            className="black border border-blue-800 shadow-lg hover:border-blue-600"
            titleClass="text-blue-500"
            valueClass="text-blue-400"
          >
            <FaUsersCog className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />
          </DashboardCard>
          
          <DashboardCard 
            title="Total Clientes" 
            value={totalClientes}
            className="black border border-blue-800 shadow-lg hover:border-blue-600"
            titleClass="text-blue-500"
            valueClass="text-blue-400"
          >
            <FaUserFriends className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />
          </DashboardCard>
          
          <DashboardCard 
            title="Total Correspondentes" 
            value={totalCorrespondentes}
            className="black border border-blue-800 shadow-lg hover:border-blue-600"
            titleClass="text-blue-500"
            valueClass="text-blue-400"
          >
            <FaClipboardList className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />
          </DashboardCard>
          
          <DashboardCard 
            title="Aguardando Aprovação" 
            value={totalClientesAguardandoAprovacao}
            className="black border border-blue-800 shadow-lg hover:border-blue-600"
            titleClass="text-blue-500"
            valueClass="text-blue-400"
          >
            <FaUserPlus className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />
          </DashboardCard>
        </div>
        
        {/* Single Chart Section with Toggle Button */}
        <div className="black p-4 md:p-6 rounded-lg shadow-lg transition-all hover:shadow-xl border border-blue-900 hover:border-blue-700 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-blue-500 flex items-center">
              <span className="mr-2">{activeChart === "monthly" ? "📈" : "📊"}</span> 
              {activeChart === "monthly" ? "Clientes Mensais" : "Clientes Semanais"}
            </h2>
            
            <button 
              onClick={toggleChartView}
              className="flex items-center bg-blue-700 hover:bg-blue-600 text-black px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {activeChart === "monthly" ? (
                <>
                  <FaChartBar className="mr-2" />
                  <span>Ver Semanal</span>
                </>
              ) : (
                <>
                  <FaChartLine className="mr-2" />
                  <span>Ver Mensal</span>
                </>
              )}
            </button>
          </div>
          
          <div className="bg-black p-4 rounded-lg border border-blue-900">
            {activeChart === "monthly" ? (
              chartData.monthly.labels.length > 0 && chartData.monthly.datasets.length > 0 ? (
                <LineChart data={chartData.monthly} />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-blue-400">Dados mensais não disponíveis</p>
                </div>
              )
            ) : (
              chartData.weekly.labels.length > 0 && chartData.weekly.datasets.length > 0 ? (
                <BarChart data={chartData.weekly} />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-blue-400">Dados semanais não disponíveis</p>
                </div>
              )
            )}
          </div>
        </div>
        
        {/* Top 5 Corretores Section */}
        <div className="black p-4 md:p-6 rounded-lg shadow-lg mb-8 transition-all hover:shadow-xl border border-blue-900 hover:border-blue-700">
          <h2 className="text-xl md:text-2xl font-bold text-blue-500 mb-4 flex items-center">
            <span className="mr-2">🏆</span> Top 5 Corretores
          </h2>
          <div className="bg-black p-4 rounded-lg border border-blue-900">
            <Top5Corretores corretores={top5Corretores} />
          </div>
        </div>
        
        {/* Clientes Aguardando Aprovação Section */}
        <div className="black p-4 md:p-6 rounded-lg shadow-lg transition-all hover:shadow-xl border border-blue-900 hover:border-blue-700">
          <h2 className="text-xl md:text-2xl font-bold text-blue-500 mb-4 flex items-center">
            <span className="mr-2">⏳</span> Clientes Aguardando Aprovação
          </h2>
          <div className="bg-black p-4 rounded-lg overflow-x-auto border border-blue-900">
            {clientesAguardandoAprovacao.length > 0 ? (
              <table className="min-w-full divide-y divide-blue-900">
                <thead className="black">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blue-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900">
                  {clientesAguardandoAprovacao.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-100">
                        {cliente.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button className="bg-blue-700 hover:bg-blue-600 text-black text-sm font-medium py-2 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                          Aguardando Aprovação
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-blue-400">Nenhum cliente aguardando aprovação</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdministrador;