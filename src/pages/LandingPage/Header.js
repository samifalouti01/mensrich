import React from 'react';
import { useNavigate } from "react-router-dom";
import './LandingPage.css';

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="containerw">
        <div className="logo">
            <img src="/Mencedes.svg" alt="Mensrich Logo" />
            <button onClick={() => navigate("/login")} className="btn">تسجيل الدخول</button>
        </div>
    </div>
  );
};

export default Header;