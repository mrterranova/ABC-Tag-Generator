import React from "react";
import { Link } from "react-router-dom";

function Navigation() {
  return (
    <nav className="nav">
      <div className="nav-logo"><b>Automated Book Categorization Generator</b></div>
      <ul className="nav-links">
        <li><Link className="nav-li" to="/">Home</Link></li>
        <li><Link className="nav-li" to="/form">Categorize</Link></li>
        <li><Link className="nav-li" to="/search">Search</Link></li>
        <li><Link className="nav-li" to="/report">Report</Link></li>
        <li><Link className="nav-li" to="/next-steps">Next Steps</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation;
