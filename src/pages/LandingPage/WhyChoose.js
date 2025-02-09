import React from 'react';
import './LandingPage.css';

const WhyChoose = () => {
  return (
    <section className="why-choose" id="about">
      <div className="containerz">
        <h2>لماذا تختار Mensrich؟</h2>
        <p>انضم إلى آلاف الشركات التابعة الناجحة في الجزائر</p>
        <div className="reasons-grid">
          <div className="reason-card">
            <i className="bi bi-diagram-3"></i>
            <h3>كوِّن فريقك</h3>
            <p>أنشئ شبكتك ونمِّها. اكسب من نجاح فريقك.</p>
          </div>
          <div className="reason-card">
            <i className="bi bi-wallet2"></i>
            <h3>صفر استثمار</h3>
            <p>ابدأ رحلتك دون أي تكاليف مسبقة. ركّز على النمو من اليوم الأول.</p>
          </div>
          <div className="reason-card">
            <i className="bi bi-graph-up"></i>
            <h3>الدخل الشهري</h3>
            <p>اكسب عمولات منتظمة من مبيعاتك وأداء فريقك.</p>
          </div>
          <div className="reason-card">
            <i className="bi bi-flag"></i>
            <h3>حصرياً للجزائريين</h3>
            <p>منصة مصممة خصيصاً للسوق والمجتمع الجزائري.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;