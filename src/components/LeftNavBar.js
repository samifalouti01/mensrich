import React, { useState, forwardRef } from "react";
import { 
  FaChartBar, FaQuestion, FaHistory, FaUsers, FaDollarSign, FaTags, 
  FaCog, FaFileAlt, FaCreativeCommonsSampling 
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./LeftNavBar.css";

const LeftNavBar = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 2000);
  };

  return (
    <div className="left-navbar" ref={ref}>
      <nav className="nav-menu">
        <button className="nav-item" onClick={() => navigate("/dashboard")}>
          <FaChartBar className="nav-icon" />
          Dashboard
        </button>
        <button className="nav-item" onClick={() => navigate("/catalogue")}>
          <FaTags className="nav-icon" />
          Catalog
        </button>
        <button className="nav-item" onClick={() => navigate("/mon-equipe")}>
          <FaUsers className="nav-icon" />
          My Team
        </button>
        <button className="nav-item" onClick={() => navigate("/historique")}>
          <FaHistory className="nav-icon" />
          Order History
        </button>
        <button className="nav-item" onClick={() => navigate("/payments")}>
          <FaDollarSign className="nav-icon" />
          Paiment
        </button>
        <button className="nav-item" onClick={() => navigate("/presentation")}>
          <FaFileAlt className="nav-icon" />
          User Guide
        </button>
        <button className="nav-item" onClick={() => navigate("/creative")}>
          <FaCreativeCommonsSampling className="nav-icon" />
          Creatifs
        </button>
        <button className="nav-item" onClick={() => navigate("/settings")}>
          <FaCog className="nav-icon" />
          Settings
        </button>
        <button className="nav-item" onClick={() => navigate("/helpdesk")}>
          <FaQuestion className="nav-icon" />
          Helpdesk
        </button>
      </nav>
      <button
        className="logout2-button"
        onClick={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <div className="spinner"></div>
        ) : (
          <>
            <FiLogOut className="logout-icon" />
            <span>Logout</span>
          </>
        )}
      </button>
    </div>
  );
});

export default LeftNavBar;
