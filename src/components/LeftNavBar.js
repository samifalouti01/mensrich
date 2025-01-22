import React, { useState, forwardRef } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
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
          <i class="bi bi-bar-chart-steps" style={{ marginRight: "8px" }}></i>
          Dashboard
        </button>
        <button className="nav-item" onClick={() => navigate("/mon-equipe")}>
          <i class="bi bi-people" style={{ marginRight: "8px" }}></i>
          My Team
        </button>
        <button className="nav-item" onClick={() => navigate("/historique")}>
          <i class="bi bi-clock-history" style={{ marginRight: "8px" }}></i>
          Order History
        </button>
        <button className="nav-item" onClick={() => navigate("/payments")}>
          <i class="bi bi-wallet2" style={{ marginRight: "8px" }}></i>
          Paiment
        </button>
        <button className="nav-item" onClick={() => navigate("/presentation")}>
          <i class="bi bi-map" style={{ marginRight: "8px" }}></i>
          User Guide
        </button>
        <button className="nav-item" onClick={() => navigate("/settings")}>
          <i class="bi bi-sliders" style={{ marginRight: "8px" }}></i>
          Settings
        </button>
        <button className="nav-item" onClick={() => navigate("/helpdesk")}>
          <i class="bi bi-patch-question" style={{ marginRight: "8px" }}></i>
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
