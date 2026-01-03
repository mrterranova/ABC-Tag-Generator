import React from "react";
import { useLocation } from "react-router-dom";
import RadarChart from "../components/graph";
import { categoryLabels } from "../components/constants";

interface ChartState {
  title: string;
  author: string;
  description: string;
  category: string;
  mlCategory: string;
  scores: number[];
}

const Chart: React.FC = () => {
  const location = useLocation();
  const state = location.state as ChartState | null;

  if (!state) {
    return <p>No chart data available.</p>;
  }

  const { title, author, description, scores, mlCategory, category } = state;

  return (
    <>
    <div className="chart-page">
      <h1 className="chart-title">
        Category Radar for: {title} by <i>{author}</i>
      </h1>

      <div className="chart-container">
        <RadarChart labels={categoryLabels} data={scores} />
        <div className="score-table-container">
          <h2>Category Scores</h2>
          <table className="score-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, idx) => (
                <tr key={idx}>
                  <td>{categoryLabels[idx]}</td>
                  <td>{(score * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div className="analysis-container"><h2 >Description Used for Analysis:</h2>{description} <p><b>Top User Category Preference:</b> <i>{category}</i> vs. <b>Machine Learning Preference:</b> <i>{mlCategory}</i></p> </div>
    </>
  );
};

export default Chart;
