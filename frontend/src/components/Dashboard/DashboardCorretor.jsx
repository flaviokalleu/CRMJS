import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchDashboardData = async () => {
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
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
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
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
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
    };

    fetchDashboardData();
    fetchMonthlyData();
    fetchWeeklyData();
    fetchClientesAguardandoAprovacao();
  }, []);

  const handleAprovar = (clienteId) => {
    console.log("Aprovado:", clienteId);
  };

  const handleRejeitar = (clienteId) => {
    console.log("Rejeitado:", clienteId);
  };

  return (
    <div className="">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Dashboard Corretor
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="Clientes Totais" value={totalClientes} />
        <DashboardCard title="Clientes no mês" value={clientesNoMes} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">
            Clientes Mensais
          </h2>
          {monthlyData.labels.length > 0 && monthlyData.datasets.length > 0 ? (
            <LineChart data={monthlyData} />
          ) : (
            <p className="text-white">Dados mensais não disponíveis</p>
          )}
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">
            Clientes Semanais
          </h2>
          {weeklyData.labels.length > 0 && weeklyData.datasets.length > 0 ? (
            <BarChart data={weeklyData} />
          ) : (
            <p className="text-white">Dados semanais não disponíveis</p>
          )}
        </div>
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
                    {cliente.status === "aguardando_aprovacao" ? (
                      <span className="text-yellow-500">Aguardando</span>
                    ) : (
                      <span className="text-green-500">Aprovado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-white">Nenhum cliente aguardando aprovação.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardCorretor;
