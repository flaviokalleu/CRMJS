import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardCard from "./DashboardCard";
import LineChart from "./LineChart";
import BarChart from "./BarChart";
import {
  API_URL,
  useFetchMonthlyClients,
  useFetchWeeklyClients,
} from "./config";
import { useAuth } from "../context/AuthContext";

const DashboardCorretor = () => {
  const { user } = useAuth();
  const lineChartData = useFetchMonthlyClients();
  const barChartData = useFetchWeeklyClients();
  const [data, setData] = useState({
    totalCorretores: 0,
    totalClientes: 0,
    totalProprietarios: 0,
    clientesEsteMes: 0,
    clientesAguardando: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        return;
      }
      const response = await axios.get(`${API_URL}/dashboard/corretor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 font-poppins">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total de Corretores",
            value: data.totalCorretores,
            icon: "M10 6H14V10H18V14H14V18H10V14H6V10H10V6Z",
            color: "bg-gradient-to-r from-green-400 to-green-600",
          },
          {
            title: "Total de Clientes",
            value: data.totalClientes,
            icon: "M5 3H19V21H5V3M6 5V19H18V5H6M8 7H16V9H8V7M8 11H16V13H8V11Z",
            color: "bg-gradient-to-r from-blue-400 to-blue-600",
          },
          {
            title: "Total de Proprietários",
            value: data.totalProprietarios,
            icon: "M12 4.5L3 20H21L12 4.5Z",
            color: "bg-gradient-to-r from-yellow-400 to-yellow-600",
          },
          {
            title: "Clientes Este Mês",
            value: data.clientesEsteMes,
            icon: "M12 6V14H18L12 20L6 14H12V6Z",
            color: "bg-gradient-to-r from-red-400 to-red-600",
          },
        ].map((card, index) => (
          <DashboardCard
            key={index}
            icon={<path fill="currentColor" d={card.icon}></path>}
            title={card.title}
            value={card.value}
            iconColor={card.color}
            className="p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Clientes Cadastrados</h2>
          <LineChart data={lineChartData} />
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Distribuição dos Clientes</h2>
          <BarChart data={barChartData} />
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">
          Clientes Aguardando Aprovação
        </h2>
        <table className="w-full text-left text-white">
          <thead>
            <tr>
              <th className="border-b-2 border-gray-600 p-2">Nome</th>
              <th className="border-b-2 border-gray-600 p-2">
                Data de Solicitação
              </th>
              <th className="border-b-2 border-gray-600 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.clientesAguardando.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-700">
                <td className="border-b border-gray-600 p-2">{cliente.nome}</td>
                <td className="border-b border-gray-600 p-2">
                  {cliente.dataSolicitacao}
                </td>
                <td className="border-b border-gray-600 p-2">
                  {cliente.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardCorretor;
