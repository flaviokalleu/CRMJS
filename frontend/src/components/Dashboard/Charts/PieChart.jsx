import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data: propData, style }) => {
  const defaultData = {
    labels: ["Aprovados", "Pendentes", "Rejeitados"],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",   // Green for approved
          "rgba(251, 191, 36, 0.8)",  // Yellow for pending  
          "rgba(239, 68, 68, 0.8)"    // Red for rejected
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(251, 191, 36, 1)", 
          "rgba(239, 68, 68, 1)"
        ],
        borderWidth: 3,
        hoverBackgroundColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(239, 68, 68, 1)"
        ],
        hoverBorderColor: "rgba(255, 255, 255, 0.8)",
        hoverBorderWidth: 4,
        cutout: "65%", // Makes it a doughnut chart
        tension: 0.4
      }
    ]
  };

  const chartData = propData || defaultData;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#E2E8F0",
          font: {
            family: "'Inter', 'Segoe UI', sans-serif",
            size: window.innerWidth < 768 ? 11 : 13,
            weight: "500"
          },
          padding: window.innerWidth < 768 ? 15 : 20,
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: window.innerWidth < 768 ? 8 : 12,
          boxHeight: window.innerWidth < 768 ? 8 : 12,
          generateLabels: function(chart) {
            const data = chart.data;
            const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
            
            return data.labels.map((label, index) => {
              const value = data.datasets[0].data[index];
              const percentage = ((value / total) * 100).toFixed(1);
              
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: data.datasets[0].backgroundColor[index],
                strokeStyle: data.datasets[0].borderColor[index],
                lineWidth: 2,
                hidden: false,
                index: index
              };
            });
          }
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
            const data = context.dataset.data;
            const total = data.reduce((sum, value) => sum + value, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return [`Quantidade: ${context.parsed}`, `Percentual: ${percentage}%`];
          }
        },
        animation: {
          duration: 300
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: "easeInOutCubic"
    },
    hover: {
      animationDuration: 200
    },
    elements: {
      arc: {
        borderAlign: "inner",
        borderJoinStyle: "round"
      }
    },
    interaction: {
      intersect: false
    }
  };

  const total = chartData.datasets[0].data.reduce((sum, value) => sum + value, 0);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Chart Container */}
      <div className="relative flex-1 min-h-0">
        <Doughnut data={chartData} options={options} style={style} />
        
        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
              {total.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm text-blue-300 font-medium">
              Total de Clientes
            </div>
          </div>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 blur-2xl pointer-events-none opacity-50"></div>
      </div>

      {/* Mobile Stats Cards */}
      <div className="block md:hidden mt-4 space-y-2">
        {chartData.labels.map((label, index) => {
          const value = chartData.datasets[0].data[index];
          const percentage = ((value / total) * 100).toFixed(1);
          const colors = [
            { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30" },
            { bg: "bg-yellow-500/20", text: "text-yellow-300", border: "border-yellow-500/30" },
            { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/30" }
          ];
          
          return (
            <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${colors[index].bg} border ${colors[index].border} backdrop-blur-sm`}>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}></div>
                <span className={`text-sm font-medium ${colors[index].text}`}>{label}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-sm">{value}</div>
                <div className={`text-xs ${colors[index].text}`}>{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PieChart;
