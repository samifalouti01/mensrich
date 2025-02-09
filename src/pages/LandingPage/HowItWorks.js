import React from 'react';
import './LandingPage.css';

const HowItWorks = () => {
  return (
    <section className="how-it-works" id="features">
      <div className="containerz">
        <h2>كيفية العمل</h2>
        <p>أربع خطوات بسيطة لبدء الكسب مع Mensrich</p>
        <div className="steps-grid">
          <div className="step-card">
            <i className="bi bi-person-plus"></i>
            <h3>انضم مجاناً</h3>
            <p>سجل باستخدام معرّف (ID) إحالة من عضو حالي.</p>
          </div>
          <div className="step-card">
            <i className="bi bi-share"></i>
            <h3>سوق للمنتجات</h3>
            <p>روّج لمنتجات Mensrich على شبكتك ووسائل التواصل الاجتماعي.</p>
          </div>
          <div className="step-card">
            <i className="bi bi-cash-stack"></i>
            <h3>اربح شهرياً</h3>
            <p>احصل على عمولات من المبيعات وأداء الفريق.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;