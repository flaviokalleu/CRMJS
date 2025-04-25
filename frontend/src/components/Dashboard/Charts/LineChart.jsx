// components/LineChart.js
import React, { useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Registrar as escalas e o Filler
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      fill: true, // Preencher área sob a linha
      borderColor: "rgba(75, 192, 192, 1)", // Cor da linha
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
        gradient.addColorStop(0, "rgba(75, 192, 192, 0.4)"); // Cor do degradê (início)
        gradient.addColorStop(1, "rgba(75, 192, 192, 0)"); // Cor do degradê (fim)
        return gradient;
      },
    })),
  };

  useEffect(() => {
    return () => {
      // Cleanup for the chart to prevent the "Canvas is already in use" error
      ChartJS.unregister();
    };
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Gráfico de Clientes Cadastrados",
      },
    },
    elements: {
      line: {
        tension: 0.4, // Curvatura da linha
        borderWidth: 3, // Espessura da linha
      },
      point: {
        radius: 5, // Tamanho dos pontos
        hoverRadius: 7, // Tamanho dos pontos ao passar o mouse
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
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
