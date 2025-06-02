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
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Filler);

const BarChart = ({ data, style }) => {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return null;
        // Gradiente neon azul para efeito futurista
        const gradient = ctx.createLinearGradient(
          0,
          chartArea.bottom,
          0,
          chartArea.top
        );
        gradient.addColorStop(0, "#0ea5e9");
        gradient.addColorStop(0.5, "#2563eb");
        gradient.addColorStop(1, "#a21caf");
        return gradient;
      },
      borderColor: "#38bdf8", // Neon blue border
      borderWidth: 3,
      borderRadius: 8, // Bordas arredondadas para barras
      hoverBackgroundColor: "#f472b6", // Neon pink ao passar mouse
      barPercentage: 0.7,
      categoryPercentage: 0.6,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowBlur: 10,
      shadowColor: "#0ea5e9",
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#38bdf8",
          font: {
            size: 16,
            family: "Montserrat, Arial, sans-serif",
            weight: "bold",
          },
          boxWidth: 20,
          boxHeight: 20,
        },
      },
      tooltip: {
        backgroundColor: "#18181b",
        borderColor: "#38bdf8",
        borderWidth: 2,
        titleColor: "#38bdf8",
        bodyColor: "#f472b6",
        cornerRadius: 8,
        padding: 12,
        titleFont: { family: "Montserrat, Arial, sans-serif", weight: "bold" },
        bodyFont: { family: "Montserrat, Arial, sans-serif" },
        displayColors: false,
      },
      title: {
        display: false,
      },
    },
    elements: {
      bar: {
        borderWidth: 3,
        borderRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(56,189,248,0.08)", // Neon blue grid
          borderColor: "#38bdf8",
        },
        ticks: {
          color: "#a5b4fc",
          font: {
            size: 14,
            family: "Montserrat, Arial, sans-serif",
            weight: "bold",
          },
        },
      },
      y: {
        grid: {
          color: "rgba(56,189,248,0.08)",
          borderColor: "#38bdf8",
        },
        ticks: {
          color: "#a5b4fc",
          font: {
            size: 14,
            family: "Montserrat, Arial, sans-serif",
            weight: "bold",
          },
        },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div className="w-full h-full">
      <Bar data={chartData} options={options} style={style} />
    </div>
  );
};

export default BarChart;
