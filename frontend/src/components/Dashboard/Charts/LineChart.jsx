// components/LineChart.js
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ data, style }) => {
  // Configuração dos dados com múltiplos tipos de gráficos
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        type: "line",
        label: "Tendência",
        data: data.datasets[0].data,
        borderColor: "#0EA5E9",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#0EA5E9",
        pointBorderColor: "#fff",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(14, 165, 233, 0.2)");
          gradient.addColorStop(1, "rgba(14, 165, 233, 0)");
          return gradient;
        },
        order: 1,
      },
      {
        type: "bar",
        label: "Volume",
        data: data.datasets[0].data.map((v) => v * 0.8), // Dados secundários
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(99, 102, 241, 0.3)");
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.1)");
          return gradient;
        },
        borderRadius: 4,
        order: 2,
      },
      {
        type: "line",
        label: "Meta",
        data: data.datasets[0].data.map((v) => v * 1.2), // Linha de meta
        borderColor: "#F472B6",
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        order: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#94A3B8",
          font: {
            family: "Inter, sans-serif",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#0EA5E9",
        borderWidth: 1,
        cornerRadius: 4,
        displayColors: true,
        titleFont: {
          size: 13,
          family: "Inter, sans-serif",
        },
        bodyFont: {
          size: 12,
          family: "Inter, sans-serif",
        },
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#94A3B8",
          font: {
            size: 12,
            family: "Inter, sans-serif",
          },
        },
      },
      y: {
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#94A3B8",
          font: {
            size: 12,
            family: "Inter, sans-serif",
          },
          callback: function (value) {
            return value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div className="w-full h-full bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
      <Chart type="bar" data={chartData} options={options} style={style} />
    </div>
  );
};

export default LineChart;
