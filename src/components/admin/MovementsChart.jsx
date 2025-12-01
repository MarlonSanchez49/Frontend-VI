import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar los componentes necesarios para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MovementsChart = ({ chartData }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false, // El título ya está en el componente padre
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // Asegurarse de que los ticks sean solo enteros si los datos son conteos
          precision: 0, 
        }
      },
    },
  };

  // El prop `chartData` debe tener la forma: { labels: [], datasets: [{ label: '', data: [] }] }
  // Esto se alinea con la data que se obtiene en el componente Dashboard.
  const data = {
    labels: chartData?.labels || [],
    datasets: chartData?.datasets || [],
  };

  return <Bar options={options} data={data} />;
};

export default MovementsChart;
