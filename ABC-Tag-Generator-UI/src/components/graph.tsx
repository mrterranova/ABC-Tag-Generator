// RadarChart.tsx
import React from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
  labels: string[];
  data: number[];
}

const RadarChart: React.FC<RadarChartProps> = ({ labels, data }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: "Category Scores",
        data,
        backgroundColor: "rgba(34, 202, 236, 0.2)",
        borderColor: "rgba(34, 202, 236, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(34, 202, 236, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 1,
        ticks: {
          stepSize: 0.1,
        },
      },
    },
  };

  return (
    <div className="radar-chart">
      <Radar data={chartData} options={options} />
    </div>
  );
};

export default RadarChart;
