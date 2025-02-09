import React from 'react';
import './LandingPage.css';

const Footer = () => {
  return (
    <div className="footer">
      <div className="containerz">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Mensrich</h3>
            <p>منصة التسويق بالعمولة الرائدة في الجزائر. ابدأ الكسب بدون استثمار اليوم.</p>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><a href="https://mensrich.com/privacy-policy"><i class="bi bi-shield-lock" style={{ marginRight: "10px" }}></i> <span>سياسة الخصوصية</span></a></li>
              <li><a href="https://mensrich.com/terms-and-conditions"><i class="bi bi-file-text" style={{ marginRight: "10px" }}></i> <span>الشروط والأحكام</span></a></li>
              <li><a href="#contact"><i class="bi bi-envelope" style={{ marginRight: "10px" }}></i> <span>اتصل بنا</span></a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Contact</h4>
            <p><i class="bi bi-envelope" style={{ marginRight: "10px" }}></i> <span>contact@mensrich.com</span></p>
            <p><i class="bi bi-geo-alt" style={{ marginRight: "10px" }}></i> <span>Bni Malek Villa 91 Skikda, Skikda 21000 - Algeria</span></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2023 Mensrich. <span>All rights reserved.</span></p>
        </div>
      </div>
    </div>
  );
};

export default Footer;