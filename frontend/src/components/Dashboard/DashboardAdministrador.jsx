import React, { useEffect, useState } from "react";
import {
  FaUsersCog,
  FaUserFriends,
  FaUserPlus,
  FaClipboardList,
} from "react-icons/fa"; // Ícones da biblioteca react-icons/fa

import LineChart from "./Charts/LineChart";
import BarChart from "./Charts/BarChart";
import DashboardCard from "../DashboardCard";
import Top5Corretores from "../Top5Corretores";

const DashboardAdministrador = () => {
  const [totalCorretores, setTotalCorretores] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalCorrespondentes, setTotalCorrespondentes] = useState(0);
  const [
    totalClientesAguardandoAprovacao,
    setTotalClientesAguardandoAprovacao,
  ] = useState(0);
  const [clientesAguardandoAprovacao, setClientesAguardandoAprovacao] =
    useState([]);
  const [monthlyData, setMonthlyData] = useState({ labels: [], datasets: [] });
  const [weeklyData, setWeeklyData] = useState({ labels: [], datasets: [] });
  const [top5Corretores, setTop5Corretores] = useState([]);
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
        const dashboardData = await fetchData(
          `${process.env.REACT_APP_API_URL}/dashboard`
        );
        setTotalCorretores(dashboardData.totalCorretores);
        setTotalClientes(dashboardData.totalClientes);
        setTotalCorrespondentes(dashboardData.totalCorrespondentes);
        setTotalClientesAguardandoAprovacao(
          dashboardData.totalClientesAguardandoAprovacao
        );
        setClientesAguardandoAprovacao(
          dashboardData.clientesAguardandoAprovacao || []
        );
        setTop5Corretores(dashboardData.top5Corretores || []);

        const monthlyData = await fetchData(
          `${process.env.REACT_APP_API_URL}/dashboard/monthly`
        );
        setMonthlyData({
          labels: [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro",
          ],
          datasets: [
            {
              label: "Clientes Mensais",
              data: monthlyData.monthlyData,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });

        const weeklyData = await fetchData(
          `${process.env.REACT_APP_API_URL}/dashboard/weekly`
        );
        setWeeklyData({
          labels: [
            "Domingo",
            "Segunda",
            "Terça",
            "Quarta",
            "Quinta",
            "Sexta",
            "Sábado",
          ],
          datasets: [
            {
              label: "Clientes Semanais",
              data: weeklyData.weeklyData,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
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

    fetchDashboardData();
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Dashboard Administrador
      </h2>
      {loading ? (
        <div className="text-center text-white">Carregando...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
            <DashboardCard title="Total Corretores" value={totalCorretores}>
              <FaUsersCog className="h-10 w-10 mr-4 text-blue-400" />
            </DashboardCard>
            <DashboardCard title="Total Clientes" value={totalClientes}>
              <FaUserFriends className="h-10 w-10 mr-4 text-green-400" />
            </DashboardCard>
            <DashboardCard
              title="Total Correspondentes"
              value={totalCorrespondentes}
            >
              <FaClipboardList className="h-10 w-10 mr-4 text-yellow-400" />
            </DashboardCard>
            <DashboardCard
              title="Clientes Aguardando Aprovação"
              value={totalClientesAguardandoAprovacao}
            >
              <FaUserPlus className="h-10 w-10 mr-4 text-red-400" />
            </DashboardCard>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-4">
                Clientes Mensais
              </h2>
              {monthlyData.labels.length > 0 &&
              monthlyData.datasets.length > 0 ? (
                <LineChart data={monthlyData} />
              ) : (
                <p className="text-white">Dados mensais não disponíveis</p>
              )}
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-4">
                Clientes Semanais
              </h2>
              {weeklyData.labels.length > 0 &&
              weeklyData.datasets.length > 0 ? (
                <BarChart data={weeklyData} />
              ) : (
                <p className="text-white">Dados semanais não disponíveis</p>
              )}
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Top 5 Corretores
            </h2>
            <Top5Corretores corretores={top5Corretores} />
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Clientes Aguardando Aprovação
            </h2>
            {clientesAguardandoAprovacao.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {clientesAguardandoAprovacao.map((cliente) => (
                    <tr key={cliente.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                        {cliente.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                        <button className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-200">
                          Aguardando Aprovação
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-white">Nenhum cliente aguardando aprovação</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAdministrador;
