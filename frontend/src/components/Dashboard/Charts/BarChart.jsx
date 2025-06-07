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

const BarChart = ({ data, style, orientation = "vertical", showGradient = true }) => {
  const isHorizontal = orientation === "horizontal";
  
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset, datasetIndex) => ({
      ...dataset,
      backgroundColor: showGradient ? (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return null;
        
        // Diferentes gradientes para cada dataset
        const gradients = [
          { start: "rgba(59, 130, 246, 0.9)", middle: "rgba(99, 102, 241, 0.7)", end: "rgba(168, 85, 247, 0.5)" },
          { start: "rgba(34, 197, 94, 0.9)", middle: "rgba(59, 130, 246, 0.7)", end: "rgba(99, 102, 241, 0.5)" },
          { start: "rgba(251, 191, 36, 0.9)", middle: "rgba(245, 158, 11, 0.7)", end: "rgba(217, 119, 6, 0.5)" }
        ];
        
        const selectedGradient = gradients[datasetIndex % gradients.length];
        
        const gradient = ctx.createLinearGradient(
          isHorizontal ? chartArea.left : 0,
          isHorizontal ? 0 : chartArea.bottom,
          isHorizontal ? chartArea.right : 0,
          isHorizontal ? 0 : chartArea.top
        );
        
        gradient.addColorStop(0, selectedGradient.start);
        gradient.addColorStop(0.5, selectedGradient.middle);
        gradient.addColorStop(1, selectedGradient.end);
        
        return gradient;
      } : dataset.backgroundColor,
      borderColor: "rgba(59, 130, 246, 0.8)",
      borderWidth: 2,
      borderRadius: {
        topLeft: isHorizontal ? 0 : 8,
        topRight: isHorizontal ? 8 : 8,
        bottomLeft: isHorizontal ? 0 : 0,
        bottomRight: isHorizontal ? 8 : 0
      },
      borderSkipped: false,
      hoverBackgroundColor: "rgba(79, 70, 229, 0.8)",
      hoverBorderColor: "rgba(255, 255, 255, 0.8)",
      hoverBorderWidth: 3,
      barPercentage: 0.8,
      categoryPercentage: 0.9,
      // Adicionar efeito de sombra
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowBlur: 8,
      shadowColor: "rgba(59, 130, 246, 0.3)"
    }))
  };

  const options = {
    indexAxis: isHorizontal ? 'y' : 'x',
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
          pointStyle: "rectRounded",
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
            const value = context.parsed[isHorizontal ? 'x' : 'y'];
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            return [
              `${context.dataset.label || 'Valor'}: ${value.toLocaleString()}`,
              `Percentual: ${percentage}%`
            ];
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
          display: !isHorizontal,
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
          padding: 8,
          callback: function(value) {
            if (isHorizontal) {
              return value >= 1000 ? 
                (value / 1000).toFixed(1) + 'k' : 
                value.toLocaleString();
            }
            return this.getLabelForValue(value);
          }
        },
        beginAtZero: isHorizontal
      },
      y: {
        grid: {
          display: isHorizontal,
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
            if (!isHorizontal) {
              return value >= 1000 ? 
                (value / 1000).toFixed(1) + 'k' : 
                value.toLocaleString();
            }
            return this.getLabelForValue(value);
          }
        },
        beginAtZero: !isHorizontal
      }
    },
    animation: {
      duration: 1200,
      easing: "easeInOutCubic",
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default' ? 
          context.dataIndex * 150 : 0;
      }
    },
    hover: {
      animationDuration: 200
    },
    interaction: {
      intersect: false,
      mode: "index"
    },
    elements: {
      bar: {
        borderWidth: 2,
        borderRadius: 8,
        borderJoinStyle: "round"
      }
    }
  };

  // Calcular estatísticas para exibição mobile
  const totalValue = data.datasets[0]?.data.reduce((sum, val) => sum + val, 0) || 0;
  const maxValue = Math.max(...(data.datasets[0]?.data || [0]));
  const maxIndex = data.datasets[0]?.data.indexOf(maxValue) || 0;

  return (
    <div className="relative w-full h-full">
      <Bar data={chartData} options={options} style={style} />
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-xl blur-xl pointer-events-none"></div>
      
      {/* Mobile Stats Overlay */}
      {window.innerWidth < 768 && (
        <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-2">
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-blue-500/30 flex-1 min-w-0">
            <div className="text-xs text-blue-300 font-medium">Total</div>
            <div className="text-sm text-white font-bold truncate">
              {totalValue.toLocaleString()}
            </div>
          </div>
          <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-purple-500/30 flex-1 min-w-0">
            <div className="text-xs text-purple-300 font-medium">Maior</div>
            <div className="text-sm text-white font-bold truncate">
              {data.labels[maxIndex]} ({maxValue})
            </div>
          </div>
        </div>
      )}

      {/* Value Labels on Bars (Desktop Only) */}
      {window.innerWidth >= 768 && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Aqui você pode adicionar labels personalizados se necessário */}
        </div>
      )}
    </div>
  );
};

export default BarChart;
