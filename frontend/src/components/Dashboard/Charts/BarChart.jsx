// components/BarChart.js
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Registrar as escalas
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarChart = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) {
          return null;
        }
        const gradient = ctx.createLinearGradient(
          0,
          chartArea.bottom,
          0,
          chartArea.top
        );
        gradient.addColorStop(0, "rgba(54, 162, 235, 0.6)"); // Cor do degradê (início)
        gradient.addColorStop(1, "rgba(54, 162, 235, 0)"); // Cor do degradê (fim)
        return gradient;
      },
      borderColor: "rgba(54, 162, 235, 1)", // Cor da borda
      borderWidth: 2, // Espessura da borda
      hoverBackgroundColor: "rgba(54, 162, 235, 0.8)", // Cor ao passar o mouse
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Gráfico de Clientes por Semana",
      },
    },
    elements: {
      bar: {
        borderWidth: 2, // Espessura da borda das barras
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // Cor das linhas da grade
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // Cor das linhas da grade
        },
      },
    },
  };

  return (
    <div className="bg-black p-6 rounded-lg shadow-lg">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
