import React, { useState, forwardRef } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./LeftNavBar.css";

const LeftNavBar = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 2000);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="left-navbar" ref={ref}>
      <nav className="nav-menu">
        <button className="nav-item" onClick={() => navigate("/dashboard")}>
          <i class="bi bi-bar-chart-steps" style={{ marginRight: "8px" }}></i>
          {t("dashboard")}
        </button>
        <button className="nav-item" onClick={() => navigate("/mon-equipe")}>
          <i class="bi bi-people" style={{ marginRight: "8px" }}></i>
          {t("myTeam")}
        </button>
        <button className="nav-item" onClick={() => navigate("/historique")}>
          <i class="bi bi-clock-history" style={{ marginRight: "8px" }}></i>
          {t("orderHistory")}
        </button>
        <button className="nav-item" onClick={() => navigate("/payments")}>
          <i class="bi bi-wallet2" style={{ marginRight: "8px" }}></i>
          {t("payment")}
        </button>
        <button className="nav-item" onClick={() => navigate("/presentation")}>
          <i class="bi bi-map" style={{ marginRight: "8px" }}></i>
          {t("userGuide")}
        </button>
        <button className="nav-item" onClick={() => navigate("/settings")}>
          <i class="bi bi-sliders" style={{ marginRight: "8px" }}></i>
          {t("settings")}
        </button>
        <button className="nav-item" onClick={() => navigate("/helpdesk")}>
          <i class="bi bi-patch-question" style={{ marginRight: "8px" }}></i>
          {t("helpdesk")}
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
            <span>{t("logout")}</span>
          </>
        )}
      </button>
    </div>
  );
});

export default LeftNavBar;
