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

const LineChart = ({ data, style, showComparison = false }) => {
  // Configuração moderna dos dados
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        type: "line",
        label: data.datasets[0].label || "Evolução",
        data: data.datasets[0].data,
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)");
          gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.15)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
          return gradient;
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "rgba(255, 255, 255, 1)",
        pointBorderWidth: 3,
        pointHoverBackgroundColor: "rgba(79, 70, 229, 1)",
        pointHoverBorderColor: "rgba(255, 255, 255, 1)",
        pointHoverBorderWidth: 4,
        order: 1,
        // Adicionar sombra aos pontos
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 8,
        shadowColor: "rgba(59, 130, 246, 0.4)"
      }
    ],
  };

  // Adicionar linha de tendência se solicitado
  if (showComparison && data.datasets[0].data.length > 1) {
    const trendData = data.datasets[0].data.map((_, index, array) => {
      if (index === 0) return array[0];
      const growth = (array[index] - array[0]) / array.length;
      return Math.max(0, array[0] + (growth * index));
    });

    chartData.datasets.push({
      type: "line",
      label: "Tendência",
      data: trendData,
      borderColor: "rgba(168, 85, 247, 0.8)",
      backgroundColor: "transparent",
      borderWidth: 2,
      borderDash: [8, 4],
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 0,
      order: 0,
      tension: 0.1
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          color: "#E2E8F0",
          font: {
            family: "'Inter', 'Segoe UI', sans-serif",
            size: window.innerWidth < 768 ? 11 : 13,
            weight: "500"
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: window.innerWidth < 768 ? 15 : 20,
          boxWidth: window.innerWidth < 768 ? 8 : 12,
          boxHeight: window.innerWidth < 768 ? 8 : 12
        }
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#F1F5F9",
        bodyColor: "#E2E8F0",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 12,
        padding: 16,
        displayColors: true,
        titleFont: {
          family: "'Inter', 'Segoe UI', sans-serif",
          size: 14,
          weight: "600"
        },
        bodyFont: {
          family: "'Inter', 'Segoe UI', sans-serif",
          size: 13,
          weight: "400"
        },
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const value = context.parsed.y;
            const prevValue = context.dataIndex > 0 ? 
              context.dataset.data[context.dataIndex - 1] : value;
            const change = value - prevValue;
            const changePercent = prevValue !== 0 ? 
              ((change / prevValue) * 100).toFixed(1) : "0.0";
            
            return [
              `${context.dataset.label}: ${value.toLocaleString()}`,
              context.dataIndex > 0 ? 
                `Variação: ${change >= 0 ? '+' : ''}${change} (${changePercent}%)` : ''
            ].filter(Boolean);
          }
        },
        animation: {
          duration: 300
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(148, 163, 184, 0.1)",
          lineWidth: 1,
          drawBorder: false
        },
        border: {
          display: false
        },
        ticks: {
          color: "#94A3B8",
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
            family: "'Inter', 'Segoe UI', sans-serif",
            weight: "400"
          },
          maxRotation: window.innerWidth < 768 ? 45 : 0,
          padding: 8
        }
      },
      y: {
        grid: {
          display: true,
          color: "rgba(148, 163, 184, 0.1)",
          lineWidth: 1,
          drawBorder: false
        },
        border: {
          display: false
        },
        ticks: {
          color: "#94A3B8",
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
            family: "'Inter', 'Segoe UI', sans-serif",
            weight: "400"
          },
          padding: 8,
          callback: function(value) {
            return value >= 1000 ? 
              (value / 1000).toFixed(1) + 'k' : 
              value.toLocaleString();
          }
        },
        beginAtZero: true
      }
    },
    interaction: {
      intersect: false,
      mode: "index"
    },
    animation: {
      duration: 1500,
      easing: "easeInOutCubic",
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default' ? 
          context.dataIndex * 100 : 0;
      }
    },
    hover: {
      animationDuration: 200
    },
    elements: {
      point: {
        hoverRadius: 10
      },
      line: {
        borderJoinStyle: "round",
        borderCapStyle: "round"
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <Chart type="line" data={chartData} options={options} style={style} />
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-xl blur-xl pointer-events-none"></div>
      
      {/* Mobile Data Points */}
      {window.innerWidth < 768 && (
        <div className="absolute top-2 right-2 flex space-x-1">
          {data.datasets[0].data.slice(-3).map((value, index) => (
            <div key={index} className="bg-blue-500/20 backdrop-blur-sm rounded-lg px-2 py-1 border border-blue-500/30">
              <div className="text-xs text-blue-300 font-medium">
                {value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LineChart;
