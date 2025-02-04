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
          <i class="bi bi-bar-chart-steps" style={{ marginLeft: "8px" }}></i>
          لوحة المعلومات
        </button>
        <button className="nav-item" onClick={() => navigate("/boutique")}>
          <i class="bi bi-shop" style={{ marginLeft: "8px" }}></i>
          المتجر
        </button>
        <button className="nav-item" onClick={() => navigate("/mon-equipe")}>
          <i class="bi bi-people" style={{ marginLeft: "8px" }}></i>
          فريقي
        </button>
        <button className="nav-item" onClick={() => navigate("/historique")}>
          <i class="bi bi-clock-history" style={{ marginLeft: "8px" }}></i>
          سجل الطلبيات
        </button>
        <button className="nav-item" onClick={() => navigate("/payments")}>
          <i class="bi bi-wallet2" style={{ marginLeft: "8px" }}></i>
          الراتب
        </button>
        <button className="nav-item" onClick={() => navigate("/docs")}>
          <i class="bi bi-map" style={{ marginLeft: "8px" }}></i>
          المستند
        </button>
        <button className="nav-item" onClick={() => navigate("/settings")}>
          <i class="bi bi-sliders" style={{ marginLeft: "8px" }}></i>
          الإعدادات
        </button>
        <button className="nav-item" onClick={() => navigate("/helpdesk")}>
          <i class="bi bi-patch-question" style={{ marginLeft: "8px" }}></i>
           المساعدة
        </button>
        <button className="nav-item" onClick={() => navigate("/media")}>
          <i class="bi bi-images" style={{ marginLeft: "8px" }}></i>
          المنشورات
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
            <FiLogOut className="logout-icon" style={{ marginLeft: "8px" }}/>
            <span>تسجيل الخروج</span>
          </>
        )}
      </button>
    </div>
  );
});

export default LeftNavBar;
