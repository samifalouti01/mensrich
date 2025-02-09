import React from 'react';
import { useNavigate } from "react-router-dom";
import './LandingPage.css';

const Hero = () => {
    const navigate = useNavigate();

  return (
    <section className="hero" id="hero">
      <div className="containerz">
        <h1>انضم إلى Mensrich</h1>
        <p>ابدأ في كسب العمولات اليوم مع برنامج Mensrich سهل الاستخدام للتسويق بالعمولة. لا حاجة للاستثمار!</p>
        <button onClick={() => navigate("/login")} className="btn">سجل الآن</button>
      </div>
    </section>
  );
};

export default Hero;