import React, { useState, useEffect, forwardRef } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./LeftNavBar.css";

const LeftNavBar = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isNewFeature, setIsNewFeature] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the new button
    const hasSeenNewFeature = localStorage.getItem("seen_delivery_prices");
    if (!hasSeenNewFeature) {
      setIsNewFeature(true);
      setTimeout(() => {
        setIsNewFeature(false);
        localStorage.setItem("seen_delivery_prices", "true");
      }, 8000); // Remove animation after 8 seconds
    }
  }, []);

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="left-navbar" ref={ref}>
      <nav className="nav-menu">
        <button className="nav-item" onClick={() => navigate("/dashboard")}>
          <i className="bi bi-bar-chart-steps" style={{ marginLeft: "8px" }}></i>
          لوحة المعلومات
        </button>
        <button className="nav-item" onClick={() => navigate("/boutique")}>
          <i className="bi bi-shop" style={{ marginLeft: "8px" }}></i>
          المتجر
        </button>
        <button className="nav-item" onClick={() => navigate("/mon-equipe")}>
          <i className="bi bi-people" style={{ marginLeft: "8px" }}></i>
          فريقي
        </button>
        <button className="nav-item" onClick={() => navigate("/historique")}>
          <i className="bi bi-clock-history" style={{ marginLeft: "8px" }}></i>
          سجل الطلبيات
        </button>
        <button className="nav-item" onClick={() => navigate("/payments")}>
          <i className="bi bi-wallet2" style={{ marginLeft: "8px" }}></i>
          الراتب
        </button>
        <button className="nav-item" onClick={() => navigate("/docs")}>
          <i className="bi bi-map" style={{ marginLeft: "8px" }}></i>
          المستند
        </button>
        
        {/* New Feature Button with Animation */}
        <button
          className={`nav-item ${isNewFeature ? "pulse-animation" : ""}`}
          onClick={() => navigate("/delivery-prices")}
        >
          <i className="bi bi-truck" style={{ marginLeft: "8px" }}></i>
          أسعار التوصيل
        </button>

        <button className="nav-item" onClick={() => navigate("/settings")}>
          <i className="bi bi-sliders" style={{ marginLeft: "8px" }}></i>
          الإعدادات
        </button>
        <button className="nav-item" onClick={() => navigate("/helpdesk")}>
          <i className="bi bi-patch-question" style={{ marginLeft: "8px" }}></i>
          المساعدة
        </button>
        <button className="nav-item" onClick={() => navigate("/media")}>
          <i className="bi bi-images" style={{ marginLeft: "8px" }}></i>
          المنشورات
        </button>
      </nav>

      <button className="logout2-button" onClick={handleLogout} disabled={loading}>
        {loading ? (
          <div className="spinner"></div>
        ) : (
          <>
            <FiLogOut className="logout-icon" style={{ marginLeft: "8px" }} />
            <span>تسجيل الخروج</span>
          </>
        )}
      </button>
    </div>
  );
});

export default LeftNavBar;
