import React from "react";
import { useLocation } from "react-router-dom";
import RadarChart from "../components/graph";
import { categoryLabels } from "../components/constants";

interface ChartState {
  title: string;
  author: string;
  description: string;
  scores: number[];
}

const Chart: React.FC = () => {
  const location = useLocation();
  const state = location.state as ChartState | null;

  if (!state) {
    return <p>No chart data available.</p>;
  }

  const { title, author, description, scores } = state;

  return (
    <div className="chart-page">
      <h1 className="chart-title">
        Category Radar for: {title} by <i>{author}</i>
      </h1>

      <div className="chart-container">
        <RadarChart labels={categoryLabels} data={scores} />
        <p>{description}</p>
      </div>
    </div>
  );
};

export default Chart;
