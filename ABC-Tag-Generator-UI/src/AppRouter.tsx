import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Homescreen from './pages/Homescreen';
import Category from './pages/Category'; // import your form page
import Search from './pages/Search';
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";
import Chart from "./pages/Chart";
import NextSteps from "./pages/NextSteps";
import Navigation from './components/navigation'


const Home: React.FC = () => <Homescreen />;

const AppRouter: React.FC = () => {
  return (
    <Router>
      <nav>
        <Navigation/>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<Category />} />
        <Route path="/search" element={<Search />} />
        <Route path="/report" element={<Report />} />
        <Route path="/chart" element={<Chart />} />
        <Route path="/next-steps" element={<NextSteps />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
