import "../App.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const handleStartHere = () => {
    navigate("/form"); // navigate to /explore route
  };
  return (
    <div className="home-container">
      <div className="hero-section">
        <img
          className="hero-background"
          src="imgs/bookshelf-home-1.jpg"
          alt="Bookshelf"
        />
        <div className="hero-overlay">
          <h1>Welcome to ABC Generator</h1>
          <p>Discover and categorize books effortlessly using advanced AI.</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h2>Why Choose ABC?</h2>
        <p>
          The Automatic Book Categorizer (ABC) uses advanced machine learning
          to analyze book descriptions, authors, and titles, and categorize
          each book into meaningful genres. Whether you're searching for your
          next favorite read, exploring specific topics, or just browsing, ABC
          makes it easier to find exactly what you're looking for.
        </p>
      </div>
      <div className="btn-container">
        <button className="start-btn" onClick={handleStartHere}>Start Here</button>
      </div>
    </div>
  );
}
